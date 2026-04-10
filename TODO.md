# TODO

## Features

- [x] Ability to click on a track in the feed to open the track page
- [x] Add an edit button to tracks with options to edit the description and artwork, or delete the whole track
- [x] Admin has the ability to edit and delete all tracks uploaded by any user

## Known Gaps

Sorted easiest to hardest.

- [ ] Secure media files — enable nginx `auth_request` so media paths are not publicly accessible without a session
- [ ] Rate limiting on the upload endpoint
- [ ] Expose TrackLink fields in the upload and edit forms (external links per track)
- [ ] Add pagination UI to the feed and admin list pages
- [ ] Add unit/integration tests (currently only Playwright e2e smoke tests exist)
- [ ] Add track search and tag/genre filtering to the feed
- [ ] Add in-app notifications (e.g. new comments on your tracks)
