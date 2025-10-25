# Assets Directory

This directory contains the bundled media assets for the Well-Tegra platform.

## Committed Assets

- `watermark.jpg` – subtle repeating watermark used in archived demo backgrounds
- `logo.jpg` – brand mark applied across favicons, posters, and OpenGraph metadata
- `hero4.mp4` – locally hosted hero loop for the archived demo pages and the Unified Command Center walkthrough embed

## Recommended Sizes

- **watermark.jpg**: 350×350 px, very light opacity
- **logo.jpg**: ≥200×200 px, square aspect ratio
- **hero4.mp4**: short loop (≤5 MB) encoded as H.264 MP4 for broad browser support

## Usage Notes

All pages now load these files from relative paths (for example, `assets/watermark.jpg`) so GitHub Pages deployments work without external asset hosts. Replace the files in this folder to update the branding without touching the HTML. If you swap `hero4.mp4`, keep the runtime close to 30 seconds and ship an updated poster frame (`assets/logo.jpg` is used by default).
- `hero4.mp4` – locally hosted hero loop for the archived demo pages

## Recommended Sizes

- **watermark.jpg**: 350×350 px, very light opacity
- **logo.jpg**: ≥200×200 px, square aspect ratio
- **hero4.mp4**: short loop (≤5 MB) encoded as H.264 MP4 for broad browser support
- `watermark.jpg` - Subtle watermark for background (referenced in CSS)
- `thumbnail.png` - Social media/preview thumbnail
- `logo.jpg` - Well-Tegra logo

## Notes

These files are referenced in the code but not included in the repository. You can add your own branding assets here, or the application will gracefully degrade without them.

## Recommended Sizes

- **watermark.jpg**: 350x350px, very light opacity
- **thumbnail.png**: 1200x630px (Open Graph standard)
- **logo.jpg**: 200x200px or larger, square aspect ratio

## Usage Notes

All pages now load these files from relative paths (for example, `assets/watermark.jpg`) so GitHub Pages deployments work without external asset hosts. Replace the files in this folder to update the branding without touching the HTML.
Assets are referenced via absolute URLs in the code:
- `https://welltegra.network/assets/watermark.jpg`
- `https://welltegra.network/assets/thumbnail.png`
- `https://welltegra.network/assets/logo.jpg`
