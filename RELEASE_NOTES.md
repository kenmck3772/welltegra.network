# Release Notes — Tailwind Build & Security Hardening

## Summary

- Replaced Tailwind CDN usage with a CLI-built `assets/css/tailwind.css`, added `package.json` tooling, and documented the workflow in `tailwind.config.js`.
- Hardened external assets with CSP meta tags, SRI-pinned CDNs, local favicon/logo assets, and `rel="noopener noreferrer"` for outbound links.
- Added Playwright-assisted console regression check, link health scan, and captured Lighthouse metrics for ongoing performance work.
- Resolved first-visit auto-play errors by queueing `showView` calls until the SPA boot sequence completes and initializing survey state (`computed`) before render.
- Expanded the CSP `connect-src` allowlist to include the pinned CDNs, clearing source-map fetch violations while keeping the policy tight.

## Verification

1. Install dependencies: `npm install`.
2. Build Tailwind CSS: `npm run build:css`.
3. Serve locally (e.g., `python -m http.server 8000`) and load `http://127.0.0.1:8000/index.html`.
4. Confirm browser console is clean aside from intentional analytics logging.
5. Run link lint: `npm run lint:links` (requires local server running).
6. Optional: re-run Lighthouse `npx lighthouse http://127.0.0.1:8000/index.html --output=html --chrome-flags="--headless --no-sandbox"` and note CDN certificate noise is confined to headless mode.
