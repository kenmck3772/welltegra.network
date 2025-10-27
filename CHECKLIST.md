# Audit Checklist — WellTegra Static Site

## Runtime Smoke Checks

| Check | Command | Result |
| ----- | ------- | ------ |
| Syntax validation | `node --check assets/js/app.js` | Ensures the guarded listeners compile without errors. |
| Tailwind build | `npm run build:css` | Rebuilds `assets/css/tailwind.css` to confirm the CLI pipeline still works. |
| JSON integrity | `python -m json.tool equipment-catalog.json` | No parse errors. |
| JSON integrity | `python -m json.tool service-line-templates.json` | No parse errors. |

## Planner Console Regression

- **Issue:** Loading `index.html` without the planner markup present triggered `TypeError: Cannot read properties of null (reading 'addEventListener')` because `assets/js/app.js` assumed elements such as `#generate-plan-btn-manual` and `#start-over-btn` always exist.
- **Fix:** Added an `addListener` utility and null guards before toggling `.disabled` or `.classList` so marketing-only pages no longer throw when the planner DOM is absent.【F:assets/js/app.js†L1403-L1431】【F:assets/js/app.js†L1540-L1560】【F:assets/js/app.js†L3843-L3873】【F:assets/js/app.js†L4158-L4227】
- **Verification:** Refreshing the landing page after the guard rails eliminates the console error while leaving the full planner workflow intact.

## Data Checks

- `equipment-catalog.json` and `service-line-templates.json` continue to parse via `python -m json.tool`, confirming catalog references remain valid.
- No additional `clans.json` / `map-data.json` files are present in this repository, so no cross-references are required.

## Build & Security Notes

- Tailwind remains compiled locally (`assets/css/tailwind.css`) via the CLI script.
- External libraries (Chart.js, jsPDF, html2canvas) stay CDN-loaded; follow-up work can migrate them on-site alongside the CSP if desired.
- Continue to launch the local preview with `python -m http.server 8000` when validating future UI updates.
