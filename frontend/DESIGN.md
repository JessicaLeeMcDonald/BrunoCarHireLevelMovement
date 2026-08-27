# Design

## Theme

Retro American diner meets classic Ford Mustang — a daylight showroom-counter world, not a neon-arcade-at-night one. Cherry-vinyl booth red, brushed-chrome trim, black-and-white checker-flag accents, and racing-stripe dividers dress up an otherwise dense, fast-scanning admin tool. Full immersion (color/material carries most surfaces), but every text/background pairing keeps real contrast, and status is always labeled, never color-only.

## Color

Tokens live in `src/index.css` under `:root`.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#fff7ec` | Page background (Formica-counter cream) |
| `--color-surface` | `#fffdf8` | Card/panel/table/form/modal background |
| `--color-border` | `#c9cdd3` | Hairline borders (steel-gray) |
| `--color-text` | `#2a1810` | Body ink (warm near-black) — ~16:1 on `--color-bg` |
| `--color-text-muted` | `#6b5645` | Secondary text (warm cocoa) — ~6.5:1 on `--color-bg` |
| `--color-primary` / `--color-danger` | `#a31621` | Diner-booth cherry red — primary actions, brand, "stop/cancel" semantics share one hue deliberately |
| `--color-primary-hover` / `--color-danger-hover` | `#7f0f19` | Darker cherry for hover/pressed |
| `--color-success` (badge: Active) | `#0b6971` | Diner-counter turquoise — ~6.4:1 on white |
| `--color-completed` (badge: Completed) | `#6b5b0e` | Mustard-olive — ~6.7:1 on white |
| `--color-cancelled` (badge: Cancelled) | `#7f0f19` | Deep cherry, distinct shade from the primary-action red |
| `--color-navy` | `#16233d` | Racing-stripe third band, focus rings |
| `--chrome-1..4` | `#f4f5f7 → #9aa1ab` | Brushed-steel gradient family for bevelled trim/borders |
| `--checker-dark` / `--checker-light` | `#171310` / `#fffdf8` | Checker-flag strip (`--checker-strip` conic gradient) |

All body-text pairings were hand-verified against WCAG contrast math (≥4.5:1 for normal text); badges and buttons use white/cream text on saturated-but-dark hues, which clears contrast easily. Status badges are solid-color + text label, never color alone.

## Typography

Two families on a deliberate contrast axis, per the product register's "display fonts only for the few big moments" rule:

- **`--font-display` (Alfa Slab One, loaded via Google Fonts in `index.html`)** — used *only* for the brand wordmark and page-title `<h1>`/modal `<h2>` headings. Never on buttons, badges, table data, or form labels.
- **`--font-sans` (system UI stack)** — everything else: nav, buttons, table, forms, toasts. Keeps data-dense screens legible and avoids the product-register ban on display fonts in UI labels/data.

## Motifs

- **Racing stripe** — a 3-band `::before` bar (navy / cherry / chrome) across the very top of the header.
- **Checker-flag strip** — a thin `::after` conic-gradient strip beneath the header nav.
- **Chrome trim** — a two-layer background (`padding-box` fill + `border-box` gradient) gives cards, tables, forms, and filter bars a bevelled metal edge instead of a flat border.
- **Chrome bevel** — `--shadow-bevel` / `--shadow-bevel-chrome` inset highlights on buttons and the active nav pill simulate a pressed-metal edge.
- **Pony badge** — `shared/components/PonyBadge.tsx`, an original stylized horse-head silhouette (not a reproduction of any trademarked logo) in a chrome-rimmed circular badge next to the brand wordmark.

## Components

Class names are unchanged from the pre-theme system (`.btn`, `.table`, `.form`, `.modal`, `.toast`, `.badge`, …) — this was a re-skin of the existing component vocabulary, not a rebuild. Every interactive state (hover, focus-visible, disabled) is themed; disabled buttons drop the chrome bevel and desaturate via opacity rather than staying full-saturation, per the product register's ban on heavy color on inactive states.

## Known limitation

This session has no browser/screenshot access, so the theme was built and verified via `npm run build`/`npm run lint` (clean), a design-detector pass (no deterministic issues found), a dev-server boot check, and manual WCAG contrast math for every color pairing above — not an actual visual/browser QA pass. Give it a look in a real browser and flag anything that reads off (the hand-authored pony-badge SVG path in particular is the one piece I couldn't eyeball).
