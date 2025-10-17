# Production Tailwind Setup (No Console Warning)

## Quick commands
```bash
npm install
npm run build  # creates ./assets/tailwind.css (minified)
```

Link it in your HTML:
```html
<link rel="stylesheet" href="./assets/tailwind.css">
```

### Optional: keep Play CDN for localhost only
Snippet (already in index.html):
```html
<script>
  (function () {
    var isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.search.includes("dev");
    if (isLocal) { var s=document.createElement("script"); s.src="https://cdn.tailwindcss.com"; document.head.appendChild(s); }
  })();
</script>
```

## Docker (no Node install on host)
```bash
docker run --rm -v "$PWD":/app -w /app node:20-alpine sh -lc "npm i && npm run build && ls -lh assets/tailwind.css"
```
