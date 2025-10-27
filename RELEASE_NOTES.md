# Release Notes — Planner Console Guardrails

## Summary

- Introduced a dedicated **Data Export Hub** view across the marketing shells with direct download CTAs that now cover the W666, portfolio, activity cost, equipment rate, and personnel rate CSVs plus contextual usage guidance.【F:index.html†L459-L600】【F:index-v23-fresh.html†L892-L1033】【F:test-v23-1761097711.html†L892-L1033】
- Hydrated the new view with live record counts, schema previews, inline preview tables, and file size estimates by streaming the CSV headers/rows at load time so analysts can verify dataset shape without leaving the site.【F:assets/js/app.js†L1385-L1573】【F:assets/js/app.js†L3827-L3988】
- Added one-click pandas, <code>curl</code>, and SQL schema copy helpers inside the hub and captured the enhancement in the documentation so downstream teams can bootstrap analytics notebooks, CLI scripts, or warehouse tables faster.【F:index.html†L475-L597】【F:index-v23-fresh.html†L908-L1030】【F:test-v23-1761097711.html†L908-L1030】【F:assets/js/app.js†L3870-L3990】【F:README.md†L26-L35】
- Surfaced inline data dictionary callouts with SQL type badges so analysts understand field intent before downloading, while keeping graceful fallbacks when schema metadata is unavailable.【F:index.html†L484-L590】【F:index-v23-fresh.html†L917-L1023】【F:test-v23-1761097711.html†L917-L1023】【F:assets/js/app.js†L1385-L1548】【F:assets/js/app.js†L3910-L3953】
- Added a planner gating helper that announces plan requirements and routes CTAs back to the workflow so Live Ops, Logistics, Commercial, HSE, and Analysis buttons provide feedback instead of silently failing pre-plan.【F:assets/js/app.js†L1620-L1671】【F:assets/js/app.js†L4386-L4404】

## Verification

1. `node --check assets/js/app.js`
2. `npm run build:css`
3. `python -m json.tool equipment-catalog.json`
4. `python -m json.tool service-line-templates.json`
5. `npm run lint:links`
6. Playwright console sweep (`node - <<'NODE' …` across `index.html`, `well-operations-planner.html`, `sustainability-calculator.html`)
