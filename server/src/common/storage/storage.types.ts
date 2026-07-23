export type StoragePurpose = 'product' | 'proof' | 'logo' | 'general'

export type StoredObject = {
    key: string
    url: string
    mimeType: string
    sizeBytes: number
    width: number
    height: number
}

export type PutObjectInput = {
    buffer: Buffer
    mimeType: string
    purpose: StoragePurpose
    originalName?: string
}

export interface StorageDriver {
    put(input: PutObjectInput & { key: string }): Promise<StoredObject>
    getPublicUrl(key: string): string
}
