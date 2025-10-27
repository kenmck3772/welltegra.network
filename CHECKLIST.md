# Audit Checklist — WellTegra Static Site

## Console Output

| Stage                                                | Command                                                                          | Result                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Historical (pre-CLI build)                           | `python3 -m http.server 8080` + Playwright console capture                       | `WARNING: cdn.tailwindcss.com should not be used in production…` |
| Current (post-login removal + accessible nav)        | `python -m http.server 8000` + Playwright hero toggle + nav traversal            | `NO_CONSOLE_MESSAGES`                                            |
| Current (prefers-reduced-motion)                     | `python -m http.server 8000` + Playwright context with `reduced_motion='reduce'` | `NO_CONSOLE_MESSAGES`                                            |
| Current (a11y refinements + self-hosted vendor libs) | `python -m http.server 8000` + Playwright console capture                        | `NO_CONSOLE_MESSAGES`                                            |

````bash
python -m http.server 8000
# Playwright script toggles the hero video and tabs through the primary navigation to surface runtime errors

```bash
python -m http.server 8000
# Playwright script toggles the hero video and tabs through the primary navigation to surface runtime errors
| Before Tailwind CLI build (with CDN script) | `python3 -m http.server 8080` + Playwright console capture | `WARNING: cdn.tailwindcss.com should not be used in production…` |
| After CLI build (current commit) | `python3 -m http.server 8080` + Playwright console capture | `NO_CONSOLE_MESSAGES` |

```bash
python3 -m http.server 8080
# Playwright capture executed via browser_container (see run_playwright_script usage in logs)
````

````text
Before: WARNING: cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI…
After: NO_CONSOLE_MESSAGES (default + reduced motion contexts)
context protocol giving Claude direct access to manipulate your 3 D world it's like giving your a with blender MCP you can create modify and delete 3D objects on command apply
```text
After (a11y refinements + self-hosted libs/fonts): {"logs": [], "failures": []}
````

````

```text
Playwright reduced-motion context:
CONTEXT reduce
CONSOLE_LOGS []
MATCHES True
VIDEO_STATE True
TOGGLE_TEXT Play background video
TOGGLE_ICON ▶
````

```text
Playwright reduced-motion context:
CONTEXT reduce
CONSOLE_LOGS []
MATCHES True
VIDEO_STATE True
TOGGLE_TEXT Play background video
TOGGLE_ICON ▶
```

After: NO_CONSOLE_MESSAGES

````

## Data Integrity
- `find . -maxdepth 3 -name 'clans.json'` → no results (`clans.json` not shipped in this repo).
- `find . -maxdepth 3 -name 'map-data.json'` → no results (map integration not present, so no cross-reference possible).
- `python -m json.tool equipment-catalog.json` (no errors; validates schema content).
- `python -m json.tool service-line-templates.json` (no errors).
- Archived unused demo pages (`index-v23-fresh.html`, `test-v23-1761097711.html`) and legacy media (`hero4.mp4`, login loops, workbook export) so only referenced assets remain in `assets/`.

## Link Health
- `npm run lint:links` (with `python -m http.server 8000` running): 13 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 13 links in 0.342 seconds.
- `npm run lint:links` (with `python -m http.server 8000` running): 10 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 10 links in 0.393 seconds.
- `npm run lint:links` (with `python3 -m http.server 8000` running): 14 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 14 links in 0.665 seconds.
````

## Tailwind Build Pipeline

- Removed the CDN bootstrap `<script src="https://cdn.tailwindcss.com">` from `index.html`.
- Rehomed the bespoke theme CSS (formerly inline) into `styles/tailwind.css` so it is compiled with Tailwind and cached via the static asset pipeline.
- Extracted the monolithic inline script to `assets/js/app.js` and wired it with `defer`, allowing the CSP `script-src` directive to drop `'unsafe-inline'`.
- `npm run build:css` regenerates `assets/css/tailwind.css` via Tailwind CLI + PostCSS (output minified; see git diff for new hash section).
- Captured Browserslist advisory (`caniuse-lite is outdated`) — informational only.

## Performance Opportunities (Top 5)

| #   | Location                                    | Recommendation                                                                                                                                  |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | `index.html` L102-L104                      | ✅ Added `preload="metadata"` so the hero video only pulls metadata on first paint.                                                             |
| 2   | `styles/tailwind.css` font-face block       | ✅ Embedded Inter/Roboto Mono fonts as base64 data URIs to avoid binary blobs while keeping typography intact.                                  | `src: url('data:font/woff2;base64,...') format('woff2');` |
| 3   | `assets/js/app.js` L2202-L2248              | Lazy-init `initSavingsChart()` when the ROI calculator view becomes active so Chart.js and canvas rendering do not cost time on login.          |
| 4   | `assets/css/tailwind.css` watermark block   | Convert `assets/watermark.jpg` to WebP/AVIF and drop the legacy JPEG to reduce repeating background payloads.                                   |
| 5   | `assets/js/app.js` live data interval setup | Debounce the simulation interval when switching away from the performer view to avoid background timers keeping the tab busy.                   |
| 1   | `index.html` L102-L104                      | Add `preload="metadata"` (or swap in a lighter poster) for the hero video so autoplay does not fetch the entire MP4 on first paint.             |
| 2   | `index.html` L15-L22                        | Preload the Inter/Roboto Mono font files (`rel="preload" as="font" type="font/woff2" crossorigin`) to cut layout shifts before webfonts arrive. |
| 3   | `assets/js/app.js` L2202-L2248              | Lazy-init `initSavingsChart()` when the ROI calculator view becomes active so Chart.js and canvas rendering do not cost time on login.          |
| 4   | `assets/css/tailwind.css` watermark block   | Convert `assets/watermark.jpg` to WebP/AVIF and drop the legacy JPEG to reduce repeating background payloads.                                   |
| 5   | `assets/js/app.js` live data interval setup | Debounce the simulation interval when switching away from the performer view to avoid background timers keeping the tab busy.                   |
| 1   | `index.html` L134-L141                      | Add `preload="metadata"` (or switch to an optimized poster) for the autoplay hero video to avoid pulling the full MP4 on first paint.           |
| 2   | `index.html` L65-L72                        | Convert the repeated remote watermark background to a locally optimized WebP (current PNG served from production host).                         |
| 3   | `index.html` L211-L238                      | Consolidate duplicated KPI cards (remnants of diff markers) to cut DOM weight and reduce layout cost.                                           |
| 4   | `index.html` L351-L420                      | Defer loading of heavy dashboard charts (`Chart.js`) until the ROI calculator view is visible.                                                  |
| 5   | `index.html` L1657-L1738                    | Lazy load embedded demo videos and gate them behind user interaction to reduce Total Blocking Time.                                             |

## Accessibility & SEO (Top 10 Fixes)

| #   | File:Line                                            | Issue                                                                                                                            | Suggested Diff                                                                                                                                             |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `index.html` L35-L94; `assets/js/app.js` L654-L756   | ✅ Primary nav now uses `<button type="button">` controls with `aria-current` and gated views toggle `aria-disabled`/`disabled`. | Converted each nav item to a real button and taught `switchView()`/`updateNavLinks()` to manage `aria-current`, `aria-disabled`, and keyboard focus state. |
| 2   | `index.html` L73-L77                                 | ✅ Theme toggle button now exposes an accessible label.                                                                          | Added `aria-label="Toggle light and dark theme"` to the theme control while keeping the SVGs decorative.                                                   |
| 3   | `index.html` L102-L104                               | ✅ Marked the hero video as decorative (`aria-hidden="true"`) and limited preload to metadata.                                   | Added `preload="metadata"` plus `aria-hidden="true"` on the hero `<video>` tag.                                                                            |
| 4   | `assets/js/app.js` L768-L812                         | ✅ Planner cards now expose button semantics and keyboard activation.                                                            | Rendered planner cards as `<article role="button" tabindex="0">` and update selection with `aria-pressed` + `keydown` handler.                             |
| 5   | `assets/js/app.js` L654-L662                         | ✅ Hidden views are now marked `aria-hidden="true"` until activated.                                                             | `switchView()` tags every `.view-container` as `aria-hidden` before revealing the target view so screen readers ignore inactive sections.                  |
| 6   | `index.html` L11-L18                                 | ✅ Added meta description for search previews.                                                                                   | Inserted `<meta name="description" …>` detailing the v23 experience.                                                                                       |
| 7   | `index.html` L11-L18                                 | ✅ Canonical URL now present for GitHub Pages deployment.                                                                        | Added `<link rel="canonical" href="https://welltegra.network/">`.                                                                                          |
| 8   | `index.html` L33-L41                                 | ✅ Masthead logo now ships with intrinsic dimensions to avoid layout shift.                                                      | Added `width="48" height="48"` on the header logo `<img>` tag.                                                                                             |
| 9   | `index.html` L110-L114, `assets/js/app.js` L569-L636 | ✅ Hero video toggle now ships with an icon, polite status text, and respects `prefers-reduced-motion`.                          | `index.html`: inject icon + live region spans. `assets/js/app.js`: swap text/icon in `updateToggleState()`, add reduced-motion guard.                      |
| 10  | `assets/js/app.js` PDF export alerts                 | `alert()` usage during PDF failures is disruptive for screen readers.                                                            | Replace with an inline status region (`role="alert"`).                                                                                                     |

## Security Hygiene

- Vendor libraries (`Chart.js`, `jspdf`, `html2canvas`) vendored into `assets/vendor/` to avoid third-party TLS issues and allow `script-src 'self'`.
- Google Fonts removed; Inter/Roboto Mono embedded via data-URI `@font-face` declarations inside the Tailwind source so the repo stays text-only.
- CSP tightened to `'self'` across script/style/img/font/connect/media directives while preserving `form-action`/`base-uri` restrictions.
- `rel="noopener noreferrer"` remains on external download anchors (see `index.html` L245-L246).
  | 3 | `index.html` L102-L104 | Hero video lacks textual description for screen readers. | Add `aria-label` or `aria-describedby` to describe the footage (or mark `aria-hidden="true"` if purely decorative). |
  | 4 | `assets/js/app.js` L706-L732 | Planner cards are clickable `<div>` elements with no keyboard support. | Add `tabindex="0"`, `role="button"`, and handle `Enter`/`Space` keypress events. |
  | 5 | `assets/js/app.js` L654-L662 | ✅ Hidden views are now marked `aria-hidden="true"` until activated. | `switchView()` tags every `.view-container` as `aria-hidden` before revealing the target view so screen readers ignore inactive sections. |
  | 6 | `index.html` L14-L18 | Document head lacks a meta description for search previews. | Add `<meta name="description" content="…">`. |
  | 7 | `index.html` L14-L18 | No canonical URL declared for the GitHub Pages deployment. | Add `<link rel="canonical" href="https://welltegra.network/">`. |
  | 8 | `index.html` L37-L43 | Login logo image omits `width`/`height`, causing layout shift. | Supply intrinsic dimensions (`width="96" height="96"`) or CSS aspect ratio. |
  | 9 | `index.html` L110-L114, `assets/js/app.js` L569-L636 | ✅ Hero video toggle now ships with an icon, polite status text, and respects `prefers-reduced-motion`. | `index.html`: inject icon + live region spans. `assets/js/app.js`: swap text/icon in `updateToggleState()`, add reduced-motion guard. |
  | 10 | `assets/js/app.js` PDF export alerts | `alert()` usage during PDF failures is disruptive for screen readers. | Replace with an inline status region (`role="alert"`). |
  | 1 | `index.html` L1-L16 | Duplicate `<!DOCTYPE html>`, `<html>`, and `<head>` tags produce invalid DOM. | Remove the repeated block so only one document scaffold remains. |
  | 2 | `index.html` L32-L96 | ✅ Primary navigation deduplicated; removed the stray `<a>` block that caused duplicate focus targets. | `index.html`: retain a single button-based tablist; `assets/js/app.js`: no change required because `querySelectorAll('.nav-link')` now returns only the intended controls. |
  | 3 | `index.html` L112-L116 | Duplicate `id="theme-icon-light"` / `id="theme-icon-dark"` violate unique ID requirement. | Rename or remove the duplicated SVGs after deduplicating nav. |
  | 4 | `index.html` L134-L141 | Autoplay hero video lacks caption toggle or pause control for accessibility. | Add a visible pause button tied to `aria-controls="hero-video"`. |
  | 5 | `index.html` L211-L420 | `@@ … @@` diff markers render as text and confuse screen readers. | Remove the diff markers and redundant blocks they surround. |
  | 6 | `index.html` L351-L360 | KPI feature copy includes mojibake characters (`â€”`). | Normalize to proper em dash (`—`) in content strings. |
  | 7 | `index.html` L608-L716 | Accordion buttons rely on color only for state cues. | Add `aria-expanded` bindings and focus-visible styles in CSS. |
  | 8 | `index.html` L1162-L1188 | Secondary hero video declared `aria-hidden="true"` but remains focusable via keyboard. | Add `tabindex="-1"` or remove redundant video element. |
  | 9 | `index.html` L7831-L7838 | Canonical + description meta tags live in the duplicated `<head>` block. | Move SEO meta tags into the primary `<head>` so crawlers ingest them. |
  | 10 | `index.html` L1104-L1112 | Logo `<img>` lacks `width`/`height` attributes for CLS mitigation. | Add intrinsic size attributes or use `style` to reserve space. |

## Security Hygiene

- External libraries now pinned and protected via `integrity` + `crossorigin` (`Chart.js`, `jspdf`, `html2canvas`).
- Added `referrerpolicy="no-referrer"` to PDF export dependencies.
- Audited `target="_blank"` anchors — all now include `rel="noopener noreferrer"` (see `index.html` L245-L246).
- Hardened the CSP by removing `'unsafe-inline'` from `script-src` and binding the PDF export button through `addEventListener` instead of inline handlers.
- No Leaflet usage detected; the placeholder CSP note tied to `index-v23-fresh.html` was retired when that legacy demo page was archived.
