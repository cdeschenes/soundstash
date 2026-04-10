#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Running seed (skipped if admin already exists)..."
node prisma/seed.js || echo "[entrypoint] Seed skipped or already complete."

echo "[entrypoint] Starting app..."
exec node server.js
