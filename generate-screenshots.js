const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = 'assets/logo.jpg';
const screenshotsDir = 'assets/screenshots';

// Ensure directory exists
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const screenshots = [
  { name: 'desktop-home', width: 1280, height: 720, text: 'Well-Tegra Home Screen' },
  { name: 'desktop-planner', width: 1280, height: 720, text: 'Well Intervention Planner' },
  { name: 'mobile-home', width: 750, height: 1334, text: 'Mobile Home Screen' }
];

async function generateScreenshots() {
  console.log('Generating PWA screenshot placeholders...');

  try {
    for (const screenshot of screenshots) {
      const logoSize = Math.min(screenshot.width, screenshot.height) * 0.25;

      // Create a placeholder screenshot with the logo centered
      await sharp(sourceImage)
        .resize(Math.floor(logoSize), Math.floor(logoSize), {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: Math.floor((screenshot.height - logoSize) / 2),
          bottom: Math.floor((screenshot.height - logoSize) / 2),
          left: Math.floor((screenshot.width - logoSize) / 2),
          right: Math.floor((screenshot.width - logoSize) / 2),
          background: { r: 15, g: 23, b: 42, alpha: 1 }
        })
        .png()
        .toFile(path.join(screenshotsDir, `${screenshot.name}.png`));

      console.log(`✓ Generated ${screenshot.name}.png (${screenshot.width}x${screenshot.height})`);
    }

    console.log('\n✅ All screenshots generated successfully!');
  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
    process.exit(1);
  }
}

generateScreenshots();
