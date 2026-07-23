export default (): {
    storage: {
        driver: 'local' | 's3'
        localDir: string
        publicBaseUrl: string
        s3: {
            bucket: string
            region: string
            endpoint?: string
            accessKeyId?: string
            secretAccessKey?: string
            forcePathStyle: boolean
            publicBaseUrl?: string
        }
        limits: {
            maxBytesProduct: number
            maxBytesProof: number
            maxBytesLogo: number
            minWidth: number
            minHeight: number
            maxEdge: number
        }
    }
} => ({
    storage: {
        driver: (process.env.STORAGE_DRIVER === 's3' ? 's3' : 'local') as
            | 'local'
            | 's3',
        localDir: process.env.STORAGE_LOCAL_DIR || 'uploads',
        publicBaseUrl:
            process.env.STORAGE_PUBLIC_BASE_URL ||
            `http://127.0.0.1:${process.env.HTTP_PORT || 3001}/v1/media/file`,
        s3: {
            bucket: process.env.S3_BUCKET || '',
            region: process.env.S3_REGION || 'auto',
            endpoint: process.env.S3_ENDPOINT || undefined,
            accessKeyId: process.env.S3_ACCESS_KEY_ID || undefined,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || undefined,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || undefined,
        },
        limits: {
            maxBytesProduct: Number(process.env.STORAGE_MAX_BYTES_PRODUCT || 5_000_000),
            maxBytesProof: Number(process.env.STORAGE_MAX_BYTES_PROOF || 3_000_000),
            maxBytesLogo: Number(process.env.STORAGE_MAX_BYTES_LOGO || 2_000_000),
            minWidth: Number(process.env.STORAGE_MIN_WIDTH || 400),
            minHeight: Number(process.env.STORAGE_MIN_HEIGHT || 400),
            maxEdge: Number(process.env.STORAGE_MAX_EDGE || 4096),
        },
    },
})
