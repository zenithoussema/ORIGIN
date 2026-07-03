const fs = require('fs');
const path = require('path');

async function generateScreenshots() {
  const colors = {
    espresso: '#1C0A00',
    caramel: '#C8882A',
    gold: '#d4af37',
    cream: '#F5ECD7'
  };

  const screenshots = [
    {
      width: 1920,
      height: 1080,
      filename: path.join(process.cwd(), 'public/screenshots/desktop.png'),
      title: 'ORIGIN Restaurant',
      subtitle: 'Premium Dining Experience'
    },
    {
      width: 390,
      height: 844,
      filename: path.join(process.cwd(), 'public/screenshots/mobile.png'),
      title: 'ORIGIN Mobile App',
      subtitle: 'Order & Reserve'
    }
  ];

  console.log('Generating PWA screenshots...');

  for (const screenshot of screenshots) {
    const svgContent = `
<svg width="${screenshot.width}" height="${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${screenshot.width > 1000 ? colors.espresso : colors.caramel}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${screenshot.width > 1000 ? colors.gold : colors.espresso}" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#gradient)"/>
  <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
         font-size="${screenshot.width > 1000 ? 48 : 32}" fill="${screenshot.width > 1000 ? colors.caramel : colors.espresso}" 
         font-weight="bold" text-anchor="middle" dominant-baseline="middle">
    ${screenshot.title}
  </text>
  <text x="50%" y="55%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
         font-size="${screenshot.width > 1000 ? 24 : 20}" fill="${screenshot.width > 1000 ? colors.cream : colors.espresso}" 
         text-anchor="middle" dominant-baseline="middle">
    ${screenshot.subtitle}
  </text>
</svg>`;

    try {
      const sharp = require('sharp');
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(screenshot.filename);
      console.log(`Created ${path.basename(screenshot.filename)}`);
    } catch (err) {
      console.error(`Failed to create ${path.basename(screenshot.filename)}: ${err.message}`);
    }
  }

  console.log('All screenshots generated successfully!');
}

generateScreenshots().catch(console.error);
