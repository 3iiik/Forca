import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, '..', 'assets', 'icons');

const SVG = `<svg width="512" height="512" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="22" fill="#1A1035"/>
  <circle cx="48" cy="48" r="26" fill="none" stroke="#3D2FA8" stroke-width="3.5"/>
  <circle cx="48" cy="48" r="26" fill="none" stroke="#1D9E75" stroke-width="3.5"
    stroke-dasharray="81 163" stroke-dashoffset="41" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="7" fill="#1D9E75"/>
  <rect x="46.5" y="18" width="3" height="11" rx="1.5" fill="#6B5FD4"/>
  <rect x="46.5" y="67" width="3" height="11" rx="1.5" fill="#6B5FD4"/>
  <rect x="18" y="46.5" width="11" height="3" rx="1.5" fill="#6B5FD4"/>
  <rect x="67" y="46.5" width="11" height="3" rx="1.5" fill="#6B5FD4"/>
</svg>`;

async function main() {
  console.log('Generating Forca icons...\n');

  await fs.mkdir(iconsDir, { recursive: true });

  // 1. Generate 512x512 PNG
  console.log('Main icon:');
  const png512 = await sharp(Buffer.from(SVG)).png().toBuffer();
  await fs.writeFile(path.join(iconsDir, 'icon.png'), png512);
  console.log('  ✓ icon.png');

  // 2. Generate .ico (Windows)
  console.log('\nWindows icon:');
  const icoBuf = await pngToIco(png512);
  await fs.writeFile(path.join(iconsDir, 'icon.ico'), icoBuf);
  console.log('  ✓ icon.ico');

  // 3. Generate .icns (macOS)
  console.log('\nmacOS icon:');
  const resized128 = await sharp(png512).resize(128).png().toBuffer();
  const resized256 = await sharp(png512).resize(256).png().toBuffer();
  const resized512 = png512;

  function makeIcns(entries) {
    let totalSize = 8;
    const chunks = [];
    for (const [type, data] of entries) {
      const entrySize = 8 + data.length;
      chunks.push(Buffer.concat([
        Buffer.from(type, 'ascii'),
        Buffer.alloc(4),
        Buffer.from(data),
      ]));
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

  function traySvg(color) {
    const size = 16;
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>
    </svg>`;
  }

  for (const [name, color] of [['gray', '#6b7280'], ['green', '#1D9E75'], ['yellow', '#eab308']]) {
    const buf = await sharp(Buffer.from(traySvg(color))).png().toBuffer();
    await fs.writeFile(path.join(iconsDir, `icon-${name}.png`), buf);
    console.log(`  ✓ icon-${name}.png`);
  }

  console.log('\nDone!');
  for (const file of await fs.readdir(iconsDir)) {
    const stat = await fs.stat(path.join(iconsDir, file));
    console.log(`  ${file.padEnd(20)} ${(stat.size / 1024).toFixed(1)} KB`);
  }
}

main().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
