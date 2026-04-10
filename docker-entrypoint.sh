#!/bin/sh
set -e

echo "[entrypoint] Pushing database schema..."
node_modules/.bin/prisma db push --skip-generate

echo "[entrypoint] Running seed (skipped if admin already exists)..."
node prisma/seed.js || echo "[entrypoint] Seed skipped or already complete."

echo "[entrypoint] Starting app..."
exec node server.js
