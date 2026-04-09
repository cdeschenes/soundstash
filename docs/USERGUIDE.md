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

You need an invite to join. An admin sends one to your email address. Open the link in the email, and you'll be walked through creating your account.

Once you're in, it's worth spending two minutes on your profile before anything else. Go to **Settings** (the gear icon in the top bar) and add a display name at minimum — that's what other members see on your tracks and comments.

<!-- screenshot: sign-up page from invite link -->

---

## The feed

The feed is the main page. It shows all public tracks from every member, newest first.

<!-- screenshot: feed page -->

**Playing from the feed.** Click the play button on any track to start listening without leaving the page. The waveform shows as the track plays, and you can click anywhere on it to jump to that position.

**Continuous playback.** Audio keeps playing while you scroll or click around the feed. It stops if you navigate away to a track's detail page and start playing something there.

**Opening a track.** Click the track title or artwork to go to its detail page, where you'll find the full waveform, description, and comments.

---

## Listening to a track

The track detail page has the full waveform at the top. Click anywhere on it to seek. The duration and any metadata the uploader added (genre, tags, description) appear below.

<!-- screenshot: track detail page -->

If the uploader added cover artwork, it appears next to the waveform. Not all tracks have artwork. Click the artwork thumbnail to view a full-size version. Click outside it or press × to close.

---

## Uploading a track

Click **Upload** in the top bar to open the upload page.

<!-- screenshot: upload form -->

**Step 1: drop your file.** Drag an audio file onto the dropzone, or click it to browse. Supported formats: MP3, FLAC, WAV, M4A, OGG, Opus. Maximum file size is 500 MB.

**Step 2: fill in the details.**

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Shown everywhere the track appears |
| Description | No | Longer notes about the track |
| Genre | No | One genre, e.g. "Electronic" |
| Tags | No | Comma-separated, e.g. `ambient, lo-fi, chill` |

**Step 3: add artwork (optional).** Click **Add artwork** to pick an image file. A preview appears immediately. JPEG, PNG, and WebP are accepted. You can remove the image before uploading by clicking **Remove** underneath the preview.

**Step 4: upload.** Click **Upload Track**. The button changes to "Uploading..." while the file transfers, then "Processing waveform..." while the server generates the audio waveform. When it's done, you're taken straight to the track page.

If processing fails, you'll see a notice that the upload was saved but may not play correctly. The track still appears in your profile.

---

## Managing your tracks

Hover over any track you uploaded to see two icons appear on the right: a pencil (edit) and a trash can (delete).

<!-- screenshot: track row with edit/delete buttons visible on hover -->

### Editing a track

Click the pencil to open the edit dialog. You can change:

- Title
- Description
- Genre
- Tags (comma-separated)
- Cover artwork (click **Change artwork** to pick a new file)
- Visibility — the **Public** checkbox controls whether the track appears in the feed. Uncheck it to make it private, visible only to you.

Click **Save** when you're done. If you change the title significantly, the track's URL will update and you'll be redirected automatically.

### Deleting a track

Click the trash can icon and confirm the deletion. This is permanent and cannot be undone.

---

## Comments

Comments are on each track's detail page, below the waveform.

**Posting a comment.** Click **Post comment**. A text box appears. Type your comment (up to 1,000 characters) and click **Post comment** again to submit. Click **Cancel** to close the box without posting.

**Editing a comment.** Hover over a comment you posted and click the pencil icon that appears. The comment text becomes an editable box. Make your changes and click **Save**, or click **Cancel** to discard them. Only you can edit your own comments.

**Deleting a comment.** Hover over your comment and click the trash icon. Admins can delete any comment.

---

## Your profile

Your public profile shows your display name, bio, location, website, and all your public tracks.

To visit your own profile, click your avatar in the top bar.

Other members can visit your profile too. Tracks marked private do not appear there.

---

## Settings

Go to **Settings** (gear icon in the top bar) to update your profile and appearance.

<!-- screenshot: settings page -->

### Profile info

| Field | Notes |
|-------|-------|
| Display name | What members see on your tracks and comments |
| Bio | Short text, up to 500 characters |
| Website | Full URL, e.g. `https://yoursite.com` |
| Location | Free text, e.g. "Portland, OR" |

Click **Save changes** after editing.

### Avatar

Click **Change avatar** to upload a new profile picture. JPEG, PNG, and WebP are accepted, up to 5 MB. The preview updates immediately after upload.

### Theme

Choose between **Light**, **Dark**, **System**, and **Warm**. System follows your operating system setting. Warm is a dark theme using a navy and orange colour palette. The change takes effect immediately — no save button needed.

---

## Admin guide

> This section is for admins only. Regular members do not see the Admin panel.

Access the admin panel from the top bar. It has five sections: Dashboard, Users, Invites, Tracks, and Comments.

<!-- screenshot: admin panel navigation -->

### Dashboard

Shows four live counts: total users, total tracks, total comments, and pending invites (sent but not yet accepted, and not expired). Useful for a quick sanity check.

### Sending invites

Go to **Admin > Invites**.

Fill in the email address of the person you want to invite, choose their role (User or Admin), and click **Send invite**. An email goes out with a unique sign-up link.

The invite list below the form shows all recent invites with their status:

- **Pending** — sent, not yet accepted, not expired
- **Accepted** — the person signed up
- **Expired** — the link timed out before they used it

If an invite expires, send a new one.

> Inviting someone as Admin gives them full access to this panel, including the ability to ban users and delete any track. Only do this intentionally.

### Managing users

Go to **Admin > Users**.

The table shows every member: their name, email, username, role, and when they joined.

To ban a user, click **Ban** in their row. A banned user cannot log in. Click **Unban** to restore access. You cannot ban yourself.

### Managing tracks

Go to **Admin > Tracks**.

This shows all tracks on the platform, including tracks from every member. You have the same edit and delete controls here that members have on their own tracks — hover a track to see the pencil and trash icons.

Use this to remove tracks that violate community rules or to help a member fix metadata they can't edit themselves.

### Moderating comments

Go to **Admin > Comments**.

This lists every comment on the platform — showing the track it belongs to, who posted it, and when. Click the trash icon in a row to delete a comment permanently. You'll be asked to confirm before anything is removed.

Use this to remove comments that are off-topic, spam, or otherwise inappropriate.
