# Chromebook PWA Setup Guide

Your Brahan Personal Terminal has been converted into a Progressive Web App (PWA) that you can install on your Chromebook!

## What's New

- **Installable App**: Install directly from Chrome as a standalone application
- **Offline Support**: Service worker caches assets for offline access
- **App-like Experience**: Launches in its own window, appears in app drawer
- **Fast Loading**: Cached resources load instantly

## Installation Instructions

### 1. Build and Serve the App

```bash
# Install dependencies
npm install

# Build the production version
npm run build

# Preview the built app
npm run preview
```

### 2. Install on Your Chromebook

1. Open Chrome and navigate to `http://localhost:4173` (or your server URL)
2. Look for the **install icon** (⊕) in the address bar
3. Click it and select "Install"
4. The app will now appear in your app drawer!

Alternatively:
1. Click the three-dot menu (⋮) in Chrome
2. Select "Install Brahan Personal Terminal..."
3. Confirm the installation

### 3. Development Mode

For development with PWA features enabled:

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll see PWA features even in dev mode!

## Icon Customization

The app currently uses placeholder icons. To create custom icons:

### Option 1: Online Tool (Easiest)
1. Visit https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Download and replace the generated PNG files in `public/`

### Option 2: CLI Method
```bash
# Install the sharp image processing library
npm install -D sharp

# Run the conversion script
node convert-svg-icons.js
```

### Option 3: Design Your Own
Create PNG files at these sizes:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

## PWA Features

### Offline Support
- Assets are cached automatically
- App works without internet connection
- Google Fonts and Tailwind CSS are cached

### Manifest Settings
- **Name**: Brahan Personal Terminal
- **Theme Color**: Emerald (#10b981) - matches the terminal UI
- **Display**: Standalone (full app experience)
- **Background**: Dark (#010409)

### Service Worker
- Auto-updates when new version is deployed
- Caches all JS, CSS, HTML, fonts, and images
- Smart caching for external resources (Google Fonts, Tailwind CDN)

## Files Added/Modified

### New Files
- `public/manifest.json` - PWA manifest
- `public/icon.svg` - Source icon (SVG format)
- `public/icon-192.png` - App icon (192x192)
- `public/icon-512.png` - App icon (512x512)
- `generate-icons.js` - Icon placeholder generator
- `convert-svg-icons.js` - SVG to PNG converter
- `PWA-SETUP.md` - This guide

### Modified Files
- `vite.config.ts` - Added VitePWA plugin configuration
- `index.html` - Added manifest link and meta tags
- `package.json` - Added vite-plugin-pwa dependency

## Testing PWA Features

### In Chrome DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest**: Should show all app details
   - **Service Workers**: Should show registered worker
   - **Cache Storage**: Should show cached resources

### Lighthouse Audit
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Aim for a score above 90!

## Deployment

### Option 1: Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

### Option 3: GitHub Pages
Add to `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

Then:
```bash
npm install -D gh-pages
npm run deploy
```

## Chromebook-Specific Tips

1. **Pin to Shelf**: Right-click the app → "Pin to shelf"
2. **Keyboard Shortcuts**: Work just like the web version
3. **Offline Mode**: Turn off WiFi to test offline functionality
4. **Updates**: App auto-updates when online
5. **Linux Container**: If using Linux, you can run `npm run dev` there

## Troubleshooting

### Install Button Not Showing
- Make sure you're using HTTPS or localhost
- Check manifest is valid in DevTools → Application → Manifest
- Try a hard refresh (Ctrl+Shift+R)

### Icons Not Showing
- Run `node generate-icons.js` to create placeholders
- Or use `node convert-svg-icons.js` for proper icons
- Clear cache and rebuild

### Service Worker Not Updating
```bash
# Force clean install
rm -rf node_modules dist
npm install
npm run build
```

## API Key Setup

Don't forget to create `.env.local` with your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

## Next Steps

1. ✅ Install the app on your Chromebook
2. ✅ Customize the icons
3. ✅ Deploy to a hosting service (optional)
4. ✅ Add to your Chromebook's shelf for quick access

Enjoy your new Chromebook app!
