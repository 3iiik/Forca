# Release Automation System Upgrade

**Date:** 2026-06-25

---

## Overview

Complete overhaul of the Discord release announcement system. Transformed from a bare CI/CD log dump into a professional product release post generator with automatic changelog categorization.

---

## Files Created / Modified

| File | Status | Purpose |
|------|--------|---------|
| `scripts/generate-changelog.mjs` | **Created** | Analyzes git log, classifies commits into categories |
| `scripts/discord-embed.mjs` | **Created** | Builds Discord embed payload with branded format |
| `.github/workflows/discord-release.yml` | **Modified** | Uses new scripts for automated announcement |
| `package.json` | **Modified** | Added `changelog` and `discord-embed` npm scripts |

---

## Deliverables

### 1. Improved Discord Embed Template ✅

**Before:**
```
@here **Forca v2.2.0** has been released!
- Version: v2.2.0
- What's New: (raw release body)
- Downloads: (raw asset list)
- GitHub Release: (url)
```

**After:**
```
🚀 **Forca v2.2.0 is now available**

[Embed: Forca v2.2.0 | #1D9E75]
  Thumbnail: Forca logo
  Version: v2.2.0 (inline)
  Downloads: Setup · Portable (formatted links)
  ✨ Highlights: (categorized features/fixes/perf)
  Footer: Built for focused work.
  Timestamp: release date
```

### 2. Automatic Changelog Categorization ✅

Commit prefixes are automatically classified:

| Prefix | Category | Emoji |
|--------|----------|-------|
| `feat:` / `feature:` | New Features | ✨ |
| `fix:` / `bug:` / `hotfix:` | Fixes | 🛠 |
| `perf:` / `optimize:` / `speed:` | Performance Improvements | ⚡ |
| `ui:` / `ux:` / `style:` / `design:` | UI | 🎨 |
| `chore:` / `refactor:` / `ci:` / `build:` / `test:` / `docs:` | Infrastructure | 🔧 |

Unclassified commits default to "New Features" and are still humanized.

### 3. Automatic Feature Extraction ✅

Each commit message goes through a humanization pipeline:
- Strips conventional commit prefixes (`feat:`, `fix:`, etc.)
- Converts verbs to past tense (`add` → `Added`, `fix` → `Fixed`)
- Capitalizes first letter
- Appends period

### 4. Automatic Release Summary Generation ✅

The summary groups up to 3 items per category with a "+N more" overflow indicator. If no git commit data is available, the release body text is used as a fallback.

### 5. Backward Compatibility ✅

- Retains `workflow_dispatch` trigger for testing
- Retains all environment variables and secrets
- Falls back gracefully when git tags or assets are unavailable
- Existing release body text is preserved as fallback content

---

## Mention Logic

| Release Type | Example | Mention |
|-------------|---------|---------|
| Patch | v2.2.1 | No mention |
| Minor | v2.3.0 | `@here` |
| Major | v3.0.0 | `@everyone` |

---

## Scripts

### `scripts/generate-changelog.mjs`

```bash
# Generate changelog between tags
node scripts/generate-changelog.mjs --from v2.2.0 --to v2.2.1

# Auto-detect from latest tags
node scripts/generate-changelog.mjs

# Via npm
npm run changelog
```

Outputs JSON with categorized commits, commit count, and raw data.

### `scripts/discord-embed.mjs`

```bash
# Pipe release data as JSON
node scripts/discord-embed.mjs < input.json

# Via npm
npm run discord-embed < input.json
```

Input JSON structure:
```json
{
  "version": "v2.2.0",
  "releaseName": "Forca v2.2.0",
  "releaseUrl": "https://...",
  "releaseBody": "Release notes...",
  "changelog": { "categories": [...] },
  "downloads": [{ "name": "...", "url": "..." }],
  "timestamp": "2026-01-15T..."
}
```

Output: Discord-compatible webhook payload JSON.

---

## Workflow Changes

**`.github/workflows/discord-release.yml`:**

1. **Full git checkout** — Uses `fetch-depth: 0` to enable changelog generation
2. **Variable preparation** — Extracts release metadata into `steps.vars`
3. **Changelog generation** — Runs `generate-changelog.mjs` with previous tag detection
4. **Asset fetching** — Downloads asset list from GitHub API
5. **Embed building** — Merges all data, runs `discord-embed.mjs` to build payload
6. **Webhook delivery** — Posts payload to Discord
7. **Validation step** — On `workflow_dispatch`, previews the generated payload

---

## Embed Design

```
┌──────────────────────────────────────────┐
│ 🖼️ [Thumbnail]  Forca v2.2.0             │
│                                           │
│ ════════════════════════════════════════  │
│ Version: v2.2.0                          │
│                                           │
│ Downloads:                                │
│ Setup · Portable                          │
│                                           │
│ ✨ Highlights:                            │
│ **✨ New Features**                       │
│ • Added heartbeat mechanism               │
│ • Added automatic reconnection            │
│                                           │
│ **🛠 Fixes**                              │
│ • Fixed WebSocket reconnect loop          │
│                                           │
│ **⚡ Performance**                         │
│ • Reduced background resource usage       │
│                                           │
│ ─────────────────────────────────────      │
│ Built for focused work.            📅     │
└──────────────────────────────────────────┘
```

---

## Testing

```bash
# Test changelog generation
node scripts/generate-changelog.mjs

# Test embed generation
echo '{"version":"v2.2.0","releaseUrl":"https://github.com/3iiik/Forca/releases/tag/v2.2.0","changelog":{"categories":[]}}' | node scripts/discord-embed.mjs

# Test via workflow_dispatch
gh workflow run discord-release.yml -f test_version=v2.2.1 -f test_body="Test announcement"
```
