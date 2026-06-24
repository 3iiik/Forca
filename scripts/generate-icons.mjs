import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, '..', 'assets', 'icons');
const brandingDir = path.resolve(__dirname, '..', 'assets', 'branding');
const websitePublicDir = path.resolve(__dirname, '..', 'website', 'public');
const browserExtensionIconsDir = path.resolve(__dirname, '..', 'browser-extension', 'icons');
const chromeReleaseIconsDir = path.resolve(__dirname, '..', 'browser-extension', 'chrome-release', 'icons');
const firefoxReleaseIconsDir = path.resolve(__dirname, '..', 'browser-extension', 'firefox-release', 'icons');

async function readCanonicalSvg(name) {
  const svgPath = path.join(brandingDir, name);
  const content = await fs.readFile(svgPath, 'utf-8');
  return content;
}

async function main() {
  console.log('Generating Forca icons...\n');

  await fs.mkdir(iconsDir, { recursive: true });
  await fs.mkdir(websitePublicDir, { recursive: true });
  await fs.mkdir(browserExtensionIconsDir, { recursive: true });
  await fs.mkdir(chromeReleaseIconsDir, { recursive: true });
  await fs.mkdir(firefoxReleaseIconsDir, { recursive: true });

  const appIconSvg = await readCanonicalSvg('forca-app-icon.svg');
  const markSvg = await readCanonicalSvg('forca-mark.svg');

  // 1. Generate 512x512 PNG (app icon + website icon)
  console.log('Main icon:');
  const png512 = await sharp(Buffer.from(appIconSvg)).png().toBuffer();
  await fs.writeFile(path.join(iconsDir, 'icon.png'), png512);
  console.log('  ✓ assets/icons/icon.png');
  await fs.writeFile(path.join(websitePublicDir, 'icon.png'), png512);
  console.log('  ✓ website/public/icon.png');

  // 2. Generate .ico (Windows)
  console.log('\nWindows icon:');
  const icoBuf = await pngToIco(png512);
  await fs.writeFile(path.join(iconsDir, 'icon.ico'), icoBuf);
  console.log('  ✓ assets/icons/icon.ico');

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
  console.log('  ✓ assets/icons/icon.icns');

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
    console.log(`  ✓ assets/icons/icon-${name}.png`);
  }

  // 5. Generate browser extension icons (16, 48, 128)
  console.log('\nBrowser extension icons:');
  const sizes = [16, 48, 128];
  for (const size of sizes) {
    const buf = await sharp(Buffer.from(markSvg)).resize(size).png().toBuffer();
    for (const dir of [browserExtensionIconsDir, chromeReleaseIconsDir, firefoxReleaseIconsDir]) {
      await fs.writeFile(path.join(dir, `icon-${size}.png`), buf);
    }
    console.log(`  ✓ icon-${size}.png (all 3 extension dirs)`);
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
