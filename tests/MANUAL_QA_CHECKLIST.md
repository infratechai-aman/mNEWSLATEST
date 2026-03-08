# Maithili News Manual QA Checklist

## Setup
- Start server: `node local-server.js`
- Open: `http://localhost:3000`
- Use Chromium/Chrome latest.

## A. Auth & Session
- Admin login success with valid credentials.
- Admin login fails on empty form.
- Reporter login success with approved reporter.
- Reporter login fails with invalid credentials.
- Logout returns to login screen.

## B. Reporter Submit (Full Form)
- Required fields enforce validation (title, category, full content).
- Optional fields accept valid values:
  - main image
  - second image
  - YouTube/video URL
  - thumbnail
  - tags
  - author
- Featured + show on home checkboxes persist.
- Submission appears in My Submissions.
- Same submission appears in admin moderation list.

## C. Admin Moderation & Publishing
- Approve article changes status to approved.
- Reject article changes status to rejected.
- Toggle featured updates badge/state.
- Approved article is visible in frontend-controlled sections.

## D. Frontend Control by Admin
- Breaking text shows in ticker.
- Ads toggles hide/show ad slots appropriately.
- Live TV stream URL updates `/live-tv/` embed.
- Approved business appears in business directory block.
- Approved classifieds appear in widget.
- Latest e-paper appears in widget.

## E. Article Page
- Clicking a news card opens `/article-page/?id=...`.
- Article page shows:
  - title
  - metadata
  - short quote/description
  - full content
  - related stories
- YouTube video renders and is playable if URL provided.
- Invalid/missing ID shows fallback article state.

## F. Stability
- All major routes load (no visible broken page).
- Core assets load (no obvious JS/CSS missing).
- No severe console errors in main flows.

## Evidence to capture
- Screenshot per major module tab.
- Screenshot of article page with embedded video.
- Pass/fail table with repro notes for failures.
