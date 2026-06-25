/** Store cards use a 4:5 portrait frame; uploads are normalized to 800×1000. */
export const STORE_LOGO_OUTPUT_WIDTH = 800
export const STORE_LOGO_OUTPUT_HEIGHT = 1000
export const STORE_LOGO_MIN_WIDTH = 400
export const STORE_LOGO_MIN_HEIGHT = 500
export const STORE_LOGO_ASPECT_WIDTH = 4
export const STORE_LOGO_ASPECT_HEIGHT = 5
export const STORE_LOGO_ASPECT = STORE_LOGO_ASPECT_WIDTH / STORE_LOGO_ASPECT_HEIGHT

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export type StoreLogoProcessError = 'invalid_type' | 'too_small' | 'load_failed'

export type StoreLogoProcessResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: StoreLogoProcessError; width?: number; height?: number }

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('load_failed'))
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('load_failed'))
    }
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('load_failed'))
    img.src = src
  })
}

function centerCropToAspect(
  width: number,
  height: number,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const currentAspect = width / height

  if (currentAspect > targetAspect) {
    const sh = height
    const sw = height * targetAspect
    return { sx: (width - sw) / 2, sy: 0, sw, sh }
  }

  const sw = width
  const sh = width / targetAspect
  return { sx: 0, sy: (height - sh) / 2, sw, sh }
}

/** Validates type & minimum size, center-crops to 4:5, and resizes to 800×1000. */
export async function processStoreLogoFile(file: File): Promise<StoreLogoProcessResult> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return { ok: false, error: 'invalid_type' }
  }

  let dataUrl: string
  try {
    dataUrl = await readFileAsDataUrl(file)
  } catch {
    return { ok: false, error: 'load_failed' }
  }

  let img: HTMLImageElement
  try {
    img = await loadImage(dataUrl)
  } catch {
    return { ok: false, error: 'load_failed' }
  }

  const { naturalWidth: width, naturalHeight: height } = img
  if (width < STORE_LOGO_MIN_WIDTH || height < STORE_LOGO_MIN_HEIGHT) {
    return { ok: false, error: 'too_small', width, height }
  }

  const crop = centerCropToAspect(width, height, STORE_LOGO_ASPECT)
  const canvas = document.createElement('canvas')
  canvas.width = STORE_LOGO_OUTPUT_WIDTH
  canvas.height = STORE_LOGO_OUTPUT_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) return { ok: false, error: 'load_failed' }

  ctx.drawImage(
    img,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    STORE_LOGO_OUTPUT_WIDTH,
    STORE_LOGO_OUTPUT_HEIGHT,
  )

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const output = canvas.toDataURL(outputType, outputType === 'image/jpeg' ? 0.9 : undefined)

  return { ok: true, dataUrl: output }
}
