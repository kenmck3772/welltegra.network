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
