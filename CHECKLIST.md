# Audit Checklist — WellTegra Static Site

## Console Output

- [x] `index.html` — local preview (`http://127.0.0.1:8000/index.html`)

  - Server: `python3 -m http.server 8000`
  - Capture: Playwright headless Chromium
  - Result: no warnings or errors. Single informational bootstrap log only.

    ```text
    log: Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
    ```

- [ ] Additional pages (archived demos) — not exercised this pass; prioritize homepage regression first.

## Data Integrity

- [x] Validated JSON syntax via `python -m json.tool`:
  - `equipment-catalog.json`
  - `service-line-templates.json`

## Link Health

- [x] `npm run lint:links`

  - Command executed against local preview (`http://127.0.0.1:8000`).
  - Outcome: 14 URLs crawled with 0 failures.
  - Reminder: Start `python3 -m http.server 8000` first; otherwise Linkinator flags the root link as unreachable.
  - Output:

    ```text
    🤖 Successfully scanned 14 links in 0.943 seconds.
    ```


## Data Integrity

- [x] Validated JSON syntax via `python -m json.tool`:
  - `equipment-catalog.json`
  - `service-line-templates.json`
- [x] Searched repository for `clans.json` / `map-data.json`; confirmed assets are not present nor referenced in code. Documented gap for future Leaflet integrations.

## Link Health

- [x] `npm run lint:links`
  - Command executed against local preview (`http://127.0.0.1:8000`).
  - Outcome: 14 URLs crawled with 0 failures.

## Styling Pipeline

- [x] `npm run build:css`
  - Tailwind CLI rebuild succeeded; output written to `assets/css/tailwind.css`.

## Performance Snapshot

- [ ] `npx lighthouse …`
  - Attempted desktop performance run, but the container image does not ship with Chrome/Chromium. Lighthouse CLI exited with `The CHROME_PATH environment variable must be set…`. Capture noted for follow-up once a browser binary is available.

## Accessibility & SEO Opportunities

1. Remove the duplicated "Review the strategic roadmap source" link in `index.html` (lines 1396–1399) to avoid redundant focus targets. **Status:** Fixed in this PR.
2. Confirm hero media fallbacks announce state changes via `aria-live` once telemetry scripting stabilizes. **Status:** Deferred — no regression observed this pass.
3. Audit heading hierarchy in the Unified Command Center overlays to ensure consistent `h2`/`h3` ordering. **Status:** Backlog.
4. Add descriptive alt text for marketing imagery beyond decorative waveforms (no change required this pass).
5. Double-check canonical URLs across archived demos match production domain. **Status:** Verified.
6. Ensure CTA buttons that toggle views (`data-switch-view`) remain discoverable via keyboard focus outlines. **Status:** Verified.
7. Keep CSP single-sourced per page; currently satisfied.
8. Maintain SRI hashes for all third-party scripts (Chart.js, jsPDF, html2canvas) — confirmed intact.
9. Continue pinning CDN dependencies to exact versions. **Status:** Verified.
10. Track Lighthouse accessibility/SEO audits once Chrome binary access is restored. **Status:** Blocked pending tooling.

## Security Hygiene

- [x] CSP meta tag restricts default/script/style sources to vetted origins; verified no duplicate directives remain in `index.html`.
- [x] External scripts retain SRI hashes and `crossorigin` attributes.
- [x] All `target="_blank"` anchors include `rel="noopener noreferrer"`.
