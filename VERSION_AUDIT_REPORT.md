# Versioning Audit Report

**Date:** 2026-06-25  
**Commit:** 61776d9  
**App Version:** 2.1.2

## Summary

Every version display in the Forca ecosystem now derives from `package.json` or a synchronized build source. Zero hardcoded app versions remain in active code.

---

## Version Sources

| Source | Value | Mechanism | Dynamic? |
|--------|-------|-----------|----------|
| `package.json` (root) | 2.1.2 | Canonical source of truth | Yes — single authority |
| `scripts/version.js` | exports `version`, `tag` | ESM import from `package.json` | Yes |
| `scripts/inject-version.js` | reads git tag → `package.json` fallback | Writes to extension manifests at build | Yes |
| `scripts/check-versions.js` | validates `package.json` ↔ manifests | Exit code 1 on mismatch | Yes |
| `website/astro.config.mjs` | — | No version references | — |

## Website

| Location | File | How it gets version | Status |
|----------|------|-------------------|--------|
| Footer | `BaseLayout.astro:329` | `pkg.version` via ESM import | ✅ Dynamic |
| Download page | `DownloadPage.tsx:141` | GitHub API release tag, falls back to `fallbackVersion` prop | ✅ Dynamic |
| Fallback prop | `download/index.astro:9` | `pkg.version` from root `package.json` | ✅ Dynamic |
| Fallback default | `DownloadPage.tsx:116` | Removed — `fallbackVersion` is now required prop | ✅ Clean |

## Desktop App

| Location | File | How it gets version | Status |
|----------|------|-------------------|--------|
| Sidebar | `Sidebar.tsx:21,113` | `app.getVersion()` via IPC | ✅ Dynamic |
| Update notification | `main.ts:206` | `electron-updater` `UpdateInfo.version` | ✅ Dynamic |
| Update service | `updater.service.ts:17,44` | `electron-updater` `info.version` | ✅ Dynamic |
| IPC handler | `app.ipc.ts:16-17` | `app.getVersion()` | ✅ Dynamic |

No hardcoded app versions in `src/`.

## Browser Extension

| Location | File | How it gets version | Status |
|----------|------|-------------------|--------|
| Chrome manifest | `chrome-release/manifest.json:4` | Written by `inject-version.js` at build | ✅ Dynamic |
| Firefox manifest | `firefox-release/manifest.json:4` | Written by `inject-version.js` at build | ✅ Dynamic |
| popup HTML/JS | all popup files | No version references | ✅ Clean |
| blocked page | all blocked files | No version references | ✅ Clean |
| settings page | all settings files | No version references | ✅ Clean |
| onboarding | all onboarding files | No version references | ✅ Clean |

## GitHub

| Location | File | How it gets version | Status |
|----------|------|-------------------|--------|
| Release tag | `.github/workflows/release.yml` | Uses `github.ref_name` (git tag) | ✅ Dynamic |
| Release title | `.github/workflows/discord-release.yml:46` | Reads from `github.event.release.tag_name` | ✅ Dynamic |
| Release notes | `.github/workflows/discord-release.yml` | Reads from `github.event.release.body` | ✅ Dynamic |
| Workflow example | `discord-release.yml:9` | `'v2.1.1-test'` — example text, not logic | ✅ Cosmetic only |

## Discord

| Location | File | How it gets version | Status |
|----------|------|-------------------|--------|
| Webhook embed title | `discord-release.yml:32` | `${{ github.event.release.tag_name }}` | ✅ Dynamic |
| Webhook embed description | `discord-release.yml:33` | `${{ github.event.release.body }}` | ✅ Dynamic |
| Webhook embed URL | `discord-release.yml:36` | References `github.event.release.html_url` | ✅ Dynamic |

## Files Changed in This Audit

| File | Change |
|------|--------|
| `website/src/components/DownloadPage.tsx:116` | Made `fallbackVersion` prop required (removed stale `'2.0.0'` default) |

## Exempt (Not App Versions)

- `CHANGELOG.md` — historical entries (v1.0.0, v1.0.2, v1.1.0)
- `.github/ISSUE_TEMPLATE/bug_report.md` — template example text
- `SECURITY.md` — supported version policy
- `FORCA_AGENT.md` — local dev log (gitignored)
- `assets/entitlements.mac.plist` — XML/Plist format versions
- `website/package.json` — website project package version (1.0.0, independent of app)
- `.eslintrc.json` — `"version": "detect"` ESLint setting
- `.github/workflows/*.yml` — `actions/checkout@v4` etc. (GitHub Actions pinning)
- `src/main/services/calendar.service.ts` — Google Calendar API version `'v3'`

## Technical Debt

- **`website/package.json` version 1.0.0** — not synced with the app version (intentionally independent; the website is not the app)
- **Extension manifests checked into source** contain the current version (`2.1.2`) but are overwritten by `inject-version.js` during release builds. They serve as a fallback for dev usage.

## Conclusion

All app version displays and definitions are dynamic. No manual version updates are required after bumping `package.json`. The build validation script (`scripts/check-versions.js`) ensures consistency across all surfaces.
