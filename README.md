# SoundStash

Think SoundCloud, but private and self-hosted. SoundStash is an invite-only music sharing platform where members upload and stream their own original songs, discover music from others in the community, and leave comments. Access is gated entirely by admin-issued invites — no public sign-ups, no strangers.

## Features

- Feed with continuous music streaming and interactive waveforms — audio keeps playing as you browse
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

Three services start: `db` (PostgreSQL 16), `app` (Next.js), and `nginx`. Data is stored in `./media_data` and `./postgres_data` inside the project folder — both are created automatically on first run.

On first boot, the app container automatically pushes the database schema and creates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. No manual migration step needed.

**4. Log in**

Visit `http://<your-host>:<port>` and sign in with your admin credentials. From there, go to **Admin > Invites** to start adding members.

## Environment variables

`DATABASE_URL` and `MEDIA_ROOT` are set internally by `docker-compose.yml` for the app container. Don't set them in `.env` — if you see `DATABASE_URL` in `.env.example`, that entry is for local development only and has no effect on a Docker install.

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

## Changing the port

The host port is set directly in `docker-compose.yml` under the `nginx` service:

```yaml
ports:
  - "8089:80"
```

Change `8089` to any available port on your host, then restart with `docker compose up -d`.

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
