#!/usr/bin/env node
import {
    ENV_PATH,
    applyEnv,
    emitSqliteSchema,
    resolveDatabase,
    runPrisma,
    schemaForProvider,
} from './prisma-runtime.mjs'

applyEnv(ENV_PATH)
const { provider, url } = await resolveDatabase(process.env)
if (provider === 'sqlite') emitSqliteSchema()
runPrisma(['generate'], schemaForProvider(provider), { DATABASE_URL: url })
