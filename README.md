# Well-Tegra Demo (ZIP-ready)
Works immediately using Tailwind via CDN.

## Build local Tailwind for production
1) Install Tailwind & tools:
   npm init -y
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p

2) Create src/input.css:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

3) Configure tailwind.config.js:
   module.exports = {
     content: ["./**/*.html", "./src/**/*.{js,ts}"],
     theme: { extend: {} },
     plugins: [],
   }

4) Build:
   npx tailwindcss -i ./src/input.css -o ./assets/tailwind.css --minify

5) In index.html, replace the CDN with:
   <link rel="stylesheet" href="assets/tailwind.css">
