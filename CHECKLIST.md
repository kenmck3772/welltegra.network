# Audit Checklist — WellTegra Static Site

## Console Output
| Stage | Command | Result |
| --- | --- | --- |
| Historical (pre-CLI build) | `python3 -m http.server 8080` + Playwright console capture | `WARNING: cdn.tailwindcss.com should not be used in production…` |
| Current (login + hero toggle) | `python -m http.server 8000` + Playwright scripted login + hero video toggle | `NO_CONSOLE_MESSAGES` |
| Current (prefers-reduced-motion) | `python -m http.server 8000` + Playwright context with `reduced_motion='reduce'` | `NO_CONSOLE_MESSAGES` |

```bash
python -m http.server 8000
# Playwright script performs login + hero video pause/resume to surface runtime errors
```

```text
Before: WARNING: cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI…
After: NO_CONSOLE_MESSAGES (default + reduced motion contexts)
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
- `npm run lint:links` (with `python -m http.server 8000` running): 10 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 10 links in 0.393 seconds.
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
| 1 | `index.html` L102-L104 | Add `preload="metadata"` (or swap in a lighter poster) for the hero video so autoplay does not fetch the entire MP4 on first paint. |
| 2 | `index.html` L15-L22 | Preload the Inter/Roboto Mono font files (`rel="preload" as="font" type="font/woff2" crossorigin`) to cut layout shifts before webfonts arrive. |
| 3 | `assets/js/app.js` L2202-L2248 | Lazy-init `initSavingsChart()` when the ROI calculator view becomes active so Chart.js and canvas rendering do not cost time on login. |
| 4 | `assets/css/tailwind.css` watermark block | Convert `assets/watermark.jpg` to WebP/AVIF and drop the legacy JPEG to reduce repeating background payloads. |
| 5 | `assets/js/app.js` live data interval setup | Debounce the simulation interval when switching away from the performer view to avoid background timers keeping the tab busy. |

## Accessibility & SEO (Top 10 Fixes)
| # | File:Line | Issue | Suggested Diff |
| --- | --- | --- | --- |
| 1 | `index.html` L44-L87 | Primary nav uses `<a>` elements without `href`, so keyboard users cannot focus the links. | Convert the controls to `<button type="button">` (or supply `href="#"` + keyboard handlers). |
| 2 | `index.html` L90-L94 | Theme toggle button has no accessible label. | Add `aria-label="Toggle light and dark theme"` (and ensure icon swap stays decorative). |
| 3 | `index.html` L102-L104 | Hero video lacks textual description for screen readers. | Add `aria-label` or `aria-describedby` to describe the footage (or mark `aria-hidden="true"` if purely decorative). |
| 4 | `assets/js/app.js` L706-L732 | Planner cards are clickable `<div>` elements with no keyboard support. | Add `tabindex="0"`, `role="button"`, and handle `Enter`/`Space` keypress events. |
| 5 | `assets/js/app.js` view switching | Hidden views only toggle CSS classes; assistive tech still discovers the off-screen content. | Set `aria-hidden`/`inert` on inactive `.view-container` nodes during `switchView()`. |
| 6 | `index.html` L14-L18 | Document head lacks a meta description for search previews. | Add `<meta name="description" content="…">`. |
| 7 | `index.html` L14-L18 | No canonical URL declared for the GitHub Pages deployment. | Add `<link rel="canonical" href="https://welltegra.network/">`. |
| 8 | `index.html` L37-L43 | Login logo image omits `width`/`height`, causing layout shift. | Supply intrinsic dimensions (`width="96" height="96"`) or CSS aspect ratio. |
| 9 | `index.html` L110-L114, `assets/js/app.js` L569-L636 | ✅ Hero video toggle now ships with an icon, polite status text, and respects `prefers-reduced-motion`. | `index.html`: inject icon + live region spans. `assets/js/app.js`: swap text/icon in `updateToggleState()`, add reduced-motion guard. |
| 10 | `assets/js/app.js` PDF export alerts | `alert()` usage during PDF failures is disruptive for screen readers. | Replace with an inline status region (`role="alert"`). |

## Security Hygiene
- External libraries now pinned and protected via `integrity` + `crossorigin` (`Chart.js`, `jspdf`, `html2canvas`).
- Added `referrerpolicy="no-referrer"` to PDF export dependencies.
- Audited `target="_blank"` anchors — all now include `rel="noopener noreferrer"` (see `index.html` L245-L246).
- Hardened the CSP by removing `'unsafe-inline'` from `script-src` and binding the PDF export button through `addEventListener` instead of inline handlers.
- No Leaflet usage detected; CSP starter remains TODO (present in `index-v23-fresh.html` for future migration).

