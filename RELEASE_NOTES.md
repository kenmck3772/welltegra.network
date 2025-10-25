# Release Notes — Tailwind Build Pipeline Hardening

## Summary
- Removed the Tailwind CDN bootstrap from `index.html` and rely solely on the minified CLI build (`assets/css/tailwind.css`).
- Rehomed the large inline `<style>` block into `styles/tailwind.css` so custom theming ships alongside the Tailwind bundle.
- Extracted the application logic into `assets/js/app.js`, tightened the CSP to `script-src 'self' …`, and rebound the PDF export trigger via `addEventListener`.
- Consolidated third-party script hygiene by dropping duplicate `Chart.js`, `jspdf`, and `html2canvas` tags and extending SRI coverage with `referrerpolicy="no-referrer"`.
- Added `rel="noopener noreferrer"` to the whitepaper download CTA so all external tabs are isolated.
- Regenerated the Tailwind bundle via `npm run build:css` to ensure the shipped CSS matches the source tokens.
- Rewrote `CHECKLIST.md` to document console captures, JSON validation, link crawl, performance opportunities, accessibility/SEO backlog, and security hygiene notes.
- Added an accessible hero video toggle (`index.html` + `assets/js/app.js`) so users can pause/resume autoplay and get clear state feedback.
- Enhanced the hero video toggle with an icon, polite status messaging, and an automatic pause for users who prefer reduced motion.
- Refined the FAQ accordion generation to emit `aria-expanded`/`aria-controls` wiring and maintain keyboard/assistive parity.
- Normalized mojibake em dash characters in the hero copy to the proper `—` glyph.

## Verification
1. Install dependencies if missing: `npm install`.
2. Build the production stylesheet: `npm run build:css`.
3. Start a local preview: `python -m http.server 8000`.
4. Visit `http://127.0.0.1:8000/index.html` and confirm the console is clean (no Tailwind CDN warning) and the hero toggle pauses/resumes playback.
5. Toggle the operating system's reduced-motion setting (or launch Playwright/Chrome DevTools with `prefers-reduced-motion: reduce`) and confirm the hero video starts paused until the user explicitly plays it.
6. Optional: `npm run lint:links` (with the local server running) to verify link health remains green.
