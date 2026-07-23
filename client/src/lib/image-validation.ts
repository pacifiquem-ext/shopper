export type ImageValidationLimits = {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  maxBytes?: number
  allowedMimeTypes?: readonly string[]
}

export type ImageValidationErrorCode =
  | 'invalid_mime'
  | 'too_large'
  | 'too_small_dimensions'
  | 'too_large_dimensions'
  | 'load_failed'

export type ImageValidationResult =
  | { ok: true; width: number; height: number }
  | { ok: false; code: ImageValidationErrorCode; message: string }

export const DEFAULT_PRODUCT_IMAGE_LIMITS: Required<
  Pick<ImageValidationLimits, 'minWidth' | 'minHeight' | 'maxBytes'>
> &
  ImageValidationLimits = {
  minWidth: 400,
  minHeight: 400,
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
}

export function validateImageFile(
  file: File,
  limits: ImageValidationLimits = DEFAULT_PRODUCT_IMAGE_LIMITS,
): Promise<ImageValidationResult> {
  const allowed = limits.allowedMimeTypes ?? DEFAULT_PRODUCT_IMAGE_LIMITS.allowedMimeTypes
  if (allowed && !allowed.includes(file.type)) {
    return Promise.resolve({
      ok: false,
      code: 'invalid_mime',
      message: `Unsupported type ${file.type || 'unknown'}`,
    })
  }

  const maxBytes = limits.maxBytes ?? DEFAULT_PRODUCT_IMAGE_LIMITS.maxBytes
  if (file.size > maxBytes) {
    return Promise.resolve({
      ok: false,
      code: 'too_large',
      message: `File exceeds ${Math.round(maxBytes / (1024 * 1024))}MB`,
    })
  }

  const objectUrl = URL.createObjectURL(file)
  return loadImageDimensions(objectUrl)
    .then((dims) => {
      URL.revokeObjectURL(objectUrl)
      return checkDimensions(dims.width, dims.height, limits)
    })
    .catch(() => {
      URL.revokeObjectURL(objectUrl)
      return {
        ok: false as const,
        code: 'load_failed' as const,
        message: 'Could not read image',
      }
    })
}

export function validateImageUrl(
  url: string,
  limits: ImageValidationLimits = DEFAULT_PRODUCT_IMAGE_LIMITS,
): Promise<ImageValidationResult> {
  return loadImageDimensions(url)
    .then((dims) => checkDimensions(dims.width, dims.height, limits))
    .catch(() => ({
      ok: false as const,
      code: 'load_failed' as const,
      message: 'Could not load image from URL',
    }))
}

function checkDimensions(
  width: number,
  height: number,
  limits: ImageValidationLimits,
): ImageValidationResult {
  const minW = limits.minWidth ?? 0
  const minH = limits.minHeight ?? 0
  if (width < minW || height < minH) {
    return {
      ok: false,
      code: 'too_small_dimensions',
      message: `Image must be at least ${minW}×${minH}px (got ${width}×${height})`,
    }
  }
  if (limits.maxWidth && width > limits.maxWidth) {
    return {
      ok: false,
      code: 'too_large_dimensions',
      message: `Image width ${width} exceeds max ${limits.maxWidth}`,
    }
  }
  if (limits.maxHeight && height > limits.maxHeight) {
    return {
      ok: false,
      code: 'too_large_dimensions',
      message: `Image height ${height} exceeds max ${limits.maxHeight}`,
    }
  }
  return { ok: true, width, height }
}

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('Image API unavailable'))
      return
    }
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('load failed'))
    img.src = src
  })
}
