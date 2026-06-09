/** Skip keyboard mash / placeholder text so the hero can use a proper i18n fallback. */
export function isLowQualityStoreDescription(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 12) return true

  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  const smashTokens = tokens.filter(
    (t) => /[;]/.test(t) || /^[a-z]{1,4}[;]/.test(t) || /[;][a-z]{1,4}$/.test(t),
  )
  if (smashTokens.length > 0) return true

  const realWords = tokens.filter((t) => /^[A-Za-zÀ-ÿ'-]{4,}$/.test(t))
  if (realWords.length === 0) return true

  const letters = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length < 10) return true

  const vowels = (letters.match(/[aeiouAEIOUÀ-ÿ]/gi)?.length ?? 0) / letters.length
  if (vowels < 0.22) return true

  if (trimmed.length > 28 && !/\.\s|[!?]|\s{2,}/.test(trimmed) && tokens.length <= 3) {
    return true
  }

  return false
}

export function resolveStoreHeroDescription(
  raw: string | null | undefined,
  fallback: string,
): string {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed || isLowQualityStoreDescription(trimmed)) {
    return fallback
  }
  return trimmed
}
