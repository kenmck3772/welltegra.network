# Release Notes — Duplicate Link Cleanup & Audit Refresh

## Summary

- Removed the redundant "Review the strategic roadmap source" anchor in `index.html` to prevent duplicate focus targets in the Verifiable Trust section.
- Rebuilt the Tailwind bundle via `npm run build:css` so `assets/css/tailwind.css` reflects the latest source tokens.
- Refreshed `CHECKLIST.md` with current console captures, JSON/CSV validation results, link audit output, and documented the Lighthouse limitation (missing Chrome binary).
- Refreshed `CHECKLIST.md` with current console captures, JSON validation results, link audit output, and documented the Lighthouse limitation (missing Chrome binary).
- Added a Linkinator reminder so future link checks run against an active local server and include the successful crawl output.

## Verification

1. Install dependencies if needed: `npm install`.
2. Start a local preview: `python3 -m http.server 8000`.
3. Load `http://127.0.0.1:8000/index.html` and confirm the Verifiable Trust callout shows a single strategic roadmap link.
4. Re-run Tailwind when modifying styles: `npm run build:css`.
5. Optional: `npm run lint:links` to reconfirm there are no broken internal links (start the local server first so the crawler can reach `http://127.0.0.1:8000`).
5. Optional: `npm run lint:links` to reconfirm there are no broken internal links.
