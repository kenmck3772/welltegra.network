# Image Optimization Guide for Well-Tegra

This guide explains how to optimize images for better performance using WebP format and responsive images.

## Why Image Optimization Matters

- **WebP images** are 25-35% smaller than JPEGs at the same quality
- **Responsive images** ensure users download only what they need
- **Lazy loading** defers off-screen images to improve initial load time

## Converting Images to WebP

### Using Command Line (Recommended)

Install `cwebp` (part of WebP tools):

```bash
# macOS
brew install webp

# Ubuntu/Debian
sudo apt-get install webp

# Windows
# Download from: https://developers.google.com/speed/webp/download
```

Convert a single image:

```bash
cwebp -q 85 input.jpg -o output.webp
```

Batch convert all JPGs in a directory:

```bash
# Bash script
for file in assets/*.jpg; do
    cwebp -q 85 "$file" -o "${file%.jpg}.webp"
done
```

### Using Online Tools

- **Squoosh**: https://squoosh.app (Google's image optimizer)
- **CloudConvert**: https://cloudconvert.com/jpg-to-webp
- **Convertio**: https://convertio.co/jpg-webp/

## Implementation Patterns

### 1. Basic WebP with Fallback

Use the `<picture>` element for automatic fallback:

```html
<picture>
    <source srcset="assets/logo.webp" type="image/webp">
    <img src="assets/logo.jpg" alt="Well-Tegra Logo" loading="lazy">
</picture>
```

### 2. Using image-utils.js

The easiest way is to use data attributes:

```html
<!-- The script will automatically create WebP version if available -->
<img src="assets/logo.jpg"
     data-webp="assets/logo.webp"
     alt="Well-Tegra Logo"
     loading="lazy">
```

### 3. Programmatic Picture Element

```javascript
const pictureHtml = createPictureElement({
    src: 'assets/hero.jpg',
    alt: 'Hero image',
    sources: [
        {
            srcset: 'assets/hero.webp',
            type: 'image/webp'
        }
    ],
    className: 'hero-image',
    loading: 'lazy'
});

document.getElementById('container').innerHTML = pictureHtml;
```

### 4. Responsive Images with Multiple Sizes

```html
<picture>
    <!-- WebP versions for different screen sizes -->
    <source
        srcset="assets/hero-320w.webp 320w,
                assets/hero-640w.webp 640w,
                assets/hero-1024w.webp 1024w,
                assets/hero-1920w.webp 1920w"
        type="image/webp"
        sizes="100vw">

    <!-- Fallback JPEGs -->
    <source
        srcset="assets/hero-320w.jpg 320w,
                assets/hero-640w.jpg 640w,
                assets/hero-1024w.jpg 1024w,
                assets/hero-1920w.jpg 1920w"
        type="image/jpeg"
        sizes="100vw">

    <img src="assets/hero.jpg" alt="Hero" loading="lazy">
</picture>
```

### 5. Background Images with WebP

```html
<!-- Add data-bg-webp attribute -->
<div class="hero-section"
     style="background-image: url('assets/bg.jpg')"
     data-bg-webp="assets/bg.webp">
</div>
```

The `image-utils.js` will automatically switch to WebP if supported.

## Creating Responsive Image Sizes

Use ImageMagick or similar tools to create multiple sizes:

```bash
# Install ImageMagick
brew install imagemagick

# Create multiple sizes
for size in 320 640 1024 1920; do
    magick input.jpg -resize ${size}x input-${size}w.jpg
    cwebp -q 85 input-${size}w.jpg -o input-${size}w.webp
done
```

## Optimization Checklist

- [ ] Convert all JPG/PNG images to WebP
- [ ] Keep original JPG/PNG as fallbacks
- [ ] Create responsive sizes for large images (320w, 640w, 1024w, 1920w)
- [ ] Add `loading="lazy"` to non-critical images
- [ ] Use `<picture>` elements for art direction
- [ ] Compress all images to 85% quality or lower
- [ ] Add proper width/height attributes to prevent layout shift
- [ ] Preload critical above-the-fold images

## Current Images to Optimize

### Priority 1 (Large Files)
- `assets/hero.mp4` - Already lazy loaded, consider poster image optimization
- `assets/watermark.jpg` (29KB) - Convert to WebP
- `assets/logo.jpg` (29KB) - Convert to WebP

### Priority 2 (Referenced in HTML)
Check all `<img>` tags in:
- index.html
- pricing.html
- well-operations-planner.html
- equipment-catalog-integration.html
- sustainability-calculator.html

## Automation Script

Add to `package.json`:

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

Create `scripts/optimize-images.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const sizes = [320, 640, 1024, 1920];

// Find all JPG/PNG files
const images = fs.readdirSync(assetsDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .map(file => path.join(assetsDir, file));

images.forEach(imagePath => {
    const ext = path.extname(imagePath);
    const base = path.basename(imagePath, ext);
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Convert to WebP
    try {
        execSync(`cwebp -q 85 "${imagePath}" -o "${webpPath}"`);
        console.log(`✓ Created ${path.basename(webpPath)}`);
    } catch (error) {
        console.error(`✗ Failed to convert ${path.basename(imagePath)}`);
    }

    // Create responsive sizes for larger images
    const stats = fs.statSync(imagePath);
    if (stats.size > 100 * 1024) { // Only for images > 100KB
        sizes.forEach(size => {
            const resizedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, `-${size}w$1`);
            const resizedWebP = resizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

            try {
                execSync(`magick "${imagePath}" -resize ${size}x "${resizedPath}"`);
                execSync(`cwebp -q 85 "${resizedPath}" -o "${resizedWebP}"`);
                console.log(`  ✓ Created ${path.basename(resizedWebP)}`);
            } catch (error) {
                console.error(`  ✗ Failed to create ${size}w version`);
            }
        });
    }
});

console.log('\n✓ Image optimization complete!');
```

## Testing WebP Support

Check if WebP is working:

```javascript
// In browser console
supportsWebP().then(supported => {
    console.log('WebP supported:', supported);
});
```

Or check the HTML element:

```javascript
document.documentElement.classList.contains('webp') // true if supported
```

## Performance Impact

Expected improvements after optimization:

- **Logo (29KB JPG → ~20KB WebP)**: ~30% reduction
- **Watermark (29KB JPG → ~20KB WebP)**: ~30% reduction
- **Hero poster image**: ~35% reduction with WebP
- **Overall page load**: ~15-20% faster on slow connections

## Browser Support

WebP is supported in:
- ✓ Chrome 23+
- ✓ Firefox 65+
- ✓ Edge 18+
- ✓ Safari 14+ (iOS 14+)
- ✓ Opera 12.1+

Fallback to JPG/PNG ensures compatibility with older browsers.

## Further Reading

- [Google WebP Documentation](https://developers.google.com/speed/webp)
- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [web.dev: Serve Images in Modern Formats](https://web.dev/uses-webp-images/)
