# Audit Checklist — WellTegra Static Site

## Console Output
| Stage | Command | Result |
| --- | --- | --- |
| Historical (pre-CLI build) | `python3 -m http.server 8080` + Playwright console capture | `WARNING: cdn.tailwindcss.com should not be used in production…` |
| Current (post-login removal + accessible nav) | `python -m http.server 8000` + Playwright hero toggle + nav traversal | `NO_CONSOLE_MESSAGES` |
| Current (prefers-reduced-motion) | `python -m http.server 8000` + Playwright context with `reduced_motion='reduce'` | `NO_CONSOLE_MESSAGES` |
| Current (a11y refinements + self-hosted vendor libs) | `python -m http.server 8000` + Playwright console capture | `NO_CONSOLE_MESSAGES` |

```bash
python -m http.server 8000
# Playwright script toggles the hero video and tabs through the primary navigation to surface runtime errors
```

```text
Before: WARNING: cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI…
After: NO_CONSOLE_MESSAGES (default + reduced motion contexts)

```text
After (a11y refinements + self-hosted libs/fonts): {"logs": [], "failures": []}
```
```

```text
Playwright reduced-motion context:
CONTEXT reduce
CONSOLE_LOGS []
MATCHES True
VIDEO_STATE True
TOGGLE_TEXT Play background video
TOGGLE_ICON ▶
```

## Data Integrity
- `find . -maxdepth 3 -name 'clans.json'` → no results (`clans.json` not shipped in this repo).
- `find . -maxdepth 3 -name 'map-data.json'` → no results (map integration not present, so no cross-reference possible).
- `python -m json.tool equipment-catalog.json` (no errors; validates schema content).
- `python -m json.tool service-line-templates.json` (no errors).

## Link Health
- `npm run lint:links` (with `python -m http.server 8000` running): 13 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 13 links in 0.342 seconds.
```

## Tailwind Build Pipeline
- Removed the CDN bootstrap `<script src="https://cdn.tailwindcss.com">` from `index.html`.
- Rehomed the bespoke theme CSS (formerly inline) into `styles/tailwind.css` so it is compiled with Tailwind and cached via the static asset pipeline.
- Extracted the monolithic inline script to `assets/js/app.js` and wired it with `defer`, allowing the CSP `script-src` directive to drop `'unsafe-inline'`.
- `npm run build:css` regenerates `assets/css/tailwind.css` via Tailwind CLI + PostCSS (output minified; see git diff for new hash section).
- Captured Browserslist advisory (`caniuse-lite is outdated`) — informational only.

## Performance Opportunities (Top 5)
| # | Location | Recommendation |
| --- | --- | --- |
| 1 | `index.html` L102-L104 | ✅ Added `preload="metadata"` so the hero video only pulls metadata on first paint. |
| 2 | `styles/tailwind.css` font-face block | ✅ Embedded Inter/Roboto Mono fonts as base64 data URIs to avoid binary blobs while keeping typography intact. | `src: url('data:font/woff2;base64,...') format('woff2');` |
| 3 | `assets/js/app.js` L2202-L2248 | Lazy-init `initSavingsChart()` when the ROI calculator view becomes active so Chart.js and canvas rendering do not cost time on login. |
| 4 | `assets/css/tailwind.css` watermark block | Convert `assets/watermark.jpg` to WebP/AVIF and drop the legacy JPEG to reduce repeating background payloads. |
| 5 | `assets/js/app.js` live data interval setup | Debounce the simulation interval when switching away from the performer view to avoid background timers keeping the tab busy. |

## Accessibility & SEO (Top 10 Fixes)
| # | File:Line | Issue | Suggested Diff |
| --- | --- | --- | --- |
| 1 | `index.html` L35-L94; `assets/js/app.js` L654-L756 | ✅ Primary nav now uses `<button type="button">` controls with `aria-current` and gated views toggle `aria-disabled`/`disabled`. | Converted each nav item to a real button and taught `switchView()`/`updateNavLinks()` to manage `aria-current`, `aria-disabled`, and keyboard focus state. |
| 2 | `index.html` L73-L77 | ✅ Theme toggle button now exposes an accessible label. | Added `aria-label="Toggle light and dark theme"` to the theme control while keeping the SVGs decorative. |
| 3 | `index.html` L102-L104 | ✅ Marked the hero video as decorative (`aria-hidden="true"`) and limited preload to metadata. | Added `preload="metadata"` plus `aria-hidden="true"` on the hero `<video>` tag. |
| 4 | `assets/js/app.js` L768-L812 | ✅ Planner cards now expose button semantics and keyboard activation. | Rendered planner cards as `<article role="button" tabindex="0">` and update selection with `aria-pressed` + `keydown` handler. |
| 5 | `assets/js/app.js` L654-L662 | ✅ Hidden views are now marked `aria-hidden="true"` until activated. | `switchView()` tags every `.view-container` as `aria-hidden` before revealing the target view so screen readers ignore inactive sections. |
| 6 | `index.html` L11-L18 | ✅ Added meta description for search previews. | Inserted `<meta name="description" …>` detailing the v23 experience. |
| 7 | `index.html` L11-L18 | ✅ Canonical URL now present for GitHub Pages deployment. | Added `<link rel="canonical" href="https://welltegra.network/">`. |
| 8 | `index.html` L33-L41 | ✅ Masthead logo now ships with intrinsic dimensions to avoid layout shift. | Added `width="48" height="48"` on the header logo `<img>` tag. |
| 9 | `index.html` L110-L114, `assets/js/app.js` L569-L636 | ✅ Hero video toggle now ships with an icon, polite status text, and respects `prefers-reduced-motion`. | `index.html`: inject icon + live region spans. `assets/js/app.js`: swap text/icon in `updateToggleState()`, add reduced-motion guard. |
| 10 | `assets/js/app.js` PDF export alerts | `alert()` usage during PDF failures is disruptive for screen readers. | Replace with an inline status region (`role="alert"`). |

## Security Hygiene
- Vendor libraries (`Chart.js`, `jspdf`, `html2canvas`) vendored into `assets/vendor/` to avoid third-party TLS issues and allow `script-src 'self'`.
- Google Fonts removed; Inter/Roboto Mono embedded via data-URI `@font-face` declarations inside the Tailwind source so the repo stays text-only.
- CSP tightened to `'self'` across script/style/img/font/connect/media directives while preserving `form-action`/`base-uri` restrictions.
- `rel="noopener noreferrer"` remains on external download anchors (see `index.html` L245-L246).
- No Leaflet usage detected; CSP starter remains TODO (present in `index-v23-fresh.html` for future migration).

