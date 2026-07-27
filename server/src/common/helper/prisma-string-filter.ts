export function isSqliteDatabase(): boolean {
    return (process.env.DATABASE_URL ?? '').startsWith('file:')
}

export function containsInsensitive(value: string): { contains: string } {
    if (isSqliteDatabase()) return { contains: value }
    return { contains: value, mode: 'insensitive' } as { contains: string }
}

export function equalsInsensitive(value: string): { equals: string } {
    if (isSqliteDatabase()) return { equals: value }
    return { equals: value, mode: 'insensitive' } as { equals: string }
}
