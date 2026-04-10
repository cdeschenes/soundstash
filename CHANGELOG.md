# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [v1.0.2] - 2026-04-10

### Added
- **Play counting** — listening past 80% of a track records a play; the counter updates in real time on the card without a page reload; one play per listen session (no double-counting on scrub)
- **Play count badge** — play count moved to a small, unobtrusive position in the bottom-right corner of each track card so it doesn't compete with the waveform
- **External links on tracks** — upload and edit forms now include a Links section; add as many label + URL pairs as you want; they appear on the track detail page under "Links"
- **Media file protection** — audio and artwork files are no longer publicly accessible; nginx now requires a valid session before serving any `/media/` path
- **Upload rate limiting** — the upload endpoint now enforces a limit of 10 uploads per hour per IP address; returns 429 with a clear message when exceeded

### Changed
- Data directories (`media_data/`, `postgres_data/`) are now bind-mounted into the project folder instead of Docker named volumes, making backups and inspection straightforward
- nginx port changed from 80 to 8089 in `docker-compose.yml`; edit that file directly to use a different host port
- `.env.example` reorganised into labelled sections with inline guidance; placeholder credentials updated to match the Docker defaults; `DATABASE_URL` note clarifies it is for local dev only

## [v1.0.1] - 2026-04-09

### Added
- **Comment editing** — users can edit their own comments inline with a pencil icon that appears on hover; Save/Cancel controls appear in place of the comment body
- **Admin comment moderation** — new `/admin/comments` page lists all comments across every track with a delete action; linked from the admin sidebar
- **Album art lightbox** — clicking a track's cover art opens a full-size view centered on the page with a blurred backdrop; click outside or press × to close
- **Warm theme** — new colour scheme based on the #003049 / #D62828 / #F77F00 / #FCBF49 palette; selectable from Profile Settings alongside Light, Dark, and System

### Fixed
- Comment counter on track cards and feed remained stale after a comment was deleted — `_count.comments` now filters out soft-deleted comments
- Admin users could not edit their own comments — the pencil icon was incorrectly hidden for any admin; now any user can edit their own comments regardless of role

## [v1.0.0] - 2026-04-07

### Added
- **Track edit/delete** — owners can edit title, description, genre, tags, visibility, and cover artwork inline; delete with confirmation
- **Admin track management** — admins can edit and delete any user's track; dedicated `/admin/tracks` page lists all tracks including private and processing ones
- **Cover artwork on upload** — replaced raw file input with a button + live preview; shows thumbnail after selection with change/remove options
- **Cover artwork editing** — artwork can be replaced from the track edit dialog with an inline preview
- **Light/Dark/System themes** — per-user theme preference stored in the browser; toggle from Profile Settings
- **Help dialog** — `?` button in the top bar opens a centered guide covering the feed, uploading, comments, profiles, and invites
- **Collapsible comment form** — Post comment button expands the textarea; Cancel collapses it back, keeping the track page clean
- **Admin tracks page** — `/admin/tracks` lists every track regardless of status or visibility
- **Profile settings loads saved data** — display name, bio, website, location, and avatar now pre-populate from the database when opening Settings

### Fixed
- Cover artwork displayed as broken image — Next.js image optimizer fetched the auth-protected media route without a session cookie; now uses `unoptimized` so the browser fetches directly
- Avatar not shown on Profile Settings page — `avatarPath` was never passed to the avatar component; page now fetches the full user profile on mount
- Non-square avatars stretched to a square — replaced `aspect-square` with `object-cover` on the avatar image
- Bio, website, and location fields were always blank in Settings even after saving — fields now populate from the database
- `updateTrack` server action blocked admin edits — ownership check now mirrors `deleteTrack` and allows admins
- Help dialog rendered inside the nav's stacking context and appeared off-center — moved to a React portal on `document.body`
- Waveform colors did not adapt to light mode — colors now derive from `resolvedTheme`
