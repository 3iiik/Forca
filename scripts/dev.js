/* Development helper script */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function main() {
  console.log('🔧 Forca Development Setup\n');

  // Check if node_modules exists
  if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  }

  // Create placeholder assets if they don't exist
  const assetsDir = path.join(__dirname, '..', 'assets');
  const iconsDir = path.join(assetsDir, 'icons');
  const soundsDir = path.join(assetsDir, 'sounds');

  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(soundsDir, { recursive: true });

  // Generate a simple 16x16 PNG icon
  const iconPath = path.join(iconsDir, 'icon.png');
  if (!fs.existsSync(iconPath)) {
    console.log('🖼  Creating placeholder icon...');
    // Simple 16x16 PNG (minimal valid PNG)
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, // 16x16
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x48, 0x83, // 8-bit RGB
      0x78, 0x00, 0x00, 0x00, 0x06, 0x62, 0x4B, 0x47, // ...
      0x44, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0xA0, 0xBD,
      0xA7, 0x93, 0x00, 0x00, 0x00, 0x09, 0x70, 0x48,
      0x59, 0x73, 0x00, 0x00, 0x0B, 0x13, 0x00, 0x00,
      0x0B, 0x13, 0x01, 0x00, 0x9A, 0x9C, 0x18, 0x00,
      0x00, 0x00, 0x17, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82,
    ]);
    fs.writeFileSync(iconPath, png);
    // Copy as green/gray/yellow variants
    fs.copyFileSync(iconPath, path.join(iconsDir, 'icon-green.png'));
    fs.copyFileSync(iconPath, path.join(iconsDir, 'icon-gray.png'));
    fs.copyFileSync(iconPath, path.join(iconsDir, 'icon-yellow.png'));
  }

  // Create placeholder sound files in public/sounds (served by Vite)
  const publicSoundsDir = path.join(__dirname, '..', 'public', 'sounds');
  fs.mkdirSync(publicSoundsDir, { recursive: true });
  const sounds = ['rain', 'white-noise', 'lofi', 'forest'];
  for (const sound of sounds) {
    const soundPath = path.join(publicSoundsDir, `${sound}.mp3`);
    if (!fs.existsSync(soundPath)) {
      console.log(`🎵 Creating placeholder ${sound}.mp3...`);
      const mp3Frame = Buffer.alloc(417, 0xFF);
      mp3Frame[1] = 0xFB;
      fs.writeFileSync(soundPath, mp3Frame);
    }
  }

  console.log('\n✅ Setup complete!');
  console.log('\nRun: npm run dev        (start development)');
  console.log('Run: npm run build      (build for production)');
  console.log('Run: npm start          (start built app)\n');
}

main();
