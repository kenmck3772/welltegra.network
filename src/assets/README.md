# Assets Directory

This directory contains media assets for the Well-Tegra platform.

## Expected Files

- `watermark.png` - Subtle watermark for background (referenced in CSS)
- `thumbnail.png` - Social media/preview thumbnail
- `logo.jpg` - Well-Tegra logo

## Notes

These files are referenced in the code but not included in the repository. You can add your own branding assets here, or the application will gracefully degrade without them.

## Recommended Sizes

- **watermark.png**: 350x350px, transparent PNG, very light opacity
- **thumbnail.png**: 1200x630px (Open Graph standard)
- **logo.jpg**: 200x200px or larger, square aspect ratio

## Usage

Assets are referenced via absolute URLs in the code:
- `https://welltegra.network/assets/watermark.png`
- `https://welltegra.network/assets/thumbnail.png`
- `https://welltegra.network/assets/logo.jpg`
