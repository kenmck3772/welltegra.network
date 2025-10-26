# Release Notes — Tailwind Build Pipeline Hardening

## Summary

- Moved the structured program dossier dataset and rendering helpers into `assets/js/app.js` so the planner keeps pairing template checklists with W666-specific evidence after the markup cleanup.
- Consolidated `index.html` into a single valid document by removing duplicate `<!DOCTYPE>`/`<head>` blocks, aligning the CSP/meta tags, and switching the masthead logo to the local asset for CSP compliance.
- Confirmed the repository excludes the unrelated clan map assets so the experience stays focused on the W666 engineering walkthrough.
- Added a structured program dossier dataset that pairs reusable template checklists with W666-specific inputs across data intake, design, execution, logistics, risk, and handover stages.
- Removed the Tailwind CDN bootstrap from `index.html` and rely solely on the minified CLI build (`assets/css/tailwind.css`).
- Rehomed the large inline `<style>` block into `styles/tailwind.css` so custom theming ships alongside the Tailwind bundle.
- Extracted the application logic into `assets/js/app.js`, tightened the CSP to `script-src 'self' …`, and rebound the PDF export trigger via `addEventListener`.
- Consolidated third-party script hygiene by dropping duplicate `Chart.js`, `jspdf`, and `html2canvas` tags and extending SRI coverage with `referrerpolicy="no-referrer"`.
- Vendored `Chart.js`, `jspdf`, and `html2canvas` under `assets/vendor/` so the console stays clean in offline/TLS-restricted previews and CSP can lock to `script-src 'self'`.
- Removed Google Fonts in favour of embedded Inter/Roboto Mono data-URI font faces so the repo stays binary-free while keeping typography stable.
- Added a meta description and canonical URL to improve SEO snippet quality and prevent duplicate indexing.
- Added `rel="noopener noreferrer"` to the whitepaper download CTA so all external tabs are isolated.
- Regenerated the Tailwind bundle via `npm run build:css` to ensure the shipped CSS matches the source tokens.
- Rewrote `CHECKLIST.md` to document console captures, JSON validation, link crawl, performance opportunities, accessibility/SEO backlog, and security hygiene notes.
- Added an accessible hero video toggle (`index.html` + `assets/js/app.js`) so users can pause/resume autoplay and get clear state feedback.
- Enhanced the hero video toggle with an icon, polite status messaging, and an automatic pause for users who prefer reduced motion.
- Marked the hero video as decorative, limited its preload to metadata, and added intrinsic dimensions to the masthead logo to prevent layout shift.
- Converted planner well cards into keyboard-activatable buttons and now announce selection state with `aria-pressed`.
- Converted the primary navigation into real buttons and wired `aria-current`/`aria-disabled` plus `aria-hidden` view toggles so keyboard and assistive users get accurate state changes.
- Added an explicit screen-reader label to the theme toggle control.
- Refined the FAQ accordion generation to emit `aria-expanded`/`aria-controls` wiring and maintain keyboard/assistive parity.
- Normalized mojibake em dash characters in the hero copy to the proper `—` glyph.

## Verification

1. Install dependencies if missing: `npm install`.
2. Build the production stylesheet: `npm run build:css`.
3. Start a local preview: `python -m http.server 8000`.
4. Visit `http://127.0.0.1:8000/index.html` and confirm the console is clean (no CDN TLS errors) and the hero toggle pauses/resumes playback.
5. Scroll to the ROI calculator and verify the savings bar chart renders (Chart.js now loads from `assets/vendor/`).
6. Use the `Tab` key to step through the header navigation; the focus ring should be visible, `Home/Planner` remain active, and gated tabs (e.g., Commercial) stay disabled until a plan exists.
7. Generate a plan for W666 and confirm the new "Structured Program Dossier" card renders with paired template checklists and well-specific bullets (including cost codes and deliverables).
8. Use the arrow or tab keys to focus a well card in the planner grid and press `Enter` or `Space` to select it; the card should show the selected styling and announce `aria-pressed="true"` in devtools.
9. Toggle the operating system's reduced-motion setting (or launch Playwright/Chrome DevTools with `prefers-reduced-motion: reduce`) and confirm the hero video starts paused until the user explicitly plays it.
10. Optional: `npm run lint:links` (with the local server running) to verify link health remains green.
11. Visit `http://127.0.0.1:8000/index.html` and confirm the console is clean (no Tailwind CDN warning) and the hero toggle pauses/resumes playback.
12. Use the `Tab` key to step through the header navigation; the focus ring should be visible, `Home/Planner` remain active, and gated tabs (e.g., Commercial) stay disabled until a plan exists.
13. Toggle the operating system's reduced-motion setting (or launch Playwright/Chrome DevTools with `prefers-reduced-motion: reduce`) and confirm the hero video starts paused until the user explicitly plays it.
14. Optional: `npm run lint:links` (with the local server running) to verify link health remains green.
15. Start a local preview: `python3 -m http.server 8080`.
16. Visit `http://127.0.0.1:8080/index.html` and confirm the console is clean (no Tailwind CDN warning).
17. Optional: `npm run lint:links` (with the local server running) to verify link health remains green.
