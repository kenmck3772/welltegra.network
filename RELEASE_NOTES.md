# Release Notes — Planner Event Listener Hardening

## Summary

- Added a reusable `addListener` helper so planner event wiring only runs when the associated DOM nodes exist, preventing null-access errors on landing pages that omit the workflow controls.【F:assets/js/app.js†L1403-L1431】【F:assets/js/app.js†L4158-L4227】
- Updated the planner reset logic and ROI slider bindings to guard optional elements, ensuring `.disabled` toggles and listener registration do not execute on `null`.【F:assets/js/app.js†L1540-L1560】【F:assets/js/app.js†L3760-L3770】
- Replaced the mis-encoded live-operations badge with a proper bullet and refreshed CHECKLIST.md to document the regression fix and smoke checks.【F:assets/js/app.js†L1497-L1510】【F:CHECKLIST.md†L1-L28】

## Verification

1. `node --check assets/js/app.js`
2. `npm run build:css`
3. `python -m json.tool equipment-catalog.json`
4. `python -m json.tool service-line-templates.json`
