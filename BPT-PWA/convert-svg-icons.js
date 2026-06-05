// SVG to PNG conversion script (requires sharp)
// Run: npm install -D sharp
// Then: node convert-svg-icons.js

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const publicDir = path.join(__dirname, 'public');

async function convertIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // Generate 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  console.log('✓ Icons generated successfully!');
  console.log('  - icon-192.png');
  console.log('  - icon-512.png');
}

convertIcons().catch(err => {
  console.error('Error generating icons:', err);
  console.log('');
  console.log('If sharp is not installed, run: npm install -D sharp');
  console.log('Or use the online tool at: https://realfavicongenerator.net/');
  process.exit(1);
});
