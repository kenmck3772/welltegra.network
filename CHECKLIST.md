# Audit Checklist — WellTegra Static Site

## Console Output

Summary of console captures this pass:

| Page | Status | Notes |
| --- | --- | --- |
| `index.html` (`http://127.0.0.1:8000/index.html`) | ✅ Clean console | Served via `python3 -m http.server 8000`; Playwright headless Chromium capture. Only the informational bootstrap log below printed. |
| Archived demos (`index-v23-fresh.html`, `test-v23-1761097711.html`) | ⏳ Deferred | Not exercised this pass so the homepage regression could finish first. |

```text
log: Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
```

## Data Integrity

| Artifact | Status | Notes |
| --- | --- | --- |
| `equipment-catalog.json` | ✅ Valid JSON | `python -m json.tool equipment-catalog.json` (no syntax errors; pretty-print succeeded). |
| `service-line-templates.json` | ✅ Valid JSON | `python -m json.tool service-line-templates.json` confirmed the structure without warnings. |
| `data-activity-cost-rates.csv` | ✅ Parsed (31 rows) | Row-count script (`python - <<'PY'`) read every record without raising CSV errors. |
| `data-equipment-tools.csv` | ✅ Parsed (38 rows) | Same script counted 38 rows, matching the expected tool catalog footprint. |
| `data-personnel-rates.csv` | ✅ Parsed (36 rows) | CSV reader completed successfully; no malformed rows encountered. |

Command + output for the combined CSV check:

```bash
python - <<'PY'
import csv
from pathlib import Path
for path in [
    Path('data-activity-cost-rates.csv'),
    Path('data-equipment-tools.csv'),
    Path('data-personnel-rates.csv'),
]:
    with path.open(newline='') as handle:
        reader = csv.reader(handle)
        row_count = sum(1 for _ in reader)
    print(f"{path}: {row_count} rows")
PY
```

```text
data-activity-cost-rates.csv: 31 rows
data-equipment-tools.csv: 38 rows
data-personnel-rates.csv: 36 rows
```

## Link Health

| Check | Status | Notes |
| --- | --- | --- |
| `npm run lint:links` | ✅ Clean crawl | 14 URLs, 0 failures against `http://127.0.0.1:8000`. Reminder: start `python3 -m http.server 8000` first to avoid false positives on the site root. |

Command output:

```text
🤖 Successfully scanned 14 links in 0.943 seconds.
```

## Styling Pipeline
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


- [x] `npm run build:css`
  - Tailwind CLI rebuild succeeded; output written to `assets/css/tailwind.css`.

## Performance Snapshot
- [x] Validated JSON syntax via `python -m json.tool`:
  - `equipment-catalog.json`
  - `service-line-templates.json`
- [x] Searched repository for `clans.json` / `map-data.json`; confirmed assets are not present nor referenced in code. Documented gap for future Leaflet integrations.

| Check | Status | Notes |
| --- | --- | --- |
| `npx lighthouse …` | 🚫 Blocked | The container image ships without Chrome/Chromium, so the CLI exited with `The CHROME_PATH environment variable must be set…`. Rerun on a host with a browser binary. |

## Accessibility & SEO Opportunities
- [x] `npm run lint:links`
  - Command executed against local preview (`http://127.0.0.1:8000`).
  - Outcome: 14 URLs crawled with 0 failures.

Top opportunities to monitor:

| # | Action | Status | Notes |
| --- | --- | --- | --- |
| 1 | Remove the duplicated "Review the strategic roadmap source" link in `index.html` (lines 1396–1399). | ✅ Completed | Anchor removed so the Verifiable Trust callout exposes a single focus target. |
| 2 | Confirm hero media fallbacks announce state changes via `aria-live`. | ⏳ Deferred | Needs telemetry scripting follow-up; no regression observed in this pass. |
| 3 | Audit heading hierarchy in the Unified Command Center overlays. | 📋 Backlog | Check `h2`/`h3` ordering during the next overlay iteration. |
| 4 | Add descriptive alt text for non-decorative marketing imagery. | 📋 Backlog | Decorative waveforms already `aria-hidden`; remaining imagery still needs richer alt copy. |
| 5 | Double-check canonical URLs across archived demos. | ✅ Verified | All canonical tags point at `https://welltegra.network`. |
| 6 | Ensure `data-switch-view` CTA buttons preserve focus outlines. | ✅ Verified | Buttons retain default focus ring styling. |
| 7 | Keep CSP directives single-sourced per page. | ✅ Verified | Each HTML document now carries a single authoritative CSP `<meta>`. |
| 8 | Maintain SRI hashes for Chart.js, jsPDF, and html2canvas. | ✅ Verified | Hashes and `crossorigin` attributes audited in `index.html`. |
| 9 | Continue pinning CDN dependencies to exact versions. | ✅ Verified | External scripts specify exact version numbers. |
| 10 | Resume Lighthouse accessibility/SEO audits once Chrome is available. | 🚫 Blocked | Lighthouse CLI requires a Chromium binary; rerun outside the container. |

## Security Hygiene

| Check | Status | Notes |
| --- | --- | --- |
| CSP `<meta>` directives | ✅ Verified | Default/script/style sources scoped to trusted origins; duplicates removed. |
| External script SRI hashes | ✅ Verified | Chart.js, jsPDF, and html2canvas retain `integrity` + `crossorigin`. |
| `target="_blank"` anchors | ✅ Verified | All external tabs include `rel="noopener noreferrer"`. |
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
