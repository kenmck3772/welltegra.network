# Release Notes — CSP Cleanup & Console Regression

## Summary

- Introduced "Verifiable Trust", "Unified Command Center", and "Strategic Roadmap" sections on the homepage so investors and operators see how the white paper architecture is embedded in the live product experience, now including a ledger handshake diagram, captioned walkthrough video, and roadmap timeline SVG (`index.html`).
- Added accessible `<details>` narratives plus reusable `data-switch-view` buttons that jump straight to the Planner and White Paper views without triggering console noise (`index.html`).
- Maintained the hardened CSP/media fixes and updated the audit artefacts with the new CTA regression notes (`CHECKLIST.md`).

## Verification

1. Install dependencies: `npm install` (only required once per environment).
2. Serve locally (`python -m http.server 8000`) and browse:
   - `http://127.0.0.1:8000/index.html`
   - `http://127.0.0.1:8000/index-v23-fresh.html`
   - `http://127.0.0.1:8000/test-v23-1761097711.html`
3. Confirm browser console is free of CSP media errors, then click the "Read the Executive White Paper Summary" and "Launch the Planner Demo" buttons — each should switch views cleanly with no new warnings.
4. Rebuild Tailwind if styles change: `npm run build:css`.
5. Optional: rerun Lighthouse `npx lighthouse http://127.0.0.1:8000/index.html --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance --preset=desktop` to compare metrics with the recorded baseline (Performance 0.99, TBT 0 ms).
