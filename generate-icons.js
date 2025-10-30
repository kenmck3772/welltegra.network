const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'assets/logo.jpg';
const iconsDir = 'assets/icons';
const splashDir = 'assets/splash';

// Ensure directories exist
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(splashDir)) fs.mkdirSync(splashDir, { recursive: true });

// Icon sizes needed for manifest.json
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Favicon sizes
const faviconSizes = [16, 32];

// Apple touch icon sizes
const appleSizes = [152, 167, 180];

// Windows tile
const msTile = 144;

// Splash screen sizes for iOS (width x height)
const splashSizes = [
  { name: 'iphone5_splash', width: 640, height: 1136 },
  { name: 'iphone6_splash', width: 750, height: 1334 },
  { name: 'iphoneplus_splash', width: 1242, height: 2208 },
  { name: 'iphonex_splash', width: 1125, height: 2436 },
  { name: 'iphonexr_splash', width: 828, height: 1792 },
  { name: 'iphonexsmax_splash', width: 1242, height: 2688 },
  { name: 'ipad_splash', width: 1536, height: 2048 },
  { name: 'ipadpro1_splash', width: 1668, height: 2224 },
  { name: 'ipadpro2_splash', width: 2048, height: 2732 }
];

async function generateIcons() {
  console.log('Generating PWA icons...');

  try {
    // Generate standard PWA icons
    for (const size of iconSizes) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Generate maskable icons (with padding for safe area)
    for (const size of [192, 512]) {
      const padding = Math.floor(size * 0.2); // 20% padding for safe area
      await sharp(sourceImage)
        .resize(size - padding * 2, size - padding * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        })
        .png()
        .toFile(path.join(iconsDir, `icon-maskable-${size}x${size}.png`));
      console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
    }

    // Generate favicons
    for (const size of faviconSizes) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(iconsDir, `favicon-${size}x${size}.png`));
      console.log(`✓ Generated favicon-${size}x${size}.png`);
    }

    // Generate Apple touch icons
    await sharp(sourceImage)
      .resize(180, 180, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    console.log(`✓ Generated apple-touch-icon.png`);

    for (const size of appleSizes) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .png()
        .toFile(path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`));
      console.log(`✓ Generated apple-touch-icon-${size}x${size}.png`);
    }

    // Generate Windows tile
    await sharp(sourceImage)
      .resize(msTile, msTile, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, `ms-tile-${msTile}x${msTile}.png`));
    console.log(`✓ Generated ms-tile-${msTile}x${msTile}.png`);

    // Generate splash screens with logo centered
    console.log('\\nGenerating iOS splash screens...');
    for (const splash of splashSizes) {
      const logoSize = Math.min(splash.width, splash.height) * 0.3; // Logo takes 30% of smaller dimension
      await sharp(sourceImage)
        .resize(Math.floor(logoSize), Math.floor(logoSize), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: Math.floor((splash.height - logoSize) / 2),
          bottom: Math.floor((splash.height - logoSize) / 2),
          left: Math.floor((splash.width - logoSize) / 2),
          right: Math.floor((splash.width - logoSize) / 2),
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        })
        .png()
        .toFile(path.join(splashDir, `${splash.name}.png`));
      console.log(`✓ Generated ${splash.name}.png (${splash.width}x${splash.height})`);
    }

    // Generate shortcut icons (for manifest shortcuts)
    const shortcuts = ['planner', 'analytics', 'data'];
    for (const shortcut of shortcuts) {
      await sharp(sourceImage)
        .resize(96, 96, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .png()
        .toFile(path.join(iconsDir, `shortcut-${shortcut}.png`));
      console.log(`✓ Generated shortcut-${shortcut}.png`);
    }

    console.log('\\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
