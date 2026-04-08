# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
