# Forca Extension UI Redesign Report

## Overview
Complete visual refresh of the browser extension to match the new Forca design language (desktop app + website branding).

## Files Changed (12)

### popup/popup.html (root + chrome-release + firefox-release)
- Replaced `<img src="../icons/icon-48.png">` logo with inline SVG of canonical `forca-mark.svg`
- Changed title from "Forca Blocker" to "Forca"
- Redesigned status cards with `.card` wrapper, `.card-dot`, `.card-body`, `.card-header-row`, `.card-pill` structure
- Added pill badge ("Active" / "Paused") in status cards
- Redesigned timer display with larger typography (26px)
- Replaced `.btn` / `.btn-secondary` with `.btn-primary` / `.btn-outline`
- Replaced `.btn-text` with `.btn-ghost` in footer
- Better spacing and hierarchy throughout

### popup/popup.css (all 3 copies — unified)
- Expanded from 107 to 196 lines
- Width increased from 320px → 340px
- Premium `.card` design: 12px border-radius, better padding, subtle backgrounds
- `.card-pill` pill badge for active/paused status
- Larger `.timer-display`: 26px bold, tabular-nums
- `.btn-primary`: filled green (#1D9E75), 8px radius, hover + active states
- `.btn-outline`: transparent with border, hover state
- `.btn-ghost`: minimal style for footer
- Subtle hover/active transitions on all buttons
- Body padding 16px → 20px

### popup/popup.js (all 3 copies — minor update)
- Changed `actionsContainer.style.display` from `'block'` to `'flex'` for flex-column layout

### blocked/blocked.html (root + chrome-release + firefox-release — unified)
- Unified root and release versions into single design
- Icon SVG size: 56×56 → 60×60
- "You're in Focus Mode" → "Focus Mode Active"
- Added `.timer-card` wrapper (16px radius, subtle background, border animation)
- Timer ring: 160px → 180px, stroke-width 8 → 7
- Timer text: 2.25rem → 2.75rem
- `.btn` / `.btn-secondary`: 8px → 10px border-radius
- Removed `<br/>` tags between buttons (CSS gap instead)
- `.btn-text` span removed; text directly in button
- `.footer` → `.status-bar` with centered layout and gap
- Subtle hover/active button animations

### blocked/blocked.js (all 3 copies — minor update)
- Changed subtitle text from "You're in Focus Mode" → "Focus Mode Active"
- Changed "Focus Zone — Paused" → "Focus Mode — Paused"
- Updated button innerHTML from `<span class="btn-text">` to `<span>`

## Assets Replaced
- Popup logo: `icon-48.png` → inline SVG of `assets/branding/forca-mark.svg`

## Colors Replaced
- None — the extension already used the correct color palette (#1D9E75 green, #1C1917 bg, #F1EFE8 text)

## Emojis Removed
- None — no emojis existed in the codebase

## Legacy Branding Removed
- No legacy branding files found (purple theme, old logos, etc.)

## Screenshots Generated
- Not applicable (no visual diff tooling in CI)

## Remaining UI Debt
- No build pipeline for extension (manual file copies between root/chrome-release/firefox-release)
- The `forca-firefox.zip` archive in repo root is a static snapshot — will need regeneration
- Icons are already regenerated from canonical `assets/branding/forca-mark.svg` via `scripts/generate-icons.mjs`
