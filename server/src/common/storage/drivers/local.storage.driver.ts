import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { promises as fs } from 'fs'
import * as path from 'path'
import type { PutObjectInput, StorageDriver, StoredObject } from '../storage.types'

@Injectable()
export class LocalStorageDriver implements StorageDriver {
    private readonly root: string
    private readonly publicBaseUrl: string

    constructor(private readonly config: ConfigService) {
        const dir = this.config.get<string>('storage.localDir') || 'uploads'
        this.root = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir)
        this.publicBaseUrl =
            this.config.get<string>('storage.publicBaseUrl') ||
            'http://127.0.0.1:3001/v1/media/file'
    }

    async ensureReady() {
        await fs.mkdir(this.root, { recursive: true })
    }

    getPublicUrl(key: string): string {
        const clean = key.replace(/^\/+/, '')
        const base = this.publicBaseUrl.replace(/\/$/, '')
        // Query form avoids Nest catch-all path quirks.
        return `${base}?key=${encodeURIComponent(clean)}`
    }

    async put(input: PutObjectInput & { key: string }): Promise<StoredObject> {
        await this.ensureReady()
        const full = path.join(this.root, input.key)
        await fs.mkdir(path.dirname(full), { recursive: true })
        await fs.writeFile(full, input.buffer)
        return {
            key: input.key,
            url: this.getPublicUrl(input.key),
            mimeType: input.mimeType,
            sizeBytes: input.buffer.length,
            width: 0,
            height: 0,
        }
    }

    async read(key: string): Promise<Buffer> {
        const full = path.join(this.root, key)
        return fs.readFile(full)
    }
}
