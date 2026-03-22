export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

export function toBaseSku(sku: string): string {
  const match = sku.match(/^[A-Za-z]+-\d+/)
  return match?.[0] ?? sku
}

export function formatDateRange(
  from: Date | undefined,
  to: Date | undefined,
  fallback: string
): string {
  if (!from) return fallback

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const fromStr = formatter.format(from)
  const toStr = to ? formatter.format(to) : ''

  if (!toStr) return fromStr
  return `${fromStr} - ${toStr}`
}

type Point = readonly [number, number]

export function pointsToPath(points: readonly Point[]): string {
  if (points.length === 0) return ''

  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const dx = maxX - minX || 1
  const dy = maxY - minY || 1

  const mapped = points.map(([x, y]) => {
    const nx = (x - minX) / dx
    const ny = 1 - (y - minY) / dy
    return { x: nx, y: ny }
  })

  const start = mapped[0]
  if (!start) return ''

  let d = `M ${start.x} ${start.y}`
  for (let i = 1; i < mapped.length; i += 1) {
    const prev = mapped[i - 1]
    const curr = mapped[i]
    if (!prev || !curr) continue
    const cx = (prev.x + curr.x) / 2
    d += ` Q ${cx} ${prev.y} ${curr.x} ${curr.y}`
  }

  return d
}

export function pointToXY(
  point: readonly [number, number],
  x0: number,
  x1: number,
  y0: number,
  y1: number
): { x: number; y: number } {
  const x = x0 + point[0] * (x1 - x0)
  const y = y0 + point[1] * (y1 - y0)
  return { x, y }
}

export function pointsToPathWithBounds(
  points: readonly Point[],
  x0: number,
  x1: number,
  y0: number,
  y1: number
): string {
  const mapped = points.map((p) => pointToXY(p, x0, x1, y0, y1))
  const start = mapped[0]
  if (!start) return ''

  let d = `M ${start.x} ${start.y}`
  for (let i = 1; i < mapped.length; i += 1) {
    const prev = mapped[i - 1]
    const curr = mapped[i]
    if (!prev || !curr) continue
    const cx = (prev.x + curr.x) / 2
    d += ` Q ${cx} ${prev.y} ${curr.x} ${curr.y}`
  }
  return d
}
