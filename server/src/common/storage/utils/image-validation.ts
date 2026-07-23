import { BadRequestException } from '@nestjs/common'

export type ImageLimits = {
    maxBytes: number
    minWidth: number
    minHeight: number
    maxEdge: number
}

export type ValidatedImage = {
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
    width: number
    height: number
    sizeBytes: number
}

function sniffMime(buf: Buffer): ValidatedImage['mimeType'] | null {
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        return 'image/jpeg'
    }
    if (
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47
    ) {
        return 'image/png'
    }
    if (
        buf.length >= 12 &&
        buf.toString('ascii', 0, 4) === 'RIFF' &&
        buf.toString('ascii', 8, 12) === 'WEBP'
    ) {
        return 'image/webp'
    }
    return null
}

function readPngSize(buf: Buffer): { width: number; height: number } | null {
    if (buf.length < 24) return null
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function readJpegSize(buf: Buffer): { width: number; height: number } | null {
    let i = 2
    while (i < buf.length) {
        if (buf[i] !== 0xff) break
        const marker = buf[i + 1]
        if (marker === 0xc0 || marker === 0xc2) {
            if (i + 9 >= buf.length) return null
            return {
                height: buf.readUInt16BE(i + 5),
                width: buf.readUInt16BE(i + 7),
            }
        }
        const len = buf.readUInt16BE(i + 2)
        i += 2 + len
    }
    return null
}

function readWebpSize(buf: Buffer): { width: number; height: number } | null {
    // VP8X
    if (buf.length >= 30 && buf.toString('ascii', 12, 16) === 'VP8X') {
        const width = 1 + buf[24] + (buf[25] << 8) + (buf[26] << 16)
        const height = 1 + buf[27] + (buf[28] << 8) + (buf[29] << 16)
        return { width, height }
    }
    // VP8 lossy
    if (buf.length >= 30 && buf.toString('ascii', 12, 16) === 'VP8 ') {
        const width = buf.readUInt16LE(26) & 0x3fff
        const height = buf.readUInt16LE(28) & 0x3fff
        return { width, height }
    }
    return null
}

export function validateImageBuffer(buf: Buffer, limits: ImageLimits): ValidatedImage {
    if (!buf?.length) {
        throw new BadRequestException('Empty image upload')
    }
    if (buf.length > limits.maxBytes) {
        throw new BadRequestException(
            `Image exceeds max size of ${Math.floor(limits.maxBytes / 1_000_000)}MB`,
        )
    }

    const mimeType = sniffMime(buf)
    if (!mimeType) {
        throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed')
    }

    const dims =
        mimeType === 'image/png'
            ? readPngSize(buf)
            : mimeType === 'image/jpeg'
              ? readJpegSize(buf)
              : readWebpSize(buf)

    if (!dims || dims.width < 1 || dims.height < 1) {
        throw new BadRequestException('Could not read image dimensions')
    }

    if (dims.width < limits.minWidth || dims.height < limits.minHeight) {
        throw new BadRequestException(
            `Image must be at least ${limits.minWidth}×${limits.minHeight}px`,
        )
    }

    if (dims.width > limits.maxEdge || dims.height > limits.maxEdge) {
        throw new BadRequestException(
            `Image edge must not exceed ${limits.maxEdge}px`,
        )
    }

    const ratio = dims.width / dims.height
    if (ratio > 4 || ratio < 0.25) {
        throw new BadRequestException('Image aspect ratio is too extreme')
    }

    return {
        mimeType,
        width: dims.width,
        height: dims.height,
        sizeBytes: buf.length,
    }
}
