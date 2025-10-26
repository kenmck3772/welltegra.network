# Release Notes — CSP + Tailwind Hardening

## Summary

- Added standalone `well-operations-planner.html` with a CSP-compliant layout, live schematic canvas, and job planner metrics backed by the existing catalog data and a dedicated controller script.【F:well-operations-planner.html†L1-L121】【F:assets/js/well-operations-planner.js†L1-L233】
- Delivered `equipment-browser.html` so engineers can browse catalog categories, inspect specs/history via an accessible modal, and assemble a job plan without inline handlers, all wired to the shared dataset.【F:equipment-browser.html†L1-L163】【F:assets/js/equipment-browser.js†L1-L329】
- Promoted the new planner flows from the landing hero so visitors can launch the immersive tooling experiences directly from the case study.【F:index.html†L63-L80】
- Embedded a W666 walkthrough that surfaces LangExtract-powered data scrubbing stages, schema controls, and QA evidence so stakeholders can verify the raw-to-structured pipeline before planning.【F:index.html†L170-L197】【F:assets/js/app.js†L1439-L1502】【F:assets/js/app.js†L2878-L2962】【F:assets/js/app.js†L3532-L3561】
- Introduced catalog-aware fallback datasets, CSV parsers, and service template indexes so planner-generated operations can hydrate equipment and personnel records without relying on remote fetches.【F:assets/js/app.js†L360-L707】
- Reworked the logistics module to filter matched tooling and crews, populate vendor/rate columns, and surface Well-Tegra catalog context in the new Service Line Reference card.【F:index.html†L240-L263】【F:assets/js/app.js†L1819-L1977】
- Renamed the logistics filter helpers to prevent duplicate `const` declarations that triggered `Identifier 'filteredPersonnel' has already been declared` in the browser console when opening the Asset & Logistics step.【F:assets/js/app.js†L2339-L2440】
- Updated the commercial and POB dashboards to derive vendor-aware service tickets, compute crew spend with `formatCurrency`, and expose daily rate/per diem totals alongside refreshed tables.【F:assets/js/app.js†L2115-L2261】【F:assets/js/app.js†L1998-L2104】
- Hardened `loadReferenceData()` to detect offline mode, reuse bundled data, and keep downstream views in sync; rebuilt Tailwind CSS after the markup and class updates.【F:assets/js/app.js†L2831-L2892】【791719†L1-L7】

## Verification

1. `npm install` (once) to ensure Playwright/Tailwind CLI dependencies are present.
2. `npm run build:css` — Tailwind CLI rebuild (expect an informational Browserslist warning).【6a05cb†L1-L5】【a58981†L1-L7】
3. `python3 -m http.server 8000` and open `http://127.0.0.1:8000/index.html`.
4. Visit `well-operations-planner.html` and `equipment-browser.html` to confirm the canvases, modals, and builder interactions run without CSP violations.【F:well-operations-planner.html†L1-L121】【F:equipment-browser.html†L1-L163】
5. Run `node -e "const {chromium}=require('playwright'); …"` (see checklist for full snippet) — the console should print `NO_CONSOLE_MESSAGES`.【16596b†L1】
6. `npm run lint:links` (with the local server running) — confirm 0 broken links.【55759a†L1-L6】【21c9a3†L1】
7. Navigate through the planner workflow to ensure charts, tables, and PDF export still function with the vendored libraries.【F:assets/js/app.js†L2224-L2922】
- Updated the commercial and POB dashboards to derive vendor-aware service tickets, compute crew spend with `formatCurrency`, and expose daily rate/per diem totals alongside refreshed tables.【F:assets/js/app.js†L2115-L2261】【F:assets/js/app.js†L1998-L2104】
- Hardened `loadReferenceData()` to detect offline mode, reuse bundled data, and keep downstream views in sync; rebuilt Tailwind CSS after the markup and class updates.【F:assets/js/app.js†L2831-L2892】【791719†L1-L7】

## Verification

1. `npm install` (once) to ensure Playwright/Tailwind CLI dependencies are present.
2. `npm run build:css` — Tailwind CLI rebuild (expect an informational Browserslist warning).【6a05cb†L1-L5】【a58981†L1-L7】
3. `python3 -m http.server 8000` and open `http://127.0.0.1:8000/index.html`.
4. Visit `well-operations-planner.html` and `equipment-browser.html` to confirm the canvases, modals, and builder interactions run without CSP violations.【F:well-operations-planner.html†L1-L121】【F:equipment-browser.html†L1-L163】
5. Run `node -e "const {chromium}=require('playwright'); …"` (see checklist for full snippet) — the console should print `NO_CONSOLE_MESSAGES`.【16596b†L1】
6. `npm run lint:links` (with the local server running) — confirm 0 broken links.【55759a†L1-L6】【21c9a3†L1】
7. Navigate through the planner workflow to ensure charts, tables, and PDF export still function with the vendored libraries.【F:assets/js/app.js†L2224-L2922】

## Verification

1. `npm install` (once) to ensure Playwright/Tailwind CLI dependencies are present.
2. `npm run build:css` — Tailwind CLI rebuild (expect an informational Browserslist warning).【6a05cb†L1-L5】【a58981†L1-L7】
3. `python3 -m http.server 8000` and open `http://127.0.0.1:8000/index.html`.
4. Visit `well-operations-planner.html` and `equipment-browser.html` to confirm the canvases, modals, and builder interactions run without CSP violations.【F:well-operations-planner.html†L1-L121】【F:equipment-browser.html†L1-L163】
5. Run `node -e "const {chromium}=require('playwright'); …"` (see checklist for full snippet) — the console should print `NO_CONSOLE_MESSAGES`.【16596b†L1】
6. `npm run lint:links` (with the local server running) — confirm 0 broken links.【55759a†L1-L6】【21c9a3†L1】
7. Navigate through the planner workflow to ensure charts, tables, and PDF export still function with the vendored libraries.【F:assets/js/app.js†L2224-L2922】
- Reverted `index.html` and `assets/js/app.js` to a clean single-instance layout, then removed duplicate `<head>` blocks, inline `<style>`/`<script>` fragments, and stray login markup left by earlier merges.【F:index.html†L5-L246】【F:assets/js/app.js†L1-L2960】
- Locked the CSP to self-hosted resources, added a meta description/canonical URL, and replaced remote Chart.js/jspdf/html2canvas references with copies in `assets/vendor/` so production previews run without CSP violations.【F:index.html†L5-L18】【F:index.html†L14-L18】
- Normalised mojibake icons in `assets/js/app.js`, restored readable emoji, and ensured status badges use accessible copy instead of garbled characters.【F:assets/js/app.js†L276-L314】【F:assets/js/app.js†L684-L698】【F:assets/js/app.js†L1524-L1532】
- Added intrinsic logo dimensions and limited the hero video preload to metadata to reduce layout shift while preserving the existing design.【F:index.html†L30-L98】
- Regenerated the production stylesheet via `npm run build:css` so the Tailwind bundle matches the updated theme tokens and CSP-friendly asset paths.【6a05cb†L1-L5】【a58981†L1-L7】
- Documented the audit in `CHECKLIST.md`, covering console captures, JSON validation, link health, performance ideas, accessibility/SEO backlog, and security hygiene.【F:CHECKLIST.md†L1-L63】
- Added a visible-on-focus skip link, ARIA tablist wiring for the primary navigation, and list semantics for hero feature cards to improve structural navigation.【F:index.html†L25-L114】
- Enhanced ROI controls with programmatic `aria-valuetext`, added live planner status messaging, and replaced PDF export alerts with a status region.【F:index.html†L118-L141】【F:assets/js/app.js†L2224-L2381】【F:assets/js/app.js†L2856-L2920】
- Updated `CHECKLIST.md` to log the new remediation work and revised accessibility backlog entries, and trimmed the whitepaper CTA to avoid a misleading `download` hint.【F:CHECKLIST.md†L16-L63】【F:index.html†L226-L233】

## Verification
1. `npm install` (once) to ensure Playwright/Tailwind CLI dependencies are present.
2. `npm run build:css` — Tailwind CLI rebuild (expect an informational Browserslist warning).【6a05cb†L1-L5】【a58981†L1-L7】
3. `python3 -m http.server 8000` and open `http://127.0.0.1:8000/index.html`.
4. Run `node -e "const {chromium}=require('playwright'); …"` (see checklist for full snippet) — the console should print `NO_CONSOLE_MESSAGES`.【16596b†L1】
5. `npm run lint:links` (with the local server running) — confirm 0 broken links.【55759a†L1-L6】【21c9a3†L1】
6. Navigate through the planner workflow to ensure charts, tables, and PDF export still function with the vendored libraries.【F:assets/js/app.js†L2224-L2922】
