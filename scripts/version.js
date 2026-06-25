import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

export const version = pkg.version;
export const tag = `v${pkg.version}`;

export function getVersion() {
  return version;
}

export function getTag() {
  return tag;
}
