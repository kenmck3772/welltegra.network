# Release Notes — Home Navigation Feedback

## Summary

- Surfaced a toast notification when users click gated navigation without a generated plan so the hero CTA and header buttons explain the requirement and route supervisors back to the planner instead of appearing unresponsive.【F:assets/js/app.js†L2723-L2729】
# Release Notes — Mobile Communicator Onboarding Guide

## Summary

- Added an inline “How to use the Mobile Communicator” collapsible guide so engineers can learn the approval workflow without leaving the planner. The panel walks through opening the channel, validating plan context, and issuing secure approvals with digital seals.【F:index.html†L1051-L1070】【F:well-operations-planner.html†L173-L192】
- Documented the quick-start sequence in the public README so new users understand how change requests, plan snapshots, and audit trails work together in the demo build.【F:README.md†L108-L129】

## Verification

1. `node --check assets/js/app.js`

# Release Notes — Mobile Communicator Onboarding Guide

## Summary

- Added an inline “How to use the Mobile Communicator” collapsible guide so engineers can learn the approval workflow without leaving the planner. The panel walks through opening the channel, validating plan context, and issuing secure approvals with digital seals.【F:index.html†L1051-L1070】【F:well-operations-planner.html†L173-L192】
- Documented the quick-start sequence in the public README so new users understand how change requests, plan snapshots, and audit trails work together in the demo build.【F:README.md†L108-L129】

## Verification

1. `node --check assets/js/app.js`
# Release Notes — Old Pie Embassy White Paper Synthesis

## Summary

- Captured actionable insights from the Old Pie Embassy “Architectural Blueprint for the 'well-tegra' Master Program” white paper, mapping its master data architecture and phased rollout to our current backlog priorities.【F:WHITE_PAPER_INSIGHTS.md†L1-L63】
- Linked the synthesis into the public README so stakeholders can review the guidance alongside other strategic planning collateral.【F:README.md†L96-L101】

## Verification

1. Documentation review only

# Release Notes — Mobile Communicator Accessibility Hardening

## Summary

- Added an internal focus trap, aria-hidden toggles, and button expanded states so the Mobile Communicator dialog now keeps keyboard users inside the approval workflow and returns focus to the launch control after closing.【F:assets/js/mobile-communicator.js†L153-L221】【F:index.html†L214-L234】【F:well-operations-planner.html†L33-L53】
- Hid the pending badge when no approvals are queued and synchronized the launcher’s announcement text so screen readers only surface actionable counts.【F:assets/js/mobile-communicator.js†L287-L304】【F:index.html†L230-L233】【F:well-operations-planner.html†L49-L52】
- Declared the communicator overlay as aria-hidden by default to prevent it from appearing in the browse tree until activated.【F:index.html†L1048-L1055】【F:well-operations-planner.html†L170-L177】

## Verification

1. `node --check assets/js/mobile-communicator.js`

# Release Notes — Planner Console Guardrails

## Summary

- Introduced a dedicated **Data Export Hub** view across the marketing shell with direct download CTAs that now cover the W666, portfolio, activity cost, equipment rate, and personnel rate CSVs plus contextual usage guidance.【F:index.html†L459-L600】
- Hydrated the new view with live record counts, schema previews, inline preview tables, and file size estimates by streaming the CSV headers/rows at load time so analysts can verify dataset shape without leaving the site.【F:assets/js/app.js†L1385-L1573】【F:assets/js/app.js†L3827-L3988】
- Added one-click pandas, <code>curl</code>, and SQL schema copy helpers inside the hub and captured the enhancement in the documentation so downstream teams can bootstrap analytics notebooks, CLI scripts, or warehouse tables faster.【F:index.html†L475-L597】【F:assets/js/app.js†L3870-L3990】【F:README.md†L26-L35】
- Calculated SHA-256 fingerprints for each dataset and exposed copyable fingerprint buttons across the marketing shell so analysts can verify integrity from the hub, with fallbacks for browsers without SubtleCrypto support.【F:index.html†L495-L612】【F:assets/js/app.js†L3841-L4013】【F:assets/js/app.js†L4461-L4568】
- Hardened the clipboard helpers with dedicated live regions and message resets so repeat copy attempts trigger clear feedback for screen reader users.【F:index.html†L500-L597】【F:assets/js/app.js†L4205-L4231】
- Surfaced inline data dictionary callouts with SQL type badges so analysts understand field intent before downloading, while keeping graceful fallbacks when schema metadata is unavailable.【F:index.html†L484-L590】【F:assets/js/app.js†L1385-L1548】【F:assets/js/app.js†L3910-L3953】
- Added a planner gating helper that announces plan requirements and routes CTAs back to the workflow so Live Ops, Logistics, Commercial, HSE, and Analysis buttons provide feedback instead of silently failing pre-plan.【F:assets/js/app.js†L1620-L1671】【F:assets/js/app.js†L4386-L4404】
- Retired legacy demo HTML shells and unused background videos, then documented the trimmed footprint in the lean inventory log.【F:LEAN_INVENTORY.md†L1-L33】


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
# Release Notes — Mobile Communicator Plan Context

## Summary

- Embedded a "Latest plan snapshot" card inside the Mobile Communicator dialog so supervisors see budget, duration, crew, risk badges, first execution steps, and on-call personnel before granting remote approval.【F:index.html†L1055-L1164】【F:well-operations-planner.html†L182-L241】
- Persisted the most recent planner broadcast (with objective description, sustainability highlight, and top-step preview) to local storage and reset it when the workflow is cleared, keeping mobile sign-off context synchronized with the planner state.【F:assets/js/mobile-communicator.js†L231-L260】【F:assets/js/mobile-communicator.js†L851-L944】【F:assets/js/app.js†L3243-L3305】【F:assets/js/app.js†L2781-L2790】
- Surfaced supporting evidence badges for each change request so engineers can confirm attachments from the deck during the approval review.【F:assets/js/mobile-communicator.js†L673-L688】

