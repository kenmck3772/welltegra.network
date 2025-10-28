# Audit Checklist — WellTegra Static Site

## Runtime Smoke Checks

| Check | Command | Result |
| ----- | ------- | ------ |
| Syntax validation | `node --check assets/js/app.js` | Ensures guarded listeners compile without errors and the logistics view lookup stays defined. |
| Tailwind build | `npm run build:css` | Rebuilds `assets/css/tailwind.css` to confirm the CLI pipeline still works. |
| JSON integrity | `python -m json.tool equipment-catalog.json` | No parse errors. |
| JSON integrity | `python -m json.tool service-line-templates.json` | No parse errors. |
| Link health | `npm run lint:links` | Crawls the local preview for broken anchors and assets. |
| Console capture | Playwright sweep across `index.html`, `well-operations-planner.html`, and `sustainability-calculator.html` | Confirmed a clean Chromium console after fixing the missing DOM handles.【25f36a†L1-L16】 |

## Console & Network Regression Notes

- **Before:** Loading the homepage under Chromium surfaced a cascade of `ReferenceError` exceptions (`step1ContinueBtn`, `openLogisticsBtn`, `reviewAnalysisBtnFinal`, and `initializeHeroVideoToggle`) because the planner listeners executed before their DOM handles existed on the marketing shell.【9ba832†L1-L1】【3abfd1†L1-L1】【c4b8ff†L1-L1】【2e8671†L1-L1】
- **Fix:** Declared the missing handles inside the guarded DOM snapshot and added a no-op hero video initializer so the planner script can safely boot on any page.【F:assets/js/app.js†L1405-L1420】【F:assets/js/app.js†L4369-L4393】
- **After:** The Playwright sweep across the marketing and planner entry points now completes with no console output.【25f36a†L1-L16】
- Added a navigation gating helper that announces why plan-dependent views remain locked and routes users back to the planner until a plan exists, so CTAs no longer appear unresponsive.【F:assets/js/app.js†L1620-L1671】【F:assets/js/app.js†L4386-L4404】

## Data Checks

- `equipment-catalog.json` and `service-line-templates.json` continue to parse via `python -m json.tool`, confirming catalog references remain valid.【d86df0†L1-L3】
- `npm run lint:links` reports no 4xx responses across the locally served marketing pages.【f0211f†L1-L1】
- Data Export Hub now surfaces live record counts, schema previews, approximate file sizes, SHA-256 fingerprints, 3-row preview tables, inline data dictionary callouts, and copy-to-clipboard pandas/<code>curl</code>/SQL/fingerprint helpers so analytics teams can validate and ingest exports without manual prep.【F:assets/js/app.js†L1385-L1548】【F:assets/js/app.js†L3827-L4013】【F:index.html†L459-L612】
- Clipboard helpers expose accessible status updates through dedicated live regions and message resets so repeated copy attempts speak their success or failure across the marketing shells.【F:assets/js/app.js†L4205-L4231】【F:index.html†L500-L597】【F:index-v23-fresh.html†L933-L1030】【F:test-v23-1761097711.html†L933-L1030】
- Activity, equipment, and personnel datasets join the W666 and portfolio exports so downstream budgeting, logistics, and staffing models can consume the same CSVs the planner references.【F:index.html†L524-L597】【F:index-v23-fresh.html†L957-L1030】【F:test-v23-1761097711.html†L957-L1030】【F:README.md†L26-L35】
- AI research export card curates external models, datasets, and playbooks with schema previews, copy helpers, and fingerprinting so product teams can evaluate accelerators without leaving the marketing shell.【F:data-ai-research-resources.csv†L1-L5】【F:index.html†L597-L688】【F:index-v23-fresh.html†L1018-L1109】【F:test-v23-1761097711.html†L1018-L1109】【F:assets/js/app.js†L1528-L1596】

## Build Notes

- Tailwind continues to compile locally via `npm run build:css`; refreshed Browserslist metadata to keep the CLI happy.【d3e7ab†L1-L8】【e7bd70†L1-L7】
- `node --check assets/js/app.js` stays green after the planner guardrails landed.【a0f34e†L1-L1】
