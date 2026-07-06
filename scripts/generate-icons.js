const fs = require('fs');
const path = require('path');

const iconContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90B8"/>
      <stop offset="100%" style="stop-color:#5BA8D6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#grad)"/>
  <g transform="translate(256, 256)">
    <path d="M-80,-60 L-40,-60 L-40,-100 L40,-100 L40,-60 L80,-60 L80,60 L40,60 L40,100 L-40,100 L-40,60 L-80,60 Z" fill="white" opacity="0.9"/>
    <path d="M-20,-80 L-20,80" stroke="rgba(75,144,184,0.5)" stroke-width="12" stroke-linecap="round"/>
    <path d="M20,-80 L20,80" stroke="rgba(75,144,184,0.5)" stroke-width="12" stroke-linecap="round"/>
  </g>
</svg>
`;

const publicDir = path.join(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconContent);

console.log('✅ SVG icon generated');

const sharp = require('sharp');

async function generateIcons() {
  const svgPath = path.join(publicDir, 'icon.svg');
  
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));
  console.log('✅ icon-192x192.png generated');
  
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));
  console.log('✅ icon-512x512.png generated');
  
  await sharp(svgPath)
    .resize(512, 512)
    .extend({
      top: 128,
      bottom: 128,
      left: 128,
      right: 128,
      background: { r: 68, g: 144, b: 184 }
    })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512x512.png'));
  console.log('✅ icon-maskable-512x512.png generated');
  
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png generated');
  
  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
