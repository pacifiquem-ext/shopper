#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const SERVER_ROOT = path.resolve(__dirname, '..')
export const REPO_ROOT = path.resolve(SERVER_ROOT, '..')
export const ENV_PATH = path.join(SERVER_ROOT, '.env')
export const ENV_EXAMPLE_PATH = path.join(SERVER_ROOT, '.env.example')
export const PG_SCHEMA = path.join(SERVER_ROOT, 'prisma', 'schema.prisma')
export const SQLITE_SCHEMA = path.join(SERVER_ROOT, 'prisma', 'schema.sqlite.prisma')
export const SQLITE_RELATIVE_URL = 'file:./dev.db'
export const DEFAULT_PG_URL = 'postgresql://postgres:postgres@localhost:5432/shopper'
export const DEFAULT_REDIS_URL = 'redis://localhost:6379'

export function loadEnvFile(filePath) {
    if (!existsSync(filePath)) return {}
    const out = {}
    for (const raw of readFileSync(filePath, 'utf8').split('\n')) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const eq = line.indexOf('=')
        if (eq === -1) continue
        const key = line.slice(0, eq).trim()
        let value = line.slice(eq + 1).trim()
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1)
        }
        out[key] = value
    }
    return out
}

export function applyEnv(filePath) {
    const parsed = loadEnvFile(filePath)
    for (const [key, value] of Object.entries(parsed)) {
        if (process.env[key] === undefined) process.env[key] = value
    }
    return parsed
}

export function upsertEnv(filePath, updates) {
    const existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
    const lines = existing ? existing.split('\n') : []
    const seen = new Set()
    const next = lines.map((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
            return line
        }
        const key = trimmed.slice(0, trimmed.indexOf('=')).trim()
        if (!(key in updates)) return line
        seen.add(key)
        return `${key}=${updates[key]}`
    })
    for (const [key, value] of Object.entries(updates)) {
        if (!seen.has(key)) next.push(`${key}=${value}`)
    }
    const text = `${next.join('\n').replace(/\n+$/, '')}\n`
    mkdirSync(path.dirname(filePath), { recursive: true })
    writeFileSync(filePath, text)
}

export function isProductionEnv(env = process.env) {
    const appEnv = (env.APP_ENV || '').toLowerCase()
    const nodeEnv = (env.NODE_ENV || '').toLowerCase()
    return appEnv === 'production' || nodeEnv === 'production'
}

export function parseHostPort(url, fallbackPort) {
    try {
        const normalized = url.replace(/^postgresql:/, 'http:').replace(/^redis:/, 'http:')
        const parsed = new URL(normalized)
        return {
            host: parsed.hostname || '127.0.0.1',
            port: parsed.port ? Number(parsed.port) : fallbackPort,
        }
    } catch {
        return { host: '127.0.0.1', port: fallbackPort }
    }
}

export function canConnect(host, port, timeoutMs = 700) {
    return new Promise((resolve) => {
        const socket = net.connect({ host, port })
        const finish = (ok) => {
            socket.removeAllListeners()
            socket.destroy()
            resolve(ok)
        }
        socket.setTimeout(timeoutMs)
        socket.once('connect', () => finish(true))
        socket.once('timeout', () => finish(false))
        socket.once('error', () => finish(false))
    })
}

export function emitSqliteSchema() {
    const source = readFileSync(PG_SCHEMA, 'utf8')
    const transformed = source
        .replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"')
        .replace(/\s+@db\.Decimal\([^)]*\)/g, '')
        .replace(/\s+@db\.Date\b/g, '')
        .replace(/String\[\]\s+@default\(\[\]\)/g, 'Json @default("[]")')
        .replace(/String\[\]/g, 'Json')
        .replace(/@default\("\{\}"\)/g, '@default(dbgenerated("\'{}\'"))')
    const header =
        '// Generated from schema.prisma for SQLite. Do not edit by hand.\n'
    writeFileSync(SQLITE_SCHEMA, `${header}${transformed}`)
    return SQLITE_SCHEMA
}

export function schemaForProvider(provider) {
    return provider === 'sqlite' ? SQLITE_SCHEMA : PG_SCHEMA
}

export async function resolveDatabase(env = process.env) {
    const forced = (env.DATABASE_PROVIDER || 'auto').toLowerCase()
    const production = isProductionEnv(env)
    const postgresUrl = env.DATABASE_URL?.startsWith('file:')
        ? DEFAULT_PG_URL
        : env.DATABASE_URL || DEFAULT_PG_URL

    if (forced === 'sqlite') {
        if (production) {
            throw new Error('SQLite is not allowed when APP_ENV/NODE_ENV is production')
        }
        return { provider: 'sqlite', url: SQLITE_RELATIVE_URL, postgresUrl }
    }

    if (forced === 'postgresql' || forced === 'postgres') {
        return { provider: 'postgresql', url: postgresUrl, postgresUrl }
    }

    if (production) {
        return { provider: 'postgresql', url: postgresUrl, postgresUrl }
    }

    if (env.DATABASE_URL?.startsWith('file:')) {
        return { provider: 'sqlite', url: env.DATABASE_URL, postgresUrl }
    }

    const { host, port } = parseHostPort(postgresUrl, 5432)
    const reachable = await canConnect(host, port)
    if (reachable) {
        return { provider: 'postgresql', url: postgresUrl, postgresUrl }
    }
    return { provider: 'sqlite', url: SQLITE_RELATIVE_URL, postgresUrl }
}

export async function resolveCache(env = process.env) {
    const forced = (env.CACHE_DRIVER || 'memory').toLowerCase()
    if (forced === 'memory') return { driver: 'memory', url: env.REDIS_URL || DEFAULT_REDIS_URL }
    const redisUrl = env.REDIS_URL || DEFAULT_REDIS_URL
    if (forced === 'redis') return { driver: 'redis', url: redisUrl }
    const { host, port } = parseHostPort(redisUrl, 6379)
    const reachable = await canConnect(host, port)
    return reachable
        ? { driver: 'redis', url: redisUrl }
        : { driver: 'memory', url: redisUrl }
}

export function runPrisma(args, schema, extraEnv = {}) {
    const result = spawnSync('pnpm', ['exec', 'prisma', ...args, '--schema', schema], {
        cwd: SERVER_ROOT,
        stdio: 'inherit',
        env: { ...process.env, ...extraEnv },
        shell: process.platform === 'win32',
    })
    if (result.status !== 0) {
        throw new Error(`prisma ${args.join(' ')} failed with exit ${result.status}`)
    }
}
