# TODO

## Features

- [x] Ability to click on a track in the feed to open the track page
- [x] Add an edit button to tracks with options to edit the description and artwork, or delete the whole track
- [x] Admin has the ability to edit and delete all tracks uploaded by any user

## Known Gaps

Sorted easiest to hardest.

- [x] Wire up play counting — call `/api/plays` at 80% playback threshold in WaveformPlayer (currently the endpoint exists but is never called); deduplicate so one listen session only counts once per track
- [x] Show play count on the track bar — move "X plays" to a small, unobtrusive position (bottom-right corner of the card) that doesn't compete with the waveform; update in real time after a play is recorded
- [x] Secure media files — enable nginx `auth_request` so media paths are not publicly accessible without a session
- [x] Rate limiting on the upload endpoint
- [x] Expose TrackLink fields in the upload and edit forms (external links per track)
- [ ] Add pagination UI to the feed and admin list pages
- [ ] Add unit/integration tests (currently only Playwright e2e smoke tests exist)
- [ ] Add track search and tag/genre filtering to the feed
- [ ] Add in-app notifications (e.g. new comments on your tracks)
