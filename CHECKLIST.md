# Audit Checklist — WellTegra Static Site

## Console Output

- [x] `index.html` — local preview (`http://127.0.0.1:8000/index.html`)
  - Before: no blocking errors; only data bootstrap log captured.

    ```text
    LOG: Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
    ```

  - After CSP cleanup: unchanged (no warnings or errors introduced).

- [x] `index-v23-fresh.html` — archived demo preview
  - Before: hero video blocked by CSP, generating console errors.

    ```text
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ERROR: Refused to load media from 'https://welltegra.network/assets/thumbnail.mp4' because it violates the following Content Security Policy directive: "media-src 'self' data:".
    ```

  - After CSP media allowlist update: clean console (no messages).

## Data Integrity

- [x] Validated JSON structure with `python -m json.tool` for `equipment-catalog.json` and `service-line-templates.json`.
- [x] Confirmed `clans.json` / `map-data.json` are not present in the repository; flagged absence for future integrations.

## Link Health

- [x] `npm run lint:links` (linkinator) → crawled 11 URLs with 0 failures.

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
2. Added `https://welltegra.network` to `media-src` so archived hero video streams without CSP violations (`index-v23-fresh.html`, `test-v23-1761097711.html`, `pricing.html`).
3. Retained strict `default-src 'self'` baseline to limit third-party script execution.
4. Ensured Tailwind is served from the compiled `assets/css/tailwind.css` bundle instead of the CDN runtime.
5. Preserved SRI attributes and version pinning for Chart.js, jsPDF, and html2canvas to lock dependency integrity.
6. Verified all outbound links that open new tabs include `rel="noopener noreferrer"` to block tab-nabbing.
7. Confirmed canonical + OpenGraph metadata reference the production domain for SEO consistency.
8. Documented JSON validation workflow for operational datasets to maintain structured-data accuracy.
9. Maintained local favicon/logo assets to avoid cross-origin fetches blocked by CSP.
10. Recorded Lighthouse recommendations (unused JS/CSS) for backlog grooming.

## Security Hygiene

- [x] CSP updates now share a single, authoritative directive per page with an explicit media allowlist covering production assets.
- [x] Existing SRI hashes and `rel="noopener"` safeguards remain in place.
