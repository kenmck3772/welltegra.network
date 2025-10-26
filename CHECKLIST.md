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

## HTML Integrity
- ✅ Removed duplicate `<!DOCTYPE>` and `<head>` blocks from `index.html`, consolidating the CSP, metadata, and vendor script stack into a single, valid document head.
- ✅ Pointed the masthead logo back to `assets/logo.jpg` so the tightened CSP (`img-src 'self'`) no longer needs remote exceptions.

## Data Integrity
- `find . -maxdepth 3 -name 'clans.json'` → no results (`clans.json` not shipped in this repo).
- `find . -maxdepth 3 -name 'map-data.json'` → no results (map integration not present, so no cross-reference possible).
- `rg -i "clan-map"` across the repo returns nothing, confirming no lingering navigation or sitemap references to the unrelated project.
- `python -m json.tool equipment-catalog.json` (no errors; validates schema content).
- `python -m json.tool service-line-templates.json` (no errors).
| Stage                    | Command                                               | Result                                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Before CSP cleanup       | `node -e "const {chromium}=require('playwright'); …"` | CDN-hosted Chart.js, jspdf/html2canvas, Google Fonts, inline styles/scripts blocked by CSP (`script-src 'self'`, `style-src 'self'`, `font-src 'self'`).【F:index.html†L5-L18】【2dbb2c†L1-L92】 |
| After CSP + local assets | `node -e "const {chromium}=require('playwright'); …"` | `NO_CONSOLE_MESSAGES` after self-hosting vendor bundles and tightening CSP.【16596b†L1】【F:index.html†L5-L18】                                                                                  |

## Data Integrity


## Data Integrity


## Data Integrity

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

```text
🤖 Successfully scanned 14 links in 0.665 seconds.
````

## Tailwind Build Pipeline

- Removed the CDN bootstrap `<script src="https://cdn.tailwindcss.com">` from `index.html`.
- Rehomed the bespoke theme CSS (formerly inline) into `styles/tailwind.css` so it is compiled with Tailwind and cached via the static asset pipeline.
- Extracted the monolithic inline script to `assets/js/app.js` and wired it with `defer`, allowing the CSP `script-src` directive to drop `'unsafe-inline'`.
- `npm run build:css` regenerates `assets/css/tailwind.css` via Tailwind CLI + PostCSS (output minified; see git diff for new hash section).
- Migrated the structured program dossier dataset and rendering helpers into `assets/js/app.js` so the planner continues to surface template vs. W666-specific content after the HTML cleanup.
- Captured Browserslist advisory (`caniuse-lite is outdated`) — informational only.

## Performance Opportunities (Top 5)

| #   | Location                                    | Recommendation                                                                                                                                  |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `index.html` L102-L104                      | ✅ Added `preload="metadata"` so the hero video only pulls metadata on first paint.                                                             |
| 2   | `styles/tailwind.css` font-face block       | ✅ Embedded Inter/Roboto Mono fonts as base64 data URIs to avoid binary blobs while keeping typography intact.                                  | `src: url('data:font/woff2;base64,...') format('woff2');`                                                                                                                                         |
| 3   | `assets/js/app.js` L2202-L2248              | Lazy-init `initSavingsChart()` when the ROI calculator view becomes active so Chart.js and canvas rendering do not cost time on login.          |
| 4   | `assets/css/tailwind.css` watermark block   | Convert `assets/watermark.jpg` to WebP/AVIF and drop the legacy JPEG to reduce repeating background payloads.                                   |
| 5   | `assets/js/app.js` live data interval setup | Debounce the simulation interval when switching away from the performer view to avoid background timers keeping the tab busy.                   |
| 6   | `index.html` L1980-L2240                    | ✅ Structured program dossier pairs reusable template sections with W666 data for handover.                                                     | Added `programSectionTemplates` and `programDossiers` plus new rendering helpers so each generated plan exports template checklists alongside well-specific inputs, cost codes, and deliverables. |
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
  | 2 | `index.html` L82-L118 | Nav links rendered twice (diff artifact) create duplicate focus targets. | Delete the repeated `<a>` nodes inside the header nav. |
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
- No Leaflet usage detected; CSP starter remains TODO (present in `index-v23-fresh.html` for future migration).

## Tailwind Build Pipeline

- `npm run build:css` regenerates `assets/css/tailwind.css` through the Tailwind CLI; browserslist warning is informational only.【6a05cb†L1-L5】【a58981†L1-L7】
- `index.html` only references the compiled stylesheet and self-hosted vendor bundles; the Tailwind CDN script and Google Fonts preconnects have been removed.【F:index.html†L10-L18】

## Latest Remediation (Current Pass)

- Published a dedicated Well Operations Planner experience that reuses the hardened CSP, draws a live schematic canvas, and exposes procedure-driven tool depth plus cost rollups without any inline scripting.【F:well-operations-planner.html†L1-L121】【F:assets/js/well-operations-planner.js†L1-L233】
- Launched the Equipment Browser & Job Planner view with category tabs, modal specs/history, and a persistent builder that reuses the catalog dataset while honouring CSP restrictions.【F:equipment-browser.html†L1-L163】【F:assets/js/equipment-browser.js†L1-L329】
- Linked the new planner and catalog destinations from the hero CTA so visitors can move from the case-study landing page into the interactive tooling flows in one click.【F:index.html†L63-L80】
- Added a W666-specific data scrubbing evidence panel that documents LangExtract intake stages, schema controls, and QA sign-off so stakeholders see how raw reports are normalised before planning begins.【F:index.html†L170-L197】【F:assets/js/app.js†L1439-L1502】【F:assets/js/app.js†L2878-L2962】【F:assets/js/app.js†L3532-L3561】
- Plumbed fallback equipment/personnel datasets with CSV parsers and service-template indexes so the planner can hydrate catalog data even when remote fetches fail, wiring the new logistics reference card into the layout.【F:assets/js/app.js†L360-L707】【F:index.html†L240-L263】
- Refined `renderAssetManagementViews` to filter required tooling, show vendor and rate columns, and surface catalog metadata inside the Service Line Reference card tied to the selected objective.【F:assets/js/app.js†L1819-L1977】
- Rebuilt `initializeCommercial` and `renderCommercialView` to derive vendor-aware service tickets from equipment and crew matches, calculate totals with `formatCurrency`, and present status badges in the refreshed table layout.【F:assets/js/app.js†L2115-L2261】
- Expanded `renderPOBView` with daily rate/per diem rollups, four-card summaries, and additional table columns while keeping muster status badges accessible via `toStatusClass`.【F:assets/js/app.js†L1998-L2104】
- Hardened `loadReferenceData()` to flag offline mode, reuse fallback data, and refresh dependent views when fetches are blocked by the browser's file protocol.【F:assets/js/app.js†L2831-L2892】

## Performance Opportunities (Top 5)

| #   | Location                                                             | Recommendation                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `index.html` L14-L18; `assets/js/app.js` L2224-L2278                 | Swap the eager `<script src="assets/vendor/chart.umd.min.js">` for a dynamic import triggered when the ROI calculator enters view (e.g., `IntersectionObserver`) to defer ~70KB of parsing on first paint.【F:index.html†L14-L18】【F:assets/js/app.js†L2224-L2278】 |
| 2   | `assets/js/app.js` L2258-L2278                                       | Memoise `initSavingsChart()` so it only runs after `calculateROI()` has data; today Chart.js initialises immediately even if users never touch the sliders.【F:assets/js/app.js†L2258-L2278】                                                                        |
| 3   | `styles/tailwind.css` L60-L88                                        | Convert `assets/watermark.jpg` to a compressed WebP/AVIF alternative (or gate it behind media queries) to avoid tiling a 360KB JPEG background on every page load.【F:styles/tailwind.css†L60-L88】                                                                  |
| 4   | `assets/js/app.js` L276-L314                                         | Large emoji icons are rendered from literal UTF-8; replace with SVG sprites or utility classes to reduce layout thrash on older Android browsers and keep fonts consistent.【F:assets/js/app.js†L276-L314】                                                          |
| 5   | `assets/vendor/jspdf.umd.min.js`, `assets/vendor/html2canvas.min.js` | Lazy-load PDF export dependencies on demand (e.g., `import('assets/vendor/jspdf.umd.min.js')`) so the landing page avoids parsing 600KB of libraries unless the analyzer view is active.【F:index.html†L16-L18】【F:assets/js/app.js†L2733-L2922】                   |

## Accessibility & SEO (Top 10 Fixes)

| #   | File:Line                      | Issue                                                                                                             | Suggested Diff                                                                                                                             |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `assets/js/app.js` L2324-L2363 | The primary tablist now roves focus with `tabindex`, but lacks arrow-key support to move between tabs.            | Add a `keydown` handler on `.nav-link` that intercepts ArrowLeft/ArrowRight to focus the previous/next tab and activate it on Enter/Space. |
| 2   | `index.html` L142-L149         | The step indicator is purely decorative; screen readers receive no progress context.                              | Treat the stepper as `<ol role="list">` with `aria-current="step"` on the active item and add visually hidden labels describing each step. |
| 3   | `index.html` L170-L215         | Objective/problem selectors are divs without `<fieldset>`/`<legend>`, so grouped radio semantics remain unclear.  | Wrap each question block in `<fieldset>` with a `<legend>` summarising the prompt.                                                         |
| 4   | `assets/js/app.js` L2370-L2404 | AI recommendation cards are clickable divs without keyboard support.                                              | Render them as `<button>` elements or apply `role="button" tabindex="0"` plus key handlers for Enter/Space.                                |
| 5   | `index.html` L216-L228         | Logistics tables lack `<caption>`s and the search inputs depend on placeholder text alone.                        | Provide `<label for>` pairs and short captions describing each table.                                                                      |
| 6   | `assets/js/app.js` L1660-L1706 | Logistics conflict summaries still inject HTML via template strings; potential XSS if data becomes user-supplied. | Build table rows with `document.createElement` and `textContent`.                                                                          |
| 7   | `assets/js/app.js` L2289-L2313 | Planner objective cards toggle visually but remain divs; `role="radio"` semantics are missing.                    | Update renderers to output `<label>`/`<input type="radio">` pairs inside fieldsets for consistent semantics.                               |
| 8   | `index.html` L226-L233         | Whitepaper CTA opens a new tab without warning assistive tech users.                                              | Append `aria-describedby` or sr-only copy indicating the Google Docs link opens in a new window.                                           |
| 9   | `index.html` L123-L129         | ROI totals update visually but `#totalSavings` is not marked live.                                                | Add `role="status" aria-live="polite"` to the total or announce changes in JS.                                                             |
| 10  | `assets/js/app.js` L2856-L2920 | PDF status text updates silently; errors are easy to miss.                                                        | Give the status container `role="alert"` or focus it after updates (`tabindex="-1"`).                                                      |

## Security Hygiene


## Tailwind Build Pipeline

- `npm run build:css` regenerates `assets/css/tailwind.css` through the Tailwind CLI; browserslist warning is informational only.【6a05cb†L1-L5】【a58981†L1-L7】
- `index.html` only references the compiled stylesheet and self-hosted vendor bundles; the Tailwind CDN script and Google Fonts preconnects have been removed.【F:index.html†L10-L18】

## Latest Remediation (Current Pass)

- Published a dedicated Well Operations Planner experience that reuses the hardened CSP, draws a live schematic canvas, and exposes procedure-driven tool depth plus cost rollups without any inline scripting.【F:well-operations-planner.html†L1-L121】【F:assets/js/well-operations-planner.js†L1-L233】
- Launched the Equipment Browser & Job Planner view with category tabs, modal specs/history, and a persistent builder that reuses the catalog dataset while honouring CSP restrictions.【F:equipment-browser.html†L1-L163】【F:assets/js/equipment-browser.js†L1-L329】
- Linked the new planner and catalog destinations from the hero CTA so visitors can move from the case-study landing page into the interactive tooling flows in one click.【F:index.html†L63-L80】
- Added a W666-specific data scrubbing evidence panel that documents LangExtract intake stages, schema controls, and QA sign-off so stakeholders see how raw reports are normalised before planning begins.【F:index.html†L170-L197】【F:assets/js/app.js†L1439-L1502】【F:assets/js/app.js†L2878-L2962】【F:assets/js/app.js†L3532-L3561】
- Plumbed fallback equipment/personnel datasets with CSV parsers and service-template indexes so the planner can hydrate catalog data even when remote fetches fail, wiring the new logistics reference card into the layout.【F:assets/js/app.js†L360-L707】【F:index.html†L240-L263】
- Refined `renderAssetManagementViews` to filter required tooling, show vendor and rate columns, and surface catalog metadata inside the Service Line Reference card tied to the selected objective.【F:assets/js/app.js†L1819-L1977】
- Eliminated duplicate `const` declarations inside `renderAssetManagementViews` by renaming local filter variables so the logistics view no longer throws `Identifier 'filteredPersonnel' has already been declared` in Chromium devtools.【F:assets/js/app.js†L2339-L2440】
- Rebuilt `initializeCommercial` and `renderCommercialView` to derive vendor-aware service tickets from equipment and crew matches, calculate totals with `formatCurrency`, and present status badges in the refreshed table layout.【F:assets/js/app.js†L2115-L2261】
- Expanded `renderPOBView` with daily rate/per diem rollups, four-card summaries, and additional table columns while keeping muster status badges accessible via `toStatusClass`.【F:assets/js/app.js†L1998-L2104】
- Hardened `loadReferenceData()` to flag offline mode, reuse fallback data, and refresh dependent views when fetches are blocked by the browser's file protocol.【F:assets/js/app.js†L2831-L2892】

## Performance Opportunities (Top 5)

| #   | Location                                                             | Recommendation                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `index.html` L14-L18; `assets/js/app.js` L2224-L2278                 | Swap the eager `<script src="assets/vendor/chart.umd.min.js">` for a dynamic import triggered when the ROI calculator enters view (e.g., `IntersectionObserver`) to defer ~70KB of parsing on first paint.【F:index.html†L14-L18】【F:assets/js/app.js†L2224-L2278】 |
| 2   | `assets/js/app.js` L2258-L2278                                       | Memoise `initSavingsChart()` so it only runs after `calculateROI()` has data; today Chart.js initialises immediately even if users never touch the sliders.【F:assets/js/app.js†L2258-L2278】                                                                        |
| 3   | `styles/tailwind.css` L60-L88                                        | Convert `assets/watermark.jpg` to a compressed WebP/AVIF alternative (or gate it behind media queries) to avoid tiling a 360KB JPEG background on every page load.【F:styles/tailwind.css†L60-L88】                                                                  |
| 4   | `assets/js/app.js` L276-L314                                         | Large emoji icons are rendered from literal UTF-8; replace with SVG sprites or utility classes to reduce layout thrash on older Android browsers and keep fonts consistent.【F:assets/js/app.js†L276-L314】                                                          |
| 5   | `assets/vendor/jspdf.umd.min.js`, `assets/vendor/html2canvas.min.js` | Lazy-load PDF export dependencies on demand (e.g., `import('assets/vendor/jspdf.umd.min.js')`) so the landing page avoids parsing 600KB of libraries unless the analyzer view is active.【F:index.html†L16-L18】【F:assets/js/app.js†L2733-L2922】                   |

## Accessibility & SEO (Top 10 Fixes)

| #   | File:Line                      | Issue                                                                                                             | Suggested Diff                                                                                                                             |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `assets/js/app.js` L2324-L2363 | The primary tablist now roves focus with `tabindex`, but lacks arrow-key support to move between tabs.            | Add a `keydown` handler on `.nav-link` that intercepts ArrowLeft/ArrowRight to focus the previous/next tab and activate it on Enter/Space. |
| 2   | `index.html` L142-L149         | The step indicator is purely decorative; screen readers receive no progress context.                              | Treat the stepper as `<ol role="list">` with `aria-current="step"` on the active item and add visually hidden labels describing each step. |
| 3   | `index.html` L170-L215         | Objective/problem selectors are divs without `<fieldset>`/`<legend>`, so grouped radio semantics remain unclear.  | Wrap each question block in `<fieldset>` with a `<legend>` summarising the prompt.                                                         |
| 4   | `assets/js/app.js` L2370-L2404 | AI recommendation cards are clickable divs without keyboard support.                                              | Render them as `<button>` elements or apply `role="button" tabindex="0"` plus key handlers for Enter/Space.                                |
| 5   | `index.html` L216-L228         | Logistics tables lack `<caption>`s and the search inputs depend on placeholder text alone.                        | Provide `<label for>` pairs and short captions describing each table.                                                                      |
| 6   | `assets/js/app.js` L1660-L1706 | Logistics conflict summaries still inject HTML via template strings; potential XSS if data becomes user-supplied. | Build table rows with `document.createElement` and `textContent`.                                                                          |
| 7   | `assets/js/app.js` L2289-L2313 | Planner objective cards toggle visually but remain divs; `role="radio"` semantics are missing.                    | Update renderers to output `<label>`/`<input type="radio">` pairs inside fieldsets for consistent semantics.                               |
| 8   | `index.html` L226-L233         | Whitepaper CTA opens a new tab without warning assistive tech users.                                              | Append `aria-describedby` or sr-only copy indicating the Google Docs link opens in a new window.                                           |
| 9   | `index.html` L123-L129         | ROI totals update visually but `#totalSavings` is not marked live.                                                | Add `role="status" aria-live="polite"` to the total or announce changes in JS.                                                             |
| 10  | `assets/js/app.js` L2856-L2920 | PDF status text updates silently; errors are easy to miss.                                                        | Give the status container `role="alert"` or focus it after updates (`tabindex="-1"`).                                                      |

## Security Hygiene

- Plumbed fallback equipment/personnel datasets with CSV parsers and service-template indexes so the planner can hydrate catalog data even when remote fetches fail, wiring the new logistics reference card into the layout.【F:assets/js/app.js†L360-L707】【F:index.html†L240-L263】
- Refined `renderAssetManagementViews` to filter required tooling, show vendor and rate columns, and surface catalog metadata inside the Service Line Reference card tied to the selected objective.【F:assets/js/app.js†L1819-L1977】
- Rebuilt `initializeCommercial` and `renderCommercialView` to derive vendor-aware service tickets from equipment and crew matches, calculate totals with `formatCurrency`, and present status badges in the refreshed table layout.【F:assets/js/app.js†L2115-L2261】
- Expanded `renderPOBView` with daily rate/per diem rollups, four-card summaries, and additional table columns while keeping muster status badges accessible via `toStatusClass`.【F:assets/js/app.js†L1998-L2104】
- Hardened `loadReferenceData()` to flag offline mode, reuse fallback data, and refresh dependent views when fetches are blocked by the browser's file protocol.【F:assets/js/app.js†L2831-L2892】

## Performance Opportunities (Top 5)

| #   | Location                                                             | Recommendation                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `index.html` L14-L18; `assets/js/app.js` L2224-L2278                 | Swap the eager `<script src="assets/vendor/chart.umd.min.js">` for a dynamic import triggered when the ROI calculator enters view (e.g., `IntersectionObserver`) to defer ~70KB of parsing on first paint.【F:index.html†L14-L18】【F:assets/js/app.js†L2224-L2278】 |
| 2   | `assets/js/app.js` L2258-L2278                                       | Memoise `initSavingsChart()` so it only runs after `calculateROI()` has data; today Chart.js initialises immediately even if users never touch the sliders.【F:assets/js/app.js†L2258-L2278】                                                                        |
| 3   | `styles/tailwind.css` L60-L88                                        | Convert `assets/watermark.jpg` to a compressed WebP/AVIF alternative (or gate it behind media queries) to avoid tiling a 360KB JPEG background on every page load.【F:styles/tailwind.css†L60-L88】                                                                  |
| 4   | `assets/js/app.js` L276-L314                                         | Large emoji icons are rendered from literal UTF-8; replace with SVG sprites or utility classes to reduce layout thrash on older Android browsers and keep fonts consistent.【F:assets/js/app.js†L276-L314】                                                          |
| 5   | `assets/vendor/jspdf.umd.min.js`, `assets/vendor/html2canvas.min.js` | Lazy-load PDF export dependencies on demand (e.g., `import('assets/vendor/jspdf.umd.min.js')`) so the landing page avoids parsing 600KB of libraries unless the analyzer view is active.【F:index.html†L16-L18】【F:assets/js/app.js†L2733-L2922】                   |

## Accessibility & SEO (Top 10 Fixes)

| #   | File:Line                      | Issue                                                                                                             | Suggested Diff                                                                                                                             |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `assets/js/app.js` L2324-L2363 | The primary tablist now roves focus with `tabindex`, but lacks arrow-key support to move between tabs.            | Add a `keydown` handler on `.nav-link` that intercepts ArrowLeft/ArrowRight to focus the previous/next tab and activate it on Enter/Space. |
| 2   | `index.html` L142-L149         | The step indicator is purely decorative; screen readers receive no progress context.                              | Treat the stepper as `<ol role="list">` with `aria-current="step"` on the active item and add visually hidden labels describing each step. |
| 3   | `index.html` L170-L215         | Objective/problem selectors are divs without `<fieldset>`/`<legend>`, so grouped radio semantics remain unclear.  | Wrap each question block in `<fieldset>` with a `<legend>` summarising the prompt.                                                         |
| 4   | `assets/js/app.js` L2370-L2404 | AI recommendation cards are clickable divs without keyboard support.                                              | Render them as `<button>` elements or apply `role="button" tabindex="0"` plus key handlers for Enter/Space.                                |
| 5   | `index.html` L216-L228         | Logistics tables lack `<caption>`s and the search inputs depend on placeholder text alone.                        | Provide `<label for>` pairs and short captions describing each table.                                                                      |
| 6   | `assets/js/app.js` L1660-L1706 | Logistics conflict summaries still inject HTML via template strings; potential XSS if data becomes user-supplied. | Build table rows with `document.createElement` and `textContent`.                                                                          |
| 7   | `assets/js/app.js` L2289-L2313 | Planner objective cards toggle visually but remain divs; `role="radio"` semantics are missing.                    | Update renderers to output `<label>`/`<input type="radio">` pairs inside fieldsets for consistent semantics.                               |
| 8   | `index.html` L226-L233         | Whitepaper CTA opens a new tab without warning assistive tech users.                                              | Append `aria-describedby` or sr-only copy indicating the Google Docs link opens in a new window.                                           |
| 9   | `index.html` L123-L129         | ROI totals update visually but `#totalSavings` is not marked live.                                                | Add `role="status" aria-live="polite"` to the total or announce changes in JS.                                                             |
| 10  | `assets/js/app.js` L2856-L2920 | PDF status text updates silently; errors are easy to miss.                                                        | Give the status container `role="alert"` or focus it after updates (`tabindex="-1"`).                                                      |

## Security Hygiene

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
