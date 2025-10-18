
# Well‑Tegra — Production Scaffold (v1)

This folder gives you a **working single-file app** and a **ready Tailwind build pipeline**.

## Quick Preview (no build)
Open `index.html` in your browser. It uses Tailwind CDN for instant preview and loads Chart.js from a CDN.

## Production CSS
1) Install tooling
   ```bash
   npm install
   ```
2) Build Tailwind once
   ```bash
   npm run build:css
   ```
3) In `index.html`, **uncomment** the local CSS line and **remove** the CDN script.

## Files
- `index.html` — your full interactive demo (planner / performer / analyzer), dark/light, ROI chart.
- `assets/` — logo, poster, favicons, `styles.css`, and **compiled** `tailwind.css` output target.
- `src/input.css` — Tailwind source.
- `tailwind.config.js`, `postcss.config.js`, `package.json` — pipeline config.

## YouTube
Header includes a link to your channel: `@WellTegra` / `UCedD5TAvyQgV1LRFfjoNRww`.
