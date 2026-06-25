import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const expected = pkg.version;

let allMatch = true;

function check(label, filePath, actual) {
  if (actual === expected) {
    console.log(`  ✓ ${label}: ${actual}`);
  } else {
    console.error(`  ✗ ${label}: expected ${expected}, got ${actual}`);
    allMatch = false;
  }
}

console.log(`\nVersion consistency check (expected: v${expected}):\n`);

// package.json (self)
check('package.json', 'package.json', expected);

// Extension manifests
for (const dir of ['chrome-release', 'firefox-release']) {
  const mPath = `browser-extension/${dir}/manifest.json`;
  const fullPath = resolve(root, mPath);
  if (existsSync(fullPath)) {
    const m = JSON.parse(readFileSync(fullPath, 'utf-8'));
    check(`Extension (${dir})`, mPath, m.version);
  }
}



console.log(allMatch ? '\n✓ All versions match.\n' : '\n✗ Version mismatch detected.\n');
process.exit(allMatch ? 0 : 1);
