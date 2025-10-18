# Well‑Tegra Demo — Production‑ready Starter (FULL APP)

This folder contains your **full single‑file app** (Planner, Performer, Analyzer, Logistics, HSE, POB, FAQ, About)
wired to **local assets** with an optional **Tailwind build**.

> **Quick Preview (no build):**
> 1) Open `index.html` in a browser.  
> 2) It uses the Tailwind CDN for convenience.  
> 3) When you're ready for production, **remove the CDN** and **enable local CSS** (see below).

## Switch to local Tailwind (production)
1. Install tools:
   ```bash
   npm install
   ```
2. Build CSS:
   ```bash
   npm run build:css
   # or watch during development
   npm run watch:css
   ```
3. In `index.html`:
   - **Remove** the CDN line: `<script src="https://cdn.tailwindcss.com"></script>`
   - **Uncomment** the local CSS line near the top:
     ```html
     <!-- <link rel="stylesheet" href="./assets/tailwind.css" /> -->
     ```

## Assets
All images/videos are read from `./assets`. Replace the placeholders with your real files.
Keep the same names to avoid changing `index.html`:
- `logo.svg` (header logo)
- `watermark.jpg` (subtle repeating background)
- `hero1.mp4`, `hero2.mp4` (optional video bg)
- `hero-poster.svg` (poster image if video disabled)
- Favicons: `favicon.ico`, `favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`
- `styles.css` for small custom tweaks (already linked)

## YouTube
Header includes a link to your channel: **@WellTegra** (`UCedD5TAvyQgV1LRFfjoNRww`).

---

### Troubleshooting
- If you still see a console note about Tailwind CDN: that’s just a reminder. Remove the CDN and use the built CSS as shown above.
- Broken images? Make sure the asset filenames in `/assets` match the ones listed above.
