# SoundStash

Self-hosted, invite-only music sharing. Upload tracks, share waveforms, leave comments.

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

## Getting started

### Prerequisites

- Node 22+
- Docker + Docker Compose
- `ffmpeg` and `audiowaveform` installed locally (for dev)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set BETTER_AUTH_SECRET, DATABASE_URL, SMTP_* etc.
```

### 3. Start database

```bash
docker compose up db -d
```

### 4. Run migrations and seed admin

```bash
npm run db:migrate
npm run db:seed
```

This creates an admin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

### 5. Start dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

---

## Production (Docker)

```bash
# Copy and fill in your values
cp .env.example .env

# Start everything
docker compose up -d

# With Nginx reverse proxy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations inside the container
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

---

## Key architecture decisions

| Decision | Rationale |
|---|---|
| Separate `UserProfile` table | Decoupled from Better Auth's `user` table to avoid migration conflicts |
| Fire-and-forget audio processing | Adequate for <50 users; no queue needed |
| `UPLOADED → PROCESSING → READY \| FAILED` state machine | Enables polling UI, orphan recovery at startup |
| Pre-generated waveform peaks | Fast page load — peaks served as static JSON, no decode on playback |
| Nginx serves `/media/` directly | Avoids streaming audio bytes through Node in production |
| HTTP range request support in dev media route | Required for correct seek behavior |

## Media storage

Files are stored at `MEDIA_ROOT` (default: `./media` in dev, `/media` in Docker):

```
media/
  tracks/<userId>/<trackId>.mp3
  tracks/<userId>/<trackId>_artwork.jpg
  tracks/<userId>/<trackId>_waveform.json
  avatars/<nanoid>_avatar.jpg
```

In production, mount this as a Docker volume backed by your NAS or persistent disk.

## Auth flow

1. Admin creates invite at `/admin/invites`
2. System emails invite link to `user@example.com`
3. User visits `/invite/<token>`, sets display name, username, and password
4. Account created via Better Auth; invite marked accepted
5. User logs in at `/login`

## type-check

```bash
npm run type-check
```
