/**
 * Normalizes Rwanda and common local formats to E.164 (+250...).
 */
export function normalizePhoneToE164(raw: string): string {
  const trimmed = raw.trim().replace(/[\s-]/g, '')
  if (!trimmed) return trimmed

  if (trimmed.startsWith('+')) {
    return trimmed
  }

  if (trimmed.startsWith('07') && trimmed.length === 10) {
    return `+250${trimmed.slice(1)}`
  }

  if (trimmed.startsWith('250') && trimmed.length >= 12) {
    return `+${trimmed}`
  }

  if (/^7\d{8}$/.test(trimmed)) {
    return `+250${trimmed}`
  }

  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`
}
