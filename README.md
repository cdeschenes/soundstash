# SoundStash

Self-hosted, invite-only music sharing platform with SoundCloud like features. Upload tracks and leave comments.

## Features

- **Feed** — live waveform playback without leaving the page; continuous audio as you browse
- **Upload** — drag-and-drop audio (MP3, FLAC, WAV, M4A, OGG, Opus) with cover artwork, genre, and tags
- **Track management** — owners can edit title, description, genre, tags, visibility, and artwork; delete anytime
- **Admin panel** — manage all users, tracks, invites; admins can edit or delete any track
- **Comments** — per-track threaded comments with collapsible post form
- **Profiles** — display name, bio, location, website, avatar
- **Themes** — Light, Dark, and System theme options per user
- **Invite-only** — all new members join via admin-issued invite links

## Stack

- **Next.js 15** (App Router, TypeScript)
- **PostgreSQL + Prisma**
- **Better Auth** — email/password, admin plugin
- **wavesurfer.js** — waveform rendering with pre-generated peaks
- **FFmpeg + audiowaveform** — metadata extraction + peak generation
- **Tailwind CSS + shadcn/ui**
- **Docker Compose**

## Install

### Prerequisites

- Docker and Docker Compose
- An SMTP server for sending invite emails

### 1. Clone the repo

```bash
git clone https://github.com/cdeschenes/soundstash.git
cd soundstash
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Random secret, 32+ characters. Generate with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL` | Public URL of the app, e.g. `https://sound.yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (typically `587`) |
| `SMTP_SECURE` | `true` for port 465, `false` for STARTTLS |
| `SMTP_USER` | SMTP login username |
| `SMTP_PASS` | SMTP login password |
| `EMAIL_FROM` | From address for invite emails, e.g. `SoundStash <noreply@yourdomain.com>` |
| `ADMIN_EMAIL` | Email address for the first admin account |
| `ADMIN_PASSWORD` | Password for the first admin account |

> `DATABASE_URL` and `MEDIA_ROOT` are set automatically by the compose file and do not need to be in `.env`.

### 3. Start the stack

```bash
docker compose up -d
```

This starts three services: `db` (PostgreSQL), `app` (Next.js), and `nginx` (reverse proxy on port 80).

### 4. Run migrations and seed the admin account

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

The seed script creates the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. Run it once on first deploy only.

### 5. Log in

Visit the URL you set in `BETTER_AUTH_URL` and log in with your admin credentials.

### Updates

```bash
docker compose pull && docker compose up -d
```

## Auth flow

1. Admin creates invite at `/admin/invites`
2. System emails invite link to `user@example.com`
3. User visits `/invite/<token>`, sets display name, username, and password
4. Account created via Better Auth; invite marked accepted
5. User logs in at `/login`
