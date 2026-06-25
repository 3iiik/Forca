# Versioning

The Forca ecosystem uses a single source of truth for versioning.

## Source of Truth

**`package.json`** at the repository root is the canonical version source.

All other version definitions derive from it via build scripts or runtime imports.

## Synchronization Flow

```
package.json  ──┬── scripts/version.js       (ESM export: version, tag)
                ├── scripts/inject-version.js  (extension manifests)
                ├── website/ (Astro import)    (footer, download fallback)
                ├── Electron app.getVersion()  (at runtime via electron-builder)
                └── scripts/check-versions.js  (build-time validation)
```

### Extension Manifests

`scripts/inject-version.js` reads the version from `git describe --tags` or falls back to `package.json`, then writes it into both `chrome-release/manifest.json` and `firefox-release/manifest.json`.

### Website

`website/src/layouts/BaseLayout.astro` imports `package.json` directly and displays `v{pkg.version}` in the footer.

`website/src/components/DownloadPage.tsx` receives a `fallbackVersion` prop from the Astro page (sourced from `package.json`) and uses it when the GitHub API is unavailable.

### Desktop App

The Electron app reads its version at runtime via `app.getVersion()`, which electron-builder injects from `package.json` at build time. No manual synchronization is needed.

## Release Process

1. Update the version in `package.json`:
   ```bash
   npm version patch|minor|major
   ```

2. Run the consistency check:
   ```bash
   node scripts/check-versions.js
   ```

3. Build extension manifests:
   ```bash
   node scripts/inject-version.js
   ```

4. Commit and tag:
   ```bash
   git add -A
   git commit -m "v<VERSION>"
   git tag v<VERSION>
   git push && git push origin v<VERSION>
   ```

5. The GitHub Release automatically triggers:
   - Website deployment (`deploy-website.yml`)
   - Discord announcement (`discord-release.yml`)

## Build Validation

The `scripts/check-versions.js` script runs during CI to verify that:
- `package.json` version
- Extension manifest versions
- Website `package.json` version (if present)

all match. The build fails if any differ.

Run locally: `node scripts/check-versions.js`
