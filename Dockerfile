FROM ubuntu:22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
# audiowaveform is available from the maintainer's Launchpad PPA
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg software-properties-common \
    && add-apt-repository -y ppa:chris-needham/ppa \
    && apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg audiowaveform \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy DATABASE_URL so Prisma can generate the client and Next.js can
# complete the build without a live database. Pages that query the DB
# at build time will fail gracefully — they are all dynamic at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

RUN npx prisma generate
RUN npm run build

# ─── Runner ───────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create media directory
RUN mkdir -p /media && chown nextjs:nodejs /media

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
