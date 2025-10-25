# Release Notes — CSP Cleanup & Console Regression

## Summary

- Tightened the homepage hero spacing, enforced inline playback attributes, and hid the fallback banner once `assets/hero.mp4` resumes so the top section no longer shows blank padding (`index.html`).
- Surface the Toolstring Configurator as soon as a well is selected, with dynamic copy, disabled presets until an objective is chosen, and auto-scroll guidance into Step 2 before generating a plan (`index.html`, `CHECKLIST.md`).
- Retimed the Performer telemetry loop to a 400&nbsp;ms cadence with scaled NPT deltas so depth, hookload, and alarms animate smoothly while keeping the log and dashboard in sync (`index.html`, `CHECKLIST.md`).

## Verification

1. Install dependencies: `npm install` (only required once per environment).
2. Serve locally (`python -m http.server 8000`) and browse:
   - `http://127.0.0.1:8000/index.html`
   - `http://127.0.0.1:8000/index-v23-fresh.html`
   - `http://127.0.0.1:8000/test-v23-1761097711.html`
3. Confirm browser console is free of CSP media errors, then click the "Read the Executive White Paper Summary" and "Launch the Planner Demo" buttons — each should switch views cleanly with no new warnings.
4. Expand each Unified Command Center card, trigger the story overlays via their rounded CTA buttons (including the new HSE Sentinel and POB & Emergency stories), step through them with the Previous/Next buttons or Arrow keys (watching the hints update), use the progress map pills to jump straight to another story, dismiss via close button, background, and ESC, and verify focus returns to the originating control with no console noise.
5. While the overlay is open, confirm the KPI cards render under the narrative bullets and that the sr-only status element (inspect via devtools) updates to match the active story; optionally use a screen reader to hear the announced summary.
6. In Planner Step 2, switch presets, filter for "gauge", add/remove/move components, and confirm the Toolstring summary totals update. Generate the plan, review the Toolstring Layout card in Step 3, then launch Performer to see the chips mirror the configured string and the cockpit fade in without console chatter.
7. On the hero, verify the background video autoplays; simulate a blocked request (e.g., via devtools throttling) to ensure the fallback banner appears and the console stays quiet when playback resumes.
8. Rebuild Tailwind if styles change: `npm run build:css`.
9. Optional: rerun Lighthouse `npx lighthouse http://127.0.0.1:8000/index.html --quiet --chrome-flags="--headless --no-sandbox" --only-categories=performance --preset=desktop` to compare metrics with the recorded baseline (Performance 0.99, TBT 0 ms).
