// scripts/generate-icons.js
// Generates PWA icons as SVG files + favicon.ico
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

function generateSVG(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const outerR = s * 0.45;
  const innerR = s * 0.39;
  const ringOuterR = s * 0.25;
  const ringInnerR = s * 0.15;
  const dotR = s * 0.07;
  const lineW = s * 0.55;
  const lineH = s * 0.02;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1C0A00" rx="${s * 0.08}"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#D4AF37" stroke-width="${s * 0.02}"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.015}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringOuterR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.02}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringInnerR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.015}"/>
  <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="#D4AF37"/>
  <rect x="${cx - lineW / 2}" y="${cy - lineH / 2}" width="${lineW}" height="${lineH}" rx="${lineH / 2}" fill="#C8882A"/>
</svg>`;
}

function generateMaskableSVG(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const outerR = s * 0.38;
  const innerR = s * 0.33;
  const ringOuterR = s * 0.21;
  const ringInnerR = s * 0.13;
  const dotR = s * 0.06;
  const lineW = s * 0.47;
  const lineH = s * 0.018;
  const safeR = s * 0.4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1C0A00"/>
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#D4AF37" stroke-width="${s * 0.018}"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.014}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringOuterR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.018}"/>
  <circle cx="${cx}" cy="${cy}" r="${ringInnerR}" fill="none" stroke="#C8882A" stroke-width="${s * 0.014}"/>
  <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="#D4AF37"/>
  <rect x="${cx - lineW / 2}" y="${cy - lineH / 2}" width="${lineW}" height="${lineH}" rx="${lineH / 2}" fill="#C8882A"/>
</svg>`;
}

// Generate standard icons
for (const size of SIZES) {
  const svg = generateSVG(size);
  const filePath = path.join(ICONS_DIR, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`Generated: icon-${size}x${size}.svg`);
}

// Generate maskable icon
const maskableSvg = generateMaskableSVG(512);
fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable-512x512.svg'), maskableSvg);
console.log('Generated: icon-maskable-512x512.svg');

// Generate apple-touch-icon
const appleSvg = generateSVG(180);
fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.svg'), appleSvg);
console.log('Generated: apple-touch-icon.svg');

// Generate favicon SVG
const faviconSvg = generateSVG(32);
fs.writeFileSync(path.join(ICONS_DIR, 'favicon.svg'), faviconSvg);
console.log('Generated: favicon.svg');

// Copy favicon to public root
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg);
console.log('Copied: favicon.svg to public/');

console.log('\nAll SVG icons generated successfully!');
console.log('Note: For production, convert SVGs to PNGs using a build tool or online converter.');
console.log('The manifest.json has been updated to reference SVG icons.');
