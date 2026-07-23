import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { LocalStorageDriver } from './drivers/local.storage.driver'
import { S3StorageDriver } from './drivers/s3.storage.driver'
import type {
    PutObjectInput,
    StorageDriver,
    StoragePurpose,
    StoredObject,
} from './storage.types'
import { validateImageBuffer } from './utils/image-validation'

@Injectable()
export class StorageService {
    private readonly driver: StorageDriver

    constructor(
        private readonly config: ConfigService,
        private readonly local: LocalStorageDriver,
        private readonly s3: S3StorageDriver,
    ) {
        const mode = this.config.get<'local' | 's3'>('storage.driver') || 'local'
        this.driver = mode === 's3' ? this.s3 : this.local
    }

    async uploadImage(
        buffer: Buffer,
        purpose: StoragePurpose,
        originalName?: string,
    ): Promise<StoredObject> {
        const limits = this.limitsFor(purpose)
        const validated = validateImageBuffer(buffer, limits)
        const ext =
            validated.mimeType === 'image/png'
                ? 'png'
                : validated.mimeType === 'image/webp'
                  ? 'webp'
                  : 'jpg'
        const safeBase = (originalName || 'upload')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]+/g, '-')
            .slice(0, 40)
        const key = `${purpose}/${new Date().toISOString().slice(0, 10)}/${safeBase}-${randomUUID()}.${ext}`

        const stored = await this.driver.put({
            buffer,
            mimeType: validated.mimeType,
            purpose,
            originalName,
            key,
        })

        return {
            ...stored,
            width: validated.width,
            height: validated.height,
            mimeType: validated.mimeType,
            sizeBytes: validated.sizeBytes,
        }
    }

    getPublicUrl(key: string): string {
        return this.driver.getPublicUrl(key)
    }

    async readLocal(key: string): Promise<Buffer | null> {
        if (!(this.driver instanceof LocalStorageDriver)) return null
        try {
            return await this.driver.read(key)
        } catch {
            return null
        }
    }

    private limitsFor(purpose: StoragePurpose) {
        const minWidth = this.config.get<number>('storage.limits.minWidth') ?? 400
        const minHeight =
            this.config.get<number>('storage.limits.minHeight') ?? 400
        const maxEdge = this.config.get<number>('storage.limits.maxEdge') ?? 4096
        const maxBytes =
            purpose === 'proof'
                ? (this.config.get<number>('storage.limits.maxBytesProof') ??
                  3_000_000)
                : purpose === 'logo'
                  ? (this.config.get<number>('storage.limits.maxBytesLogo') ??
                    2_000_000)
                  : (this.config.get<number>('storage.limits.maxBytesProduct') ??
                    5_000_000)

        // Proof screenshots can be shorter; product needs square-ish min.
        return {
            maxBytes,
            minWidth: purpose === 'proof' ? Math.min(600, minWidth) : minWidth,
            minHeight: purpose === 'proof' ? Math.min(400, minHeight) : minHeight,
            maxEdge,
        }
    }
}
