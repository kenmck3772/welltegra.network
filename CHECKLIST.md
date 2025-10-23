# Audit Checklist — WellTegra Static Site

## Console Output

- [x] Before (local preview on `index.html`):

```text
console:log:Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
pageerror:showView is not defined
pageerror:switchView is not defined
pageerror:computed is not defined
console:warning:Demo preload: showView not ready after waiting
```

- [x] After (post-fix preview):

```text
console:log:Cost data loaded: {equipment: 37, personnel: 35, activities: 30}
```

## Data Integrity

- [x] JSON validation via `jq` for `equipment-catalog.json`, `service-line-templates.json`, `package.json`, `package-lock.json`.
- [x] Confirmed no legacy map datasets remain in the repo and noted the clean state for future integrations.

## Link Health

- [x] `npm run lint:links` (linkinator) → 0 broken links remaining.

## Styling Pipeline

- [x] Tailwind CLI build wired (`npm run build:css`) → generates `assets/css/tailwind.css`.
- [x] CDN scripts replaced with local build across HTML variants (index, pricing, archived builds, assets prototype).

## Lighthouse Snapshot

- [x] Lighthouse (`npx lighthouse … --chrome-flags="--headless --no-sandbox"`)
  - Performance: 0.67
  - Accessibility: 0.98
  - Best Practices: 0.92
  - SEO: 1.00
  - Noted environment-only HTTPS certificate errors for CDN assets; real browsers load successfully.
  - Key metrics: FCP 3.5 s, LCP 3.7 s, Speed Index 4.8 s, TBT 710 ms, CLS 0.

## Accessibility & SEO Fixes (Top 10)

1. Added CSP meta to primary HTML variants to scope remote resources.
2. Replaced Tailwind CDN with compiled `assets/css/tailwind.css` (better caching & removes console warning).
3. Added SRI + version pinning for Chart.js, jsPDF, html2canvas.
4. Swapped remote logo image for local `assets/logo.jpg` + favicon links.
5. Added `rel="noopener noreferrer"` on all `target="_blank"` anchors.
6. Injected `rel="icon"` for pages missing favicons (prevents Lighthouse console error).
7. Updated CSP `img-src` allowlist to only include self + data URIs.
8. Introduced `package.json` scripts for CSS build, Prettier formatting, and link linting.
9. Created `styles/tailwind.css` entrypoint and `tailwind.config.js` with repo-wide content globs.
10. Flagged the removal of deprecated map datasets and recorded the JSON validation approach for future data sources.

## Security Hygiene

- [x] Added CSP starter, SRI hashes, and `rel="noopener"` safeguards.
- [x] Note: CDN certificate warnings occur only in headless Lighthouse; interactive Chromium session shows clean console.
