# Product

## Register

product

## Users

Internal staff at Bruno Vehicle Hire (rental agents / back-office admins) running day-to-day fleet operations: registering vehicles, managing customer records, and creating/managing bookings. Used at a desk, during a work shift, likely alongside other tools — needs to be fast to scan and act on, not just fun to look at.

## Product Purpose

A vehicle hire management console covering three linked workflows — Vehicles, Customers, Bookings — with filterable/paginated lists, validated create/edit forms, and clear feedback on business-rule conflicts (double-booked vehicles, customers with existing bookings, invalid date ranges). Success is an agent completing a booking or fixing a conflict in seconds, not staring at a table trying to parse it.

## Brand Personality

Nostalgic, Bold, Dependable

A retro American diner-meets-Mustang world: chrome trim, diner-booth red, checkerboard accents, pony-badge and racing-stripe details. It should feel like a classic roadside diner counter and a showroom Mustang — confident, warm, a little theatrical — while still reading immediately as a serious tool an agent trusts with real bookings.

## Anti-references

- Neon-tube signage/glow effects — explicitly excluded; this is a daylight-diner-chrome world, not a neon-arcade-at-night one.
- Kitschy clutter — random 50s/90s ephemera thrown at the screen (novelty fonts everywhere, clip-art diners) instead of a few well-chosen, consistently-applied motifs.
- Anything that reads as a mood board before it reads as a working admin tool — tables, forms, and status must stay instantly scannable underneath the theme.
- Low-contrast combinations in service of "vibe" (pastel-on-pastel, chrome-gray text on cream) — bold color choices still have to pass real contrast checks.

## Design Principles

1. **Bold theme, disciplined function** — full retro immersion never costs scanability; an agent must find and act on a row of data as fast as in any plain admin UI.
2. **One committed retro world** — chrome, diner-booth red, checkerboard, and pony-badge/racing-stripe motifs are one coherent aesthetic, applied consistently, not a grab-bag of unrelated retro references.
3. **Motifs decorate structure, they don't replace it** — checkerboard/chrome/badge details dress up a table, a status badge, a nav bar that's already information-correct; they never substitute for actual hierarchy or become the content.
4. **Contrast before nostalgia** — every text/background pairing is checked for real contrast, even inside a loud, saturated palette.
5. **Color carries meaning too, not just mood** — status (Active/Completed/Cancelled, available/unavailable) is never conveyed by color alone; labels and icons carry the same information.

## Accessibility & Inclusion

- Body text ≥4.5:1 contrast against its background; large/bold text ≥3:1 — verified per surface even at full color saturation.
- No color-only status indicators (badges/labels always carry text, not just a hue).
- Respect `prefers-reduced-motion` for any motion/animation added as part of the theme (chrome shine sweeps, etc. get a static/instant fallback).
- Single committed light theme (diner-daylight, not neon-night) — no dark-mode variant required.
