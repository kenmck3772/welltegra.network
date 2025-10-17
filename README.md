# Fixes
- Replaced remote logo URL with local `./assets/logo.svg` to stop 404s.
- Added `onerror` fallback to the welcome logo.

## Tailwind production
The Play CDN is fine for demos; to remove the console warning, build Tailwind:
```bash
npm init -y
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# tailwind.config.js: content: ["./*.html"]
# input.css:
#   @tailwind base;
#   @tailwind components;
#   @tailwind utilities;
npx tailwindcss -i ./input.css -o ./assets/tailwind.css --minify
```
Then replace the script tag with:
```html
<link rel="stylesheet" href="./assets/tailwind.css">
```
