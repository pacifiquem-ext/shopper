#!/usr/bin/env node
import { randomBytes } from 'node:crypto'
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'

import {
    DEFAULT_PG_URL,
    DEFAULT_REDIS_URL,
    ENV_EXAMPLE_PATH,
    ENV_PATH,
    REPO_ROOT,
    SQLITE_RELATIVE_URL,
    applyEnv,
    emitSqliteSchema,
    loadEnvFile,
    resolveCache,
    resolveDatabase,
    runPrisma,
    schemaForProvider,
    upsertEnv,
} from './prisma-runtime.mjs'

function secret() {
    return randomBytes(32).toString('hex')
}

function ensureServerEnv() {
    if (!existsSync(ENV_PATH)) {
        if (!existsSync(ENV_EXAMPLE_PATH)) {
            throw new Error(`Missing ${ENV_EXAMPLE_PATH}`)
        }
        copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH)
    }
    const current = loadEnvFile(ENV_PATH)
    const updates = {}
    if (!current.AUTH_ACCESS_TOKEN_SECRET || current.AUTH_ACCESS_TOKEN_SECRET.includes('change-me')) {
        updates.AUTH_ACCESS_TOKEN_SECRET = secret()
    }
    if (
        !current.AUTH_REFRESH_TOKEN_SECRET ||
        current.AUTH_REFRESH_TOKEN_SECRET.includes('change-me')
    ) {
        updates.AUTH_REFRESH_TOKEN_SECRET = secret()
    }
    if (!current.AUTH_ACCESS_TOKEN_EXP) updates.AUTH_ACCESS_TOKEN_EXP = '15m'
    if (!current.AUTH_REFRESH_TOKEN_EXP) updates.AUTH_REFRESH_TOKEN_EXP = '7d'
    if (!current.DATABASE_URL) updates.DATABASE_URL = DEFAULT_PG_URL
    if (!current.REDIS_URL) updates.REDIS_URL = DEFAULT_REDIS_URL
    if (Object.keys(updates).length) upsertEnv(ENV_PATH, updates)
}

function ensureClientEnv() {
    const example = path.join(REPO_ROOT, 'client', '.env.example')
    const dest = path.join(REPO_ROOT, 'client', '.env.local')
    if (!existsSync(dest) && existsSync(example)) {
        copyFileSync(example, dest)
    }
}

ensureServerEnv()
ensureClientEnv()
applyEnv(ENV_PATH)

const forcedProvider = (process.env.DATABASE_PROVIDER || 'auto').toLowerCase()
const database = await resolveDatabase(process.env)
const cache = await resolveCache(process.env)

const envUpdates = {
    DATABASE_URL: database.url,
    CACHE_DRIVER: cache.driver,
    REDIS_URL: cache.url,
}
if (forcedProvider === 'sqlite' || forcedProvider === 'postgresql' || forcedProvider === 'postgres') {
    envUpdates.DATABASE_PROVIDER = database.provider
} else {
    envUpdates.DATABASE_PROVIDER = 'auto'
}
upsertEnv(ENV_PATH, envUpdates)
process.env.DATABASE_PROVIDER = envUpdates.DATABASE_PROVIDER
process.env.DATABASE_URL = database.url
process.env.CACHE_DRIVER = cache.driver
process.env.REDIS_URL = cache.url

if (database.provider === 'sqlite') {
    emitSqliteSchema()
}

const schema = schemaForProvider(database.provider)
const prismaEnv = { DATABASE_URL: database.url }

console.log(
    `[setup] database=${database.provider} cache=${cache.driver}` +
        (database.provider === 'sqlite' ? ` (${SQLITE_RELATIVE_URL})` : '')
)

runPrisma(['generate'], schema, prismaEnv)

if (database.provider === 'sqlite') {
    runPrisma(['db', 'push', '--skip-generate', '--accept-data-loss'], schema, prismaEnv)
} else {
    try {
        try {
            runPrisma(['migrate', 'deploy'], schema, prismaEnv)
        } catch {
            console.warn('[setup] migrate deploy failed — trying prisma db push')
            runPrisma(['db', 'push', '--skip-generate'], schema, prismaEnv)
        }
    } catch (error) {
        if (forcedProvider === 'postgresql' || forcedProvider === 'postgres') throw error
        console.warn('[setup] Postgres accepted the TCP probe but is not usable — falling back to SQLite')
        upsertEnv(ENV_PATH, {
            DATABASE_URL: SQLITE_RELATIVE_URL,
        })
        process.env.DATABASE_URL = SQLITE_RELATIVE_URL
        emitSqliteSchema()
        const sqliteSchema = schemaForProvider('sqlite')
        const sqliteEnv = { DATABASE_URL: SQLITE_RELATIVE_URL }
        runPrisma(['generate'], sqliteSchema, sqliteEnv)
        runPrisma(['db', 'push', '--skip-generate', '--accept-data-loss'], sqliteSchema, sqliteEnv)
    }
}

const finalProvider = (process.env.DATABASE_URL || database.url).startsWith('file:')
    ? 'sqlite'
    : 'postgresql'
const finalSchema = schemaForProvider(finalProvider)
const finalEnv = { DATABASE_URL: process.env.DATABASE_URL || database.url }

try {
    runPrisma(['db', 'seed'], finalSchema, finalEnv)
} catch {
    console.warn('[setup] seed skipped (already applied or failed)')
}
