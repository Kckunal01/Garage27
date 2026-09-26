# Garage 27 — notes for coding agents

- Next.js **16** (App Router, React 19): async `params`/`searchParams`, `proxy` not `middleware`, `PageProps<'/route'>` types via `next typegen`. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- Before pushing: `npm run typecheck && npm run lint && npm test && npm run build`.
- Never hardcode bikes/options/prices in components — extend the catalogue data (see docs/ADDING_A_BIKE.md). Pages must not branch on specific bike ids.
- All nav surfaces read `PRIMARY_NAV`; don't add per-page navigation.
- Money is integer paise. Build values are "ESTIMATED BUILD VALUE"; the server recalculates every price.
- Service-role Supabase and payment secrets are server-only (`server-only` import). Never `NEXT_PUBLIC_` a secret.
- `.bay-enter` must not use a filling transform animation (it breaks `position: fixed` children).
