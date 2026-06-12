const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

function getVersion() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim();
    return tag.replace(/^v/, '');
  } catch {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
    console.warn('[inject-version] no git tag found, keeping existing version:', pkg.version);
    return pkg.version;
  }
}

function updateJsonFile(filePath, version) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn('[inject-version] skipping (not found):', filePath);
    return;
  }
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  if (data.version === version) {
    console.log('[inject-version] already up-to-date:', filePath, version);
    return;
  }
  data.version = version;
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
  console.log('[inject-version] updated:', filePath, '->', version);
}

function main() {
  const version = getVersion();
  console.log('[inject-version] version:', version);
  updateJsonFile('package.json', version);
  updateJsonFile('browser-extension/chrome-release/manifest.json', version);
  updateJsonFile('browser-extension/firefox-release/manifest.json', version);
}

main();
