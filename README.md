# Garage 27

Cinematic motorcycle customisation platform — a digital garage, not a SaaS site.

Three business outcomes, all working end-to-end:

| Outcome | Flow | Entry |
| --- | --- | --- |
| **Buy a part** | Parts → bike filter → category → product → cart → checkout → gateway → server-verified confirmation | `/parts` |
| **Build a bike** | Build → bike → colour → 3D editor → category → option → live estimate → review → custom quote | `/build` |
| **Request a service** | Service → service → need → reference photos + contact → notes → confirmation | `/service` |

Stack: **Next.js 16** (App Router, React 19) · **three.js / React Three Fiber** · **Supabase** (data, storage) · **Vercel** (hosting, route handlers) · **Cloudflare** (DNS, WAF, rate limiting) · **Razorpay** via a provider abstraction · vendor-neutral analytics.

## Run it

```bash
npm install
cp .env.example .env.local   # works with everything blank: local catalogue + in-memory store + mock gateway
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Unit tests: build engine, pricing, payments/settlement, validation, analytics scrub, catalogue QA |
| `npm run catalogue:check` | Catalogue integrity gate (run before activating any catalogue change) |
| `npm run typecheck` / `lint` | TypeScript / ESLint |
| `npm run db:seed:sql` | Regenerates `supabase/seed.sql` from the typed catalogue |

Without Supabase keys the site runs on the **local seed catalogue** (a small "PREVIEW CATALOGUE" note appears on Parts and Build) and an **in-memory store** in development. Production refuses to take orders/quotes without Supabase rather than silently dropping them (see `ALLOW_MEMORY_STORE` in docs for throwaway previews).

## Where things live

```text
src/
  app/                    routes + route handlers (api/quotes, api/checkout, api/payments/*, …)
  components/
    navigation/           GarageNav (the ONE nav: pill + bar), GarageRack, SiteHeader/Footer
    garage-ui/            GarageButton, PriceDisplay, CategoryTile, States, Toast, …
    forms/                FormField, UploadReference
    media/                EnvironmentalHero, BikeSilhouette, PartVisual, CategoryGlyph
  features/
    build/                engine.ts (pure config engine) · useBuildState · BuildBay · viewport/ (3D)
    parts/ checkout/ service/ quotes/ garage/
  lib/
    catalogue/            repository: Supabase → local seed fallback
    payments/             PaymentProvider interface · razorpay · mock
    analytics/            track() + adapters, PII scrub
    pricing/ validation/ storage/ supabase/ server/
  data/catalogue/         typed seed catalogue (bikes, colours, options, parts, showcase, services)
  styles/                 tokens · base · chrome · environment · ui · pages · build
supabase/                 migrations (schema + RLS + storage bucket) · seed.sql (generated)
docs/                     architecture, infrastructure, adding a bike, analytics, assets
```

Read next: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) · [`docs/INFRASTRUCTURE.md`](docs/INFRASTRUCTURE.md) · [`docs/ADDING_A_BIKE.md`](docs/ADDING_A_BIKE.md) · [`docs/ANALYTICS.md`](docs/ANALYTICS.md) · [`public/assets/README.md`](public/assets/README.md)

## Status & open items

- **Visualiser vertical slice is proven** with one bike (Classic 350): colour system, all seven categories, requires/excludes rules, live estimate, review, quote with a server-side price snapshot. Two further bikes demonstrate the *preview + quote* and *coming soon* states.
- **Catalogue, prices, contact details are placeholders** pending Garage 27 approval. Everything is data — replace it in Supabase (or `src/data/catalogue` + `npm run db:seed:sql`).
- **Photography/video/logo are not yet delivered.** Pages render procedural environments and SVG bikes, and automatically switch to real media when files land at the paths in `public/assets/README.md`.
- **3D uses a procedural rig** (`rig-roadster-v1`) until production GLBs exist. The GLB path (Draco, per-slot nodes) is implemented and selected purely by data.
