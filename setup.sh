#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

log() { printf '\n==> %s\n' "$*"; }
fail() { printf 'error: %s\n' "$*" >&2; exit 1; }

require_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js 20+ is required. Install it from https://nodejs.org"
  local major
  major="$(node -p "process.versions.node.split('.')[0]")"
  if [ "$major" -lt 20 ]; then
    fail "Node.js 20+ is required (found $(node -v))"
  fi
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    return
  fi
  if command -v corepack >/dev/null 2>&1; then
    log "Enabling pnpm via corepack"
    corepack enable
    corepack prepare pnpm@10.12.1 --activate
    return
  fi
  fail "pnpm is required. Install it with: npm install -g pnpm"
}

log "Checking Node.js"
require_node
ensure_pnpm
printf '    node %s\n    pnpm %s\n' "$(node -v)" "$(pnpm -v)"

if [ ! -f server/.env ]; then
  log "Writing server/.env from server/.env.example"
  cp server/.env.example server/.env
fi

if [ ! -f client/.env.local ]; then
  log "Writing client/.env.local from client/.env.example"
  cp client/.env.example client/.env.local
fi

log "Installing workspace dependencies"
pnpm install

log "Resolving database (Postgres if reachable, otherwise SQLite) and preparing schema"
node server/scripts/prepare-local.mjs

log "Building shared package"
pnpm build:shared

log "Setup complete"
printf '\nNext:\n  ./start.sh\n\nApp:  http://localhost:3000\nAPI:  http://localhost:3001\n'
