# Audit Checklist — WellTegra Static Site

## Console Output

- [x] `index.html` — local preview (`http://127.0.0.1:8000/index.html`)

  - Before: no blocking errors; only data bootstrap log captured.

    ```text
    LOG: Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
    ```

  - After CSP cleanup: unchanged (no warnings or errors introduced).
  - Current iteration: triggered the "Read the Executive White Paper Summary" and "Launch the Planner Demo" CTAs (new `data-switch-view` handlers) — console stayed silent while the controller routed to `whitepaper`/`planner` views.
  - Current iteration: expanded each Unified Command Center story via the `[data-story-trigger]` overlays (Logistics, Performer, Commercial/ESG, HSE Sentinel, and POB & Emergency), cycled between them with the nav buttons/Arrow keys, closed them with the backdrop and ESC key, and confirmed the console remained clean while focus returned to the initiating CTA.
  - Current iteration: exercised the story progress map buttons inside the overlay to jump directly across all five narratives; verified `aria-current`/`aria-pressed` toggled, disabled states applied to the active pill, and no warnings surfaced.
  - Current iteration: checked the new KPI highlight cards inside every overlay (Logistics through POB) and confirmed the `dl` structures rendered without console chatter while the sr-only status region announced the active story summary as panels changed.
  - Current iteration: validated the hero autoplay/fallback script by forcing the network panel to block `assets/hero.mp4`; the fallback banner appeared, no autoplay warnings surfaced, the banner dismissed itself once playback resumed, and the console stayed empty throughout.
  - Current iteration: walked through the Toolstring Configurator (preset switch, filter, add/remove/move controls) then regenerated the plan and launched Performer—chips, summary totals, and the fade-in animation updated without logging errors.
  - Current iteration: switched from W666 to W601 mid-session to verify Step 2 now surfaces the configurator immediately with the selected well called out, placeholder presets disabled until an objective is chosen, and the view auto-scrolls without console noise.
  - Current iteration: watched the Performer telemetry tick at the new 400&nbsp;ms cadence—depth, hookload, and pressure now glide instead of jumping in one-second increments and the console remains clear while the alarm thresholds fire.
  - Current iteration: expanded each Unified Command Center story via the new `[data-story-trigger]` overlays, cycled between them with the nav buttons/Arrow keys, closed them with the backdrop and ESC key, and confirmed the console remained clean while focus returned to the initiating CTA.

- [x] `index-v23-fresh.html` — archived demo preview

  - Before: hero video blocked by CSP and attempted to stream a missing `thumbnail.mp4`/`thumbnail.png` asset from production, triggering CSP rejections followed by 404s.

    ```text
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ```

  - After CSP media allowlist update and swapping in local `assets/hero4.mp4` + `assets/logo.jpg`: clean console (no messages).
  - Before: no blocking errors; only data bootstrap log captured.

    ```text
    LOG: Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
    ```

  - After CSP cleanup: unchanged (no warnings or errors introduced).

- [x] `index-v23-fresh.html` — archived demo preview
  - Before: hero video blocked by CSP and attempted to stream a missing `thumbnail.mp4`/`thumbnail.png` asset from production, triggering CSP rejections followed by 404s.
  - Before: hero video blocked by CSP, generating console errors.

    ```text
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ```

  - After CSP media allowlist update and swapping in local `assets/hero4.mp4` + `assets/logo.jpg`: clean console (no messages).
  - After CSP media allowlist update: clean console (no messages).

## Data Integrity

- [x] Validated JSON structure with `python -m json.tool` for `equipment-catalog.json` and `service-line-templates.json`.
- [x] Confirmed no legacy map-data JSON files are referenced or required by the current build.
- [x] Confirmed `clans.json` / `map-data.json` are not present in the repository; flagged absence for future integrations.

## Link Health

- [x] `npm run lint:links` (linkinator) → crawled 11 URLs with 0 failures.
- [x] Replaced archived hero video/poster URLs that pointed to missing `https://welltegra.network/assets/thumbnail.{mp4,png}` with local `assets/hero4.mp4` + `assets/logo.jpg` to eliminate remote 404s.
- [x] Updated archived demo watermark backgrounds to read from the bundled `assets/watermark.jpg` instead of the missing production `watermark.png` asset.
- [x] Synced `assets/README.md` with the committed media inventory (`watermark.jpg`, `logo.jpg`, `hero4.mp4`) and documented the relative-path usage so future uploads stay aligned with the HTML references.

## Styling Pipeline

- [x] Tailwind CLI build verified via `npm run build:css` (outputs `assets/css/tailwind.css`).

## Lighthouse Snapshot

- [x] `npx lighthouse http://127.0.0.1:8000/index.html --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance --preset=desktop`
  - Performance score: 0.99
  - Core metrics: FCP 0.7 s, LCP 0.7 s, Speed Index 0.7 s, TBT 0 ms, CLS 0.002
  - Top 5 quick wins:
    1. Reduce unused JavaScript (est. savings 149 KiB / 120 ms)
    2. Minify JavaScript bundles (est. savings 59 KiB)
    3. Trim unused CSS rules (est. savings 56 KiB)
    4. Minify CSS output (est. savings 12 KiB)
    5. Maintain low server response time (TTFB 0 ms observed)

## Accessibility & SEO — Top 10 Actionable Fixes

1. Consolidated duplicate CSP `<meta>` tags to prevent conflicting directives (`index*.html`).
2. Added `https://welltegra.network` to `media-src` and swapped archived hero video/poster URLs to local assets so demos stream without CSP violations or 404s (`index-v23-fresh.html`, `test-v23-1761097711.html`, `pricing.html`).
2. Added `https://welltegra.network` to `media-src` so archived hero video streams without CSP violations (`index-v23-fresh.html`, `test-v23-1761097711.html`, `pricing.html`).
3. Retained strict `default-src 'self'` baseline to limit third-party script execution.
4. Ensured Tailwind is served from the compiled `assets/css/tailwind.css` bundle instead of the CDN runtime.
5. Preserved SRI attributes and version pinning for Chart.js, jsPDF, and html2canvas to lock dependency integrity.
6. Verified all outbound links that open new tabs include `rel="noopener noreferrer"` to block tab-nabbing.
7. Confirmed canonical + OpenGraph metadata reference the production domain for SEO consistency.
8. Extended the accessible story overlays with `[data-story-trigger]` controls, cyclic nav buttons, Arrow-key support, focus management, KPI `dl` highlight cards, and a live region that announces the active story summary so assistive tech users can follow the Logistics, Performer, Commercial/ESG, HSE Sentinel, and POB & Emergency narratives (`index.html`).
9. Added a Toolstring Configurator in Step 2 with labelled preset dropdown, search input, add/remove/move buttons, and a live summary/metric card so keyboard and screen reader users can assemble the run without losing context (`index.html`).
10. Refreshed the hero section with a responsive metrics deck plus an autoplay helper that degrades to a fallback banner when media fails, keeping the hero copy accessible and preventing blank space (`index.html`).
8. Added accessible story overlays powered by `[data-story-trigger]` controls, cyclic nav buttons, Arrow-key support, focus management, and documented fallbacks so assistive tech users can follow the Logistics/Performer/ESG narratives (`index.html`).
9. Embedded a 30-second Performer walkthrough video with caption plus a decorative roadmap SVG timeline to reinforce the white paper milestones without duplicating screen reader content (`index.html`).
8. Added accessible `<details>` narratives and keyboard-friendly `data-switch-view` buttons so the new Command Center and White Paper sections work for screen readers without extra scripts (`index.html`).
9. Mapped the strategic roadmap timeline to the executive CTA so leadership sees the white paper milestones in-line with the homepage journey (`index.html`).
8. Documented JSON validation workflow for operational datasets to maintain structured-data accuracy.
9. Maintained local favicon/logo assets to avoid cross-origin fetches blocked by CSP.
10. Recorded Lighthouse recommendations (unused JS/CSS) for backlog grooming.

## Security Hygiene

- [x] CSP updates now share a single, authoritative directive per page with an explicit media allowlist covering production assets.
- [x] Existing SRI hashes and `rel="noopener"` safeguards remain in place.
