# Release Notes — CSP Cleanup & Console Regression

## Summary

- Removed duplicated Content-Security-Policy `<meta>` directives and added `https://welltegra.network` to the `media-src` allowlist so hero videos render without console violations.
- Redirected archived hero video/poster references away from the missing `thumbnail.*` assets to the committed `assets/hero4.mp4` + `assets/logo.jpg`, eliminating remote 404s during playback.
- Rebuilt Tailwind via `npm run build:css` to keep `assets/css/tailwind.css` current after CSP adjustments.
- Refreshed project audit artifacts (`CHECKLIST.md`) with latest console captures, JSON validation notes, Lighthouse metrics, and action items.

## Verification

1. Install dependencies: `npm install` (only required once per environment).
2. Serve locally (`python -m http.server 8000`) and browse:
   - `http://127.0.0.1:8000/index.html`
   - `http://127.0.0.1:8000/index-v23-fresh.html`
   - `http://127.0.0.1:8000/test-v23-1761097711.html`
3. Confirm browser console is free of CSP media errors and that hero videos autoplay using the bundled `assets/hero4.mp4` source (poster should load from `assets/logo.jpg`).
4. Rebuild Tailwind if styles change: `npm run build:css`.
5. Optional: rerun Lighthouse `npx lighthouse http://127.0.0.1:8000/index.html --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance --preset=desktop` to compare metrics with the recorded baseline (Performance 0.99, TBT 0 ms).
