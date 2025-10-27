# Release Notes — Planner Console Guardrails

## Summary

- Introduced a dedicated **Data Export Hub** view across the marketing shells with direct download CTAs for the W666 and portfolio CSVs plus contextual usage guidance.【F:index.html†L459-L515】【F:index-v23-fresh.html†L892-L948】【F:test-v23-1761097711.html†L892-L948】
- Hydrated the new view with live record counts, schema previews, inline preview tables, and file size estimates by streaming the CSV headers/rows at load time so analysts can verify dataset shape without leaving the site.【F:assets/js/app.js†L1385-L1414】【F:assets/js/app.js†L3827-L3988】
- Added one-click pandas, <code>curl</code>, and SQL schema copy helpers inside the hub and captured the enhancement in the documentation so downstream teams can bootstrap analytics notebooks, CLI scripts, or warehouse tables faster.【F:index.html†L475-L523】【F:index-v23-fresh.html†L908-L956】【F:test-v23-1761097711.html†L908-L956】【F:assets/js/app.js†L3870-L3955】【F:README.md†L26-L35】
- Surfaced inline data dictionary callouts with SQL type badges so analysts understand field intent before downloading, while keeping graceful fallbacks when schema metadata is unavailable.【F:index.html†L484-L505】【F:index-v23-fresh.html†L917-L938】【F:test-v23-1761097711.html†L917-L938】【F:assets/js/app.js†L1385-L1422】【F:assets/js/app.js†L3910-L3953】

## Verification

1. `node --check assets/js/app.js`
2. `npm run build:css`
3. `python -m json.tool equipment-catalog.json`
4. `python -m json.tool service-line-templates.json`
5. `npm run lint:links`
6. Playwright console sweep (`node - <<'NODE' …` across `index.html`, `well-operations-planner.html`, `sustainability-calculator.html`)
