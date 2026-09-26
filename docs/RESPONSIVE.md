# Responsive system

Garage 27 has **two compositions**, not one layout that scales.

| Tier | Query | Composition |
| --- | --- | --- |
| `--mobile` | `< 768px` | Vertical cinematic stack. Touch-first. Portrait image crops. |
| `--desktop` | `≥ 768px` | Wide cinematic canvas. Horizontal zones. Landscape crops. Tablets use this. |
| `--wide` | `≥ 1200px` | Refinements for big canvases (extra columns, 3-panel tools, wider column `--max: 1560px`). Never a different design. |

Defined once in `src/styles/breakpoints.css` (PostCSS custom media, see `postcss.config.mjs`) and mirrored in `src/lib/breakpoints.ts`. Always write `@media (--desktop) { … }`. **A raw px breakpoint fails `npm test`** (`src/styles/architecture.test.ts`).

## Global shell (root layout — pages never render these)

```
<SiteHeader>   brand mark (left) · cart + GarageRack (right) — utility only, no navigation
<main>         page: environment + content, each with its own mobile & desktop composition
<SiteFooter>   hidden on immersive routes (/)
<GarageNav>    THE navigation: floating pill, bottom-centred, every route, every width
```

`GarageNav` has no variants and no breakpoint may hide or move it; the tests enforce that it is rendered only by `app/layout.tsx` and is the only `aria-label="Primary"` landmark. `--bottom-clearance` (nav height + offset + gap) is reserved at the bottom of every page at every width; full-height tools (the build bay) subtract it.

## Environments

- `EnvironmentalHero` — mobile: sign on the wall above the copy. Desktop: two zones — copy owns the left (`--zone-split: 56%`), the wall (sign, lamp, detail) owns the right. Heroes without a sign keep the full canvas for copy.
- Photography gets **per-tier `object-position`**, never "cover and hope". A portrait photo that can't make a good wide crop is shown whole (Home desktop) or used as out-of-focus texture (404) — never stretched.
- Home (`/`) — measured composition from `docs/design-references/home/`; see `src/styles/home.css`.
- 404 — the same garage, blurred with the lights down. Mobile: numeral high, copy stack low. Desktop: numeral left zone, copy right zone; `--wide` spans the canvas.

## Adding a page

1. Render content only — never a nav, never a header.
2. Start mobile-first; add `@media (--desktop)` for the wide composition (zones, columns, crop), `(--wide)` only for refinements.
3. If it has a full-height region, size it `calc(100svh - var(--header-h) - var(--bottom-clearance))`.
4. Check at 390×844, 393×852, 1440×900, 1920×1080: nav identical, no overflow, no dead half-canvas.
