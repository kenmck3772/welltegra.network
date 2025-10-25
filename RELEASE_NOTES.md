# Release Notes — Tailwind Build Pipeline Hardening

## Summary
- Removed the Tailwind CDN bootstrap from `index.html` and rely solely on the minified CLI build (`assets/css/tailwind.css`).
- Consolidated third-party script hygiene by dropping duplicate `Chart.js`, `jspdf`, and `html2canvas` tags and extending SRI coverage with `referrerpolicy="no-referrer"`.
- Added `rel="noopener noreferrer"` to the whitepaper download CTA so all external tabs are isolated.
- Regenerated the Tailwind bundle via `npm run build:css` to ensure the shipped CSS matches the source tokens.
- Rewrote `CHECKLIST.md` to document console captures, JSON validation, link crawl, performance opportunities, accessibility/SEO backlog, and security hygiene notes.

## Verification
1. Install dependencies if missing: `npm install`.
2. Build the production stylesheet: `npm run build:css`.
3. Start a local preview: `python3 -m http.server 8080`.
4. Visit `http://127.0.0.1:8080/index.html` and confirm the console is clean (no Tailwind CDN warning).
5. Optional: `npm run lint:links` (with the local server running) to verify link health remains green.
