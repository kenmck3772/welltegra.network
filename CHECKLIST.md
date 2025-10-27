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

## Data Checks

- `equipment-catalog.json` and `service-line-templates.json` continue to parse via `python -m json.tool`, confirming catalog references remain valid.【d86df0†L1-L3】
- `npm run lint:links` reports no 4xx responses across the locally served marketing pages.【f0211f†L1-L1】

## Build Notes

- Tailwind continues to compile locally via `npm run build:css`; refreshed Browserslist metadata to keep the CLI happy.【d3e7ab†L1-L8】【e7bd70†L1-L7】
- `node --check assets/js/app.js` stays green after the planner guardrails landed.【a0f34e†L1-L1】
