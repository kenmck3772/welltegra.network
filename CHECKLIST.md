# Audit Checklist — WellTegra Static Site

## Console Output
| Stage | Command | Result |
| --- | --- | --- |
| Before CSP cleanup | `node -e "const {chromium}=require('playwright'); …"` | CDN-hosted Chart.js, jspdf/html2canvas, Google Fonts, inline styles/scripts blocked by CSP (`script-src 'self'`, `style-src 'self'`, `font-src 'self'`).【F:index.html†L5-L18】【2dbb2c†L1-L92】 |
| After CSP + local assets | `node -e "const {chromium}=require('playwright'); …"` | `NO_CONSOLE_MESSAGES` after self-hosting vendor bundles and tightening CSP.【16596b†L1】【F:index.html†L5-L18】 |

## Data Integrity
- `find . -name 'clans.json' -o -name 'map-data.json'` → no results (map layer not part of this repo).【d57d1a†L1-L2】
- `python3 -m json.tool equipment-catalog.json | head` (valid JSON).【2e1759†L1-L10】
- `python3 -m json.tool service-line-templates.json | head` (valid JSON).【41f153†L1-L10】

## Link Health
- `npm run lint:links` (local server on :8000) — 9 URLs crawled, 0 failures.【55759a†L1-L6】【21c9a3†L1】

## Tailwind Build Pipeline
- `npm run build:css` regenerates `assets/css/tailwind.css` through the Tailwind CLI; browserslist warning is informational only.【6a05cb†L1-L5】【a58981†L1-L7】
- `index.html` only references the compiled stylesheet and self-hosted vendor bundles; the Tailwind CDN script and Google Fonts preconnects have been removed.【F:index.html†L10-L18】

## Latest Remediation (Current Pass)
- Added a skip link and converted the primary navigation into a semantic tablist wired to each view, keeping the CSP-safe bundle intact.【F:index.html†L25-L73】
- Provided list semantics for the hero feature cards, improved ROI sliders with `aria-valuetext`, and added fallback copy for the savings chart canvas.【F:index.html†L103-L130】
- Introduced planner and analyzer status regions so workflow updates and PDF export results are announced without disruptive alerts.【F:index.html†L135-L141】【F:index.html†L232-L240】【F:assets/js/app.js†L2337-L2381】【F:assets/js/app.js†L2856-L2920】
- Announced planner selections and AI recommendations programmatically while exposing ROI slider updates via `aria-valuetext` for screen readers.【F:assets/js/app.js†L2289-L2313】【F:assets/js/app.js†L2337-L2379】
- Removed the misleading `download` attribute from the external whitepaper link to avoid implying a local asset.【F:index.html†L226-L233】

## Performance Opportunities (Top 5)
| # | Location | Recommendation |
| --- | --- | --- |
| 1 | `index.html` L14-L18; `assets/js/app.js` L2224-L2278 | Swap the eager `<script src="assets/vendor/chart.umd.min.js">` for a dynamic import triggered when the ROI calculator enters view (e.g., `IntersectionObserver`) to defer ~70KB of parsing on first paint.【F:index.html†L14-L18】【F:assets/js/app.js†L2224-L2278】 |
| 2 | `assets/js/app.js` L2258-L2278 | Memoise `initSavingsChart()` so it only runs after `calculateROI()` has data; today Chart.js initialises immediately even if users never touch the sliders.【F:assets/js/app.js†L2258-L2278】 |
| 3 | `styles/tailwind.css` L60-L88 | Convert `assets/watermark.jpg` to a compressed WebP/AVIF alternative (or gate it behind media queries) to avoid tiling a 360KB JPEG background on every page load.【F:styles/tailwind.css†L60-L88】 |
| 4 | `assets/js/app.js` L276-L314 | Large emoji icons are rendered from literal UTF-8; replace with SVG sprites or utility classes to reduce layout thrash on older Android browsers and keep fonts consistent.【F:assets/js/app.js†L276-L314】 |
| 5 | `assets/vendor/jspdf.umd.min.js`, `assets/vendor/html2canvas.min.js` | Lazy-load PDF export dependencies on demand (e.g., `import('assets/vendor/jspdf.umd.min.js')`) so the landing page avoids parsing 600KB of libraries unless the analyzer view is active.【F:index.html†L16-L18】【F:assets/js/app.js†L2733-L2922】 |

## Accessibility & SEO (Top 10 Fixes)
| # | File:Line | Issue | Suggested Diff |
| --- | --- | --- | --- |
| 1 | `assets/js/app.js` L2324-L2363 | The primary tablist now roves focus with `tabindex`, but lacks arrow-key support to move between tabs. | Add a `keydown` handler on `.nav-link` that intercepts ArrowLeft/ArrowRight to focus the previous/next tab and activate it on Enter/Space. |
| 2 | `index.html` L142-L149 | The step indicator is purely decorative; screen readers receive no progress context. | Treat the stepper as `<ol role="list">` with `aria-current="step"` on the active item and add visually hidden labels describing each step. |
| 3 | `index.html` L170-L215 | Objective/problem selectors are divs without `<fieldset>`/`<legend>`, so grouped radio semantics remain unclear. | Wrap each question block in `<fieldset>` with a `<legend>` summarising the prompt. |
| 4 | `assets/js/app.js` L2370-L2404 | AI recommendation cards are clickable divs without keyboard support. | Render them as `<button>` elements or apply `role="button" tabindex="0"` plus key handlers for Enter/Space. |
| 5 | `index.html` L216-L228 | Logistics tables lack `<caption>`s and the search inputs depend on placeholder text alone. | Provide `<label for>` pairs and short captions describing each table. |
| 6 | `assets/js/app.js` L1660-L1706 | Logistics conflict summaries still inject HTML via template strings; potential XSS if data becomes user-supplied. | Build table rows with `document.createElement` and `textContent`. |
| 7 | `assets/js/app.js` L2289-L2313 | Planner objective cards toggle visually but remain divs; `role="radio"` semantics are missing. | Update renderers to output `<label>`/`<input type="radio">` pairs inside fieldsets for consistent semantics. |
| 8 | `index.html` L226-L233 | Whitepaper CTA opens a new tab without warning assistive tech users. | Append `aria-describedby` or sr-only copy indicating the Google Docs link opens in a new window. |
| 9 | `index.html` L123-L129 | ROI totals update visually but `#totalSavings` is not marked live. | Add `role="status" aria-live="polite"` to the total or announce changes in JS. |
|10 | `assets/js/app.js` L2856-L2920 | PDF status text updates silently; errors are easy to miss. | Give the status container `role="alert"` or focus it after updates (`tabindex="-1"`). |

## Security Hygiene
- Vendor libraries (`Chart.js`, `jspdf`, `html2canvas`) live under `assets/vendor/` and load with `defer`, so `script-src 'self'` stays locked.【F:index.html†L14-L18】
- The CSP `frame-ancestors` directive must be enforced at the HTTP header level (meta tags are ignored); add the same policy to GitHub Pages or the CDN configuration for clickjacking protection.【3c0187†L1-L2】
