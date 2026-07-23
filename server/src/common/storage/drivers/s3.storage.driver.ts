import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { PutObjectInput, StorageDriver, StoredObject } from '../storage.types'

@Injectable()
export class S3StorageDriver implements StorageDriver {
    private client: S3Client | null = null
    private readonly bucket: string
    private readonly publicBaseUrl?: string

    constructor(private readonly config: ConfigService) {
        this.bucket = this.config.get<string>('storage.s3.bucket') || ''
        this.publicBaseUrl = this.config.get<string>('storage.s3.publicBaseUrl')
    }

    private getClient(): S3Client {
        if (this.client) return this.client
        const accessKeyId = this.config.get<string>('storage.s3.accessKeyId')
        const secretAccessKey = this.config.get<string>(
            'storage.s3.secretAccessKey',
        )
        const region = this.config.get<string>('storage.s3.region') || 'auto'
        const endpoint = this.config.get<string>('storage.s3.endpoint')
        const forcePathStyle =
            this.config.get<boolean>('storage.s3.forcePathStyle') === true

        if (!this.bucket || !accessKeyId || !secretAccessKey) {
            throw new BadRequestException(
                'S3 storage is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY (and optional S3_ENDPOINT/S3_REGION).',
            )
        }

        this.client = new S3Client({
            region,
            endpoint: endpoint || undefined,
            forcePathStyle,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        })
        return this.client
    }

    getPublicUrl(key: string): string {
        const clean = key.replace(/^\/+/, '')
        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl.replace(/\/$/, '')}/${clean}`
        }
        const endpoint = this.config.get<string>('storage.s3.endpoint')
        if (endpoint) {
            return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${clean}`
        }
        const region = this.config.get<string>('storage.s3.region') || 'us-east-1'
        return `https://${this.bucket}.s3.${region}.amazonaws.com/${clean}`
    }

    async put(input: PutObjectInput & { key: string }): Promise<StoredObject> {
        const client = this.getClient()
        await client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: input.key,
                Body: input.buffer,
                ContentType: input.mimeType,
            }),
        )
        return {
            key: input.key,
            url: this.getPublicUrl(input.key),
            mimeType: input.mimeType,
            sizeBytes: input.buffer.length,
            width: 0,
            height: 0,
        }
    }
}
