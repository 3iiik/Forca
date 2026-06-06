import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, '..', 'assets', 'icons');

const SIZE = 512;
const COLORS = {
  primary: [99, 102, 241],   // indigo-500
  secondary: [139, 92, 246],  // violet-500
  accent: [168, 85, 247],     // purple-500
  white: [255, 255, 255],
};

async function generatePng(size) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgb(${COLORS.primary.join(',')})" />
        <stop offset="100%" stop-color="rgb(${COLORS.secondary.join(',')})" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.1}" ry="${size * 0.1}" fill="url(#bg)" />
    <circle cx="${cx}" cy="${cy}" r="${radius}" fill="rgba(255,255,255,0.15)" />
    <circle cx="${cx}" cy="${cy}" r="${radius * 0.7}" fill="rgba(255,255,255,0.1)" />
    <text x="${cx}" y="${cy + size * 0.12}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
          font-size="${size * 0.5}px" font-weight="bold" fill="white">F</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function generateVariant(color, outputName) {
  const size = 16;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const [cr, cg, cb] = color;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgb(${cr},${cg},${cb})" />
  </svg>`;

  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  await fs.writeFile(path.join(iconsDir, outputName), buf);
  console.log(`  ✓ ${outputName}`);
}

async function main() {
  console.log('Generating Forca icons...\n');

  await fs.mkdir(iconsDir, { recursive: true });

  // 1. Generate 512x512 main icon
  console.log('Main icon (512x512):');
  const png512 = await generatePng(512);
  await fs.writeFile(path.join(iconsDir, 'icon.png'), png512);
  console.log('  ✓ icon.png');

  // 2. Generate .ico (Windows) - uses the PNG buffer directly
  console.log('\nWindows icon:');
  const icoBuf = await pngToIco(png512);
  await fs.writeFile(path.join(iconsDir, 'icon.ico'), icoBuf);
  console.log('  ✓ icon.ico');

  // 3. Generate .icns (macOS) - create a minimal valid icns from the PNG
  // A simple approach: embed the PNG into the icns container.
  // The icns format supports 'ic07' (128x128) and 'ic08' (256x256) entries as PNG data.
  console.log('\nmacOS icon:');
  const resized128 = await sharp(png512).resize(128).png().toBuffer();
  const resized256 = await sharp(png512).resize(256).png().toBuffer();
  const resized512 = png512;

  function makeIcns(entries) {
    let totalSize = 8; // header: magic + size
    const chunks = [];
    for (const [type, data] of entries) {
      const entrySize = 8 + data.length;
      chunks.push(Buffer.concat([
        Buffer.from(type, 'ascii'),
        Buffer.alloc(4),
        Buffer.from(data),
      ]));
      // Fix size in the 4 bytes after type
      chunks[chunks.length - 1].writeUInt32BE(entrySize, 4);
      totalSize += entrySize;
    }
    const header = Buffer.alloc(8);
    header.write('icns', 0, 'ascii');
    header.writeUInt32BE(totalSize, 4);
    return Buffer.concat([header, ...chunks]);
  }

  const icnsBuf = makeIcns([
    ['ic07', resized128],
    ['ic08', resized256],
    ['ic09', resized512],
  ]);
  await fs.writeFile(path.join(iconsDir, 'icon.icns'), icnsBuf);
  console.log('  ✓ icon.icns');

  // 4. Generate tray variant icons (16x16)
  console.log('\nTray icons (16x16):');
  await generateVariant([107, 114, 128], 'icon-gray.png');
  await generateVariant([34, 197, 94], 'icon-green.png');
  await generateVariant([234, 179, 8], 'icon-yellow.png');

  // Summary
  console.log('\nDone! Generated files:');
  for (const file of await fs.readdir(iconsDir)) {
    const stat = await fs.stat(path.join(iconsDir, file));
    console.log(`  ${file.padEnd(20)} ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

main().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
