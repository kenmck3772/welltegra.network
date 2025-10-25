# Audit Checklist — WellTegra Static Site

## Console Output
| Stage | Command | Result |
| --- | --- | --- |
| Before Tailwind CLI build (with CDN script) | `python3 -m http.server 8080` + Playwright console capture | `WARNING: cdn.tailwindcss.com should not be used in production…` |
| After CLI build (current commit) | `python3 -m http.server 8080` + Playwright console capture | `NO_CONSOLE_MESSAGES` |

```bash
python3 -m http.server 8080
# Playwright capture executed via browser_container (see run_playwright_script usage in logs)
```

```text
Before: WARNING: cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI…
After: NO_CONSOLE_MESSAGES
```

## Data Integrity
- `find . -maxdepth 3 -name 'clans.json'` → no results (`clans.json` not shipped in this repo).
- `find . -maxdepth 3 -name 'map-data.json'` → no results (map integration not present, so no cross-reference possible).
- `python -m json.tool equipment-catalog.json` (no errors; validates schema content).
- `python -m json.tool service-line-templates.json` (no errors).

## Link Health
- `npm run lint:links` (with `python3 -m http.server 8000` running): 14 URLs crawled, 0 failures.

```text
🤖 Successfully scanned 14 links in 0.665 seconds.
```

## Tailwind Build Pipeline
- Removed the CDN bootstrap `<script src="https://cdn.tailwindcss.com">` from `index.html`.
- `npm run build:css` regenerates `assets/css/tailwind.css` via Tailwind CLI + PostCSS (output minified; see git diff for new hash section).
- Captured Browserslist advisory (`caniuse-lite is outdated`) — informational only.

## Performance Opportunities (Top 5)
| # | Location | Recommendation |
| --- | --- | --- |
| 1 | `index.html` L134-L141 | Add `preload="metadata"` (or switch to an optimized poster) for the autoplay hero video to avoid pulling the full MP4 on first paint. |
| 2 | `index.html` L65-L72 | Convert the repeated remote watermark background to a locally optimized WebP (current PNG served from production host). |
| 3 | `index.html` L211-L238 | Consolidate duplicated KPI cards (remnants of diff markers) to cut DOM weight and reduce layout cost. |
| 4 | `index.html` L351-L420 | Defer loading of heavy dashboard charts (`Chart.js`) until the ROI calculator view is visible. |
| 5 | `index.html` L1657-L1738 | Lazy load embedded demo videos and gate them behind user interaction to reduce Total Blocking Time. |

## Accessibility & SEO (Top 10 Fixes)
| # | File:Line | Issue | Suggested Diff |
| --- | --- | --- | --- |
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
- No Leaflet usage detected; CSP starter remains TODO (present in `index-v23-fresh.html` for future migration).

