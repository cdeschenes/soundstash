# SoundStash

Self-hosted, invite-only music sharing platform. Members upload tracks, listen with a waveform player, and leave comments. Access is controlled entirely by admin-issued invites.

## Features

- Feed with inline waveform playback and continuous audio while browsing
- Track upload: MP3, FLAC, WAV, M4A, OGG, Opus, up to 500 MB
- Cover artwork with full-size lightbox view
- Track editing (title, description, genre, tags, visibility, artwork) and deletion
- Per-track comments with inline editing
- User profiles with avatar, bio, location, and website
- Themes: Light, Dark, System, and Warm
- Admin panel: Dashboard, Invites, Users, Tracks, Comments

## Requirements

- Docker and Docker Compose
- An SMTP server (required to send invite emails)

## Quick start

**1. Clone the repo**

```bash
git clone https://github.com/cdeschenes/soundstash.git
cd soundstash
```

**2. Create your `.env`**

```bash
cp .env.example .env
```

Edit `.env`. Required values are marked below.

**3. Start the stack**

```bash
docker compose up -d
```

Three services start: `db` (PostgreSQL 16), `app` (Next.js), and `nginx` (port 80).

On first boot, the app container automatically pushes the database schema and creates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. No manual migration step needed.

**4. Log in**

Visit `http://<your-host>` and sign in with your admin credentials. From there, go to Admin > Invites to start adding members.

## Environment variables

`DATABASE_URL` and `MEDIA_ROOT` are set by `docker-compose.yml` and must not be set in `.env`.

| Variable | Required | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | Random secret, 32+ characters. Generate with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL` | Yes | Public URL of the app, e.g. `https://sound.yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same value as `BETTER_AUTH_URL` |
| `ADMIN_EMAIL` | Yes | Email for the first admin account (created on first boot) |
| `ADMIN_PASSWORD` | Yes | Password for the first admin account |
| `SMTP_HOST` | Yes* | SMTP server hostname |
| `SMTP_USER` | Yes* | SMTP login username |
| `SMTP_PASS` | Yes* | SMTP login password |
| `EMAIL_FROM` | Yes* | From address for invite emails, e.g. `SoundStash <noreply@yourdomain.com>` |
| `SMTP_PORT` | No | SMTP port. Defaults to `587`. |
| `SMTP_SECURE` | No | Set to `true` for port 465, `false` for STARTTLS. Defaults to `false`. |
| `APP_NAME` | No | App name used in email subjects. Defaults to `SoundStash`. |

*SMTP variables are optional in the sense that the app will start without them, but invites cannot be sent until they are configured.

## Upgrading

```bash
docker compose pull && docker compose up -d
```

The entrypoint runs `prisma db push` on every startup, so schema changes apply automatically.

## Default port

nginx listens on port 80. To use a different host port, add a `docker-compose.override.yml`:

```yaml
services:
  nginx:
    ports:
      - "8080:80"
```

## Auth flow

1. Admin creates an invite at Admin > Invites
2. An email goes to the invitee with a unique sign-up link
3. The invitee visits `/invite/<token>` and sets their display name, username, and password
4. The account is created and the invite is marked accepted
5. The user logs in at `/login`

## Docker image

```
ghcr.io/cdeschenes/soundstash:main
```
