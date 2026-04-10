# SoundStash user guide

SoundStash is a private music sharing platform for invited members. You upload tracks, listen with a waveform player, and leave comments. Nobody outside the community can get in.

---

## Table of contents

1. [Getting started](#getting-started)
2. [The feed](#the-feed)
3. [Listening to a track](#listening-to-a-track)
4. [Uploading a track](#uploading-a-track)
5. [Managing your tracks](#managing-your-tracks)
6. [Comments](#comments)
7. [Your profile](#your-profile)
8. [Settings](#settings)
9. [Admin guide](#admin-guide)

---

## Getting started

You need an invite to join. An admin sends one to your email address. Open the link in the email and you'll be walked through creating your account.

Once you're in, spend a minute on your profile before anything else. Go to **Settings** (the gear icon in the top bar) and set a display name — that's what other members see on your tracks and comments.

---

## The feed

The feed is the main page. It shows all public tracks from every member, newest first.

**Playing from the feed.** Click the play button on any track to start listening without leaving the page. The waveform appears as the track plays. Click anywhere on it to jump to that position.

**Continuous playback.** Audio keeps playing while you scroll or browse the feed. It stops if you navigate to a track's detail page and start playing something there.

**Opening a track.** Click the track title or artwork to go to its detail page, where you'll find the full waveform, description, and comments.

---

## Listening to a track

The track detail page has the full waveform at the top. Click anywhere on it to seek. Duration and any metadata the uploader added (genre, tags, description) appear below.

If the uploader added cover artwork, it appears next to the waveform. Click the thumbnail to open a full-size view. Click outside the image or press the × button to close it.

---

## Uploading a track

Click **Upload** in the top bar to open the upload page.

**Step 1: drop your file.** Drag an audio file onto the dropzone, or click it to browse. Supported formats: MP3, FLAC, WAV, M4A, OGG, Opus. Maximum file size is 500 MB.

**Step 2: fill in the details.**

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Shown everywhere the track appears |
| Description | No | Longer notes about the track |
| Genre | No | One genre, e.g. "Electronic" |
| Tags | No | Comma-separated, e.g. `ambient, lo-fi, chill` |

**Step 3: add artwork (optional).** Click **Add artwork** to pick an image file. A preview appears immediately. JPEG, PNG, and WebP are accepted. Click **Remove** to clear it before uploading.

**Step 4: upload.** Click **Upload Track**. The button shows "Uploading..." while the file transfers, then "Processing waveform..." while the server generates the audio waveform. When it finishes, you land on the track page.

If processing fails, you'll see a notice that the upload was saved but may not play correctly. The track still appears in your profile.

---

## Managing your tracks

Hover over any track you uploaded to see two icons on the right: a pencil (edit) and a trash can (delete).

### Editing a track

Click the pencil to open the edit dialog. You can change:

- Title
- Description
- Genre
- Tags (comma-separated)
- Cover artwork (click **Change artwork** to pick a new file)
- Visibility — uncheck **Public** to hide the track from the feed. It stays visible on your profile to you only.

Click **Save** when done.

### Deleting a track

Click the trash can icon and confirm the deletion. This cannot be undone.

---

## Comments

Comments are on each track's detail page, below the waveform.

**Posting a comment.** Click **Post comment**. A text box appears. Type your comment (up to 1,000 characters) and click **Post comment** again to submit. Click **Cancel** to close the box without posting.

**Editing a comment.** Hover over a comment you posted and click the pencil icon. The comment text becomes an editable box. Make your changes and click **Save**, or click **Cancel** to discard them. Only you can edit your own comments.

**Deleting a comment.** Hover over your comment and click the trash icon. Admins can delete any comment on the platform.

---

## Your profile

Your public profile shows your display name, bio, location, website, and all your public tracks.

Click your avatar in the top bar to visit your own profile. Other members can visit it too. Tracks marked private don't appear there.

---

## Settings

Go to **Settings** (gear icon in the top bar) to update your profile and appearance.

### Profile info

| Field | Notes |
|-------|-------|
| Display name | What members see on your tracks and comments |
| Bio | Short text, up to 500 characters |
| Website | Full URL, e.g. `https://yoursite.com` |
| Location | Free text, e.g. "Portland, OR" |

Click **Save changes** after editing.

### Avatar

Click **Change avatar** to upload a new profile picture. JPEG, PNG, and WebP are accepted, up to 5 MB. The preview updates after upload.

### Theme

Choose between **Light**, **Dark**, **System**, and **Warm**. System follows your OS setting. Warm is a dark theme with a navy, red, and amber color palette. Changes take effect immediately without saving.

---

## Admin guide

> This section is for admins only. Regular members don't see the Admin panel.

Access the admin panel from the top bar. It has five sections: Dashboard, Invites, Users, Tracks, and Comments.

### Dashboard

Shows four live counts: total users, total tracks, total comments, and pending invites (sent but not yet accepted and not expired).

### Invites

Go to **Admin > Invites**.

Fill in the email address you want to invite, choose their role (User or Admin), and click **Send invite**. An email goes out with a unique sign-up link.

The invite list shows all recent invites with their status:

- **Pending** — sent, not yet accepted, not expired
- **Accepted** — the person signed up
- **Expired** — the link timed out before they used it

If an invite expires, send a new one. Inviting someone as Admin gives them full access to this panel, including the ability to ban users and delete any track.

### Users

Go to **Admin > Users**.

The table shows every member: name, email, username, role, and join date.

To ban a user, click **Ban** in their row. A banned user can't log in. Click **Unban** to restore access. You can't ban yourself.

### Tracks

Go to **Admin > Tracks**.

This lists every track on the platform, including tracks from all members. You have the same edit and delete controls here that members have on their own tracks — hover a track to see the pencil and trash icons.

Use this to remove tracks that violate community rules, or to help a member fix metadata they can't edit themselves.

### Comments

Go to **Admin > Comments**.

This lists every comment on the platform, showing the track it belongs to, who posted it, and when. Click the trash icon in a row to delete a comment. You'll be asked to confirm before anything is removed.
