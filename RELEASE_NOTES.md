# Release Notes — Planner Console Guardrails

## Summary

- Restored the missing planner DOM handles so marketing-only loads no longer throw `ReferenceError` exceptions when the scripted continue and workspace buttons initialize.【F:assets/js/app.js†L1405-L1420】【F:assets/js/app.js†L4079-L4146】
- Added a defensive hero video toggle initializer to silence the undefined helper warning while keeping the button accessible if it returns.【F:assets/js/app.js†L4369-L4393】
- Updated the audit checklist to capture the new console regression scope and the refreshed smoke-test command list.【F:CHECKLIST.md†L6-L35】【F:CHECKLIST.md†L37-L48】
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
5. `npm run lint:links`
6. Playwright console sweep (`node - <<'NODE' …` across `index.html`, `well-operations-planner.html`, `sustainability-calculator.html`)
