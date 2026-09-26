# Garage 27 — notes for coding agents

- Next.js **16** (App Router, React 19): async `params`/`searchParams`, `proxy` not `middleware`, `PageProps<'/route'>` types via `next typegen`. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- Before pushing: `npm run typecheck && npm run lint && npm test && npm run build`.
- Never hardcode bikes/options/prices in components — extend the catalogue data (see docs/ADDING_A_BIKE.md). Pages must not branch on specific bike ids.
- Navigation: ONE `GarageNav` (floating bottom pill), rendered only by `app/layout.tsx`, identical at every width. Never add a nav to a page or the header; never hide/move it per breakpoint. Guarded by `src/styles/architecture.test.ts`.
- Responsive: two compositions (mobile <768 / desktop ≥768, `--wide` ≥1200 refinements). Use `@media (--mobile|--desktop|--wide)` from `src/styles/breakpoints.css` — raw px breakpoints fail the tests. See docs/RESPONSIVE.md.
- Money is integer paise. Build values are "ESTIMATED BUILD VALUE"; the server recalculates every price.
- Service-role Supabase and payment secrets are server-only (`server-only` import). Never `NEXT_PUBLIC_` a secret.
- `.bay-enter` must not use a filling transform animation (it breaks `position: fixed` children).
