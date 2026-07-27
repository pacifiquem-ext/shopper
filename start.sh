#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -d node_modules ] || [ ! -f server/.env ] || [ ! -f client/.env.local ]; then
  echo "==> Missing install or env files — running ./setup.sh first"
  "$ROOT/setup.sh"
fi

if [ ! -d packages/shared/dist ]; then
  echo "==> Building shared package"
  pnpm build:shared
fi

echo "==> Starting Shopper (API :3001, app :3000)"
exec pnpm dev
