# Architecture

## Principles

1. **Data decides, UI renders.** Bikes, colours, slots, options, prices, hotspots, compatibility and 3D assets are records. No page contains a bike-specific conditional.
2. **The browser estimates; the server decides.** Build prices, cart totals and payment status are recalculated/verified server-side. The client's numbers are for UX only.
3. **One navigation.** `PRIMARY_NAV` in `components/navigation/nav-config.ts` feeds the mobile pill, the desktop bar and the rack.
4. **Mobile and desktop are separate compositions of the same state.** The build bay is one reducer; CSS grid areas turn it into "viewport → chips → tray → dock" on phones and "rail | viewport | panel" on desktop.

## Build configuration engine (`src/features/build/engine.ts`)

Pure functions, shared by `useBuildState` (browser) and `POST /api/quotes` (server):

| Function | Role |
| --- | --- |
| `getBikeBundle` | bike + its colours + its options |
| `isInteractive` | active **and** has a model **and** has slots — only then does the 3D editor open |
| `createDefaultConfiguration` | default colour + each slot's `defaultOptionId` |
| `checkOption` | bike match → availability → slot exists → exclusions (both directions) → requirements → would it orphan a dependant? |
| `applyOption` | returns the *unchanged* config + reason when blocked — never silently overwrites |
| `validateConfiguration` / `sanitizeConfiguration` | validate and repair untrusted configs (drafts, share links, presets) |
| `estimateBuild` | base + colour delta + option deltas + bay labour per modified slot |
| `encodeConfiguration` / `decodeConfiguration` | share codes (`/build?c=…`) — no PII |

Configuration shape (stored with every quote, alongside a price snapshot):

```json
{ "bikeId": "bike-re-classic-350", "colourId": "col-classic-oxblood",
  "components": { "headlight": "opt-headlight-chrome-7", "handlebar": "opt-bar-stock", "…": "…" } }
```

## 3D (`src/features/build/viewport/`)

- `BuildViewport` — lazy-loads three.js only when a bike enters the bay; probes WebGL; error boundary; shows `BUILDING YOUR BIKE…` until the first frame; falls back to a static preview + quote CTA (`THIS BIKE IS STILL IN THE WORKSHOP.`).
- `Scene` — tungsten key / red rim / cool fill, local Lightformer environment (no HDR download), contact shadow, damped orbit with polar/zoom limits, focus drift toward the active slot, "work-lamp" pulse on the last-changed part, data-driven hotspots.
- `ProceduralBike` — base rig + one mount per slot. Each slot renders `option.modelAsset`:
  - `{ kind: 'procedural', variant }` → a function in `VARIANTS`
  - `{ kind: 'glb', url, node }` → `useGLTF` with the vendored Draco decoder at `/draco/`
  - `{ kind: 'none' }` → empty slot
- `quality.ts` — `low` tier (DPR ≤1.5, no shadow maps, fewer segments) for phones / low memory / Save-Data.

R3F disposes geometries/materials when the bay unmounts (route change).

## Data flow

```
Supabase (anon, RLS: published rows) ──► lib/catalogue/repository.getCatalogue()  ◄── local seed (fallback)
                                                     │  (React cache + ISR revalidate 300s)
                         server pages ───────────────┘  pass only what each page needs to client components

Browser ─► POST /api/quotes | /api/service-requests | /api/checkout  (zod, same-origin, rate limit, honeypot)
            └► lib/server/store (Supabase service role — server only; in-memory in dev)
Gateway ─► POST /api/payments/webhook (HMAC verified, idempotent) ─► settlePayment()
Browser ─► POST /api/payments/verify (signature verified) ─────────► settlePayment()
```

## Payments

`PaymentProvider { createPayment, verifyPayment, handleWebhook, refundPayment }` — `razorpay.ts` and a dev `mock.ts` that behaves like a real gateway (server-created order, HMAC-signed callback). `settlePayment` is the single place an order changes state:

- records each provider event id once (`payments.provider_event_id` unique) → webhook retries and the verify/webhook race are harmless;
- rejects captures whose amount ≠ order total;
- guards transitions (a late `failed` can't downgrade `paid`).

Future: `BUILD → CONFIGURATION → QUOTE → APPROVAL → PAYMENT` — quotes carry a `status` (`requested … approved → paid`); an approved quote can create an order through the same provider.

## Accessibility

Skip link, semantic headings, visible focus, labelled fields with `aria-invalid`/`aria-describedby`, radio-group semantics for colours/options, `aria-live` price updates, rack as a modal dialog (focus trap, Escape, focus return, `inert` when closed), `scroll-padding` so focus is never hidden behind the fixed nav/dock, 44px touch targets, `prefers-reduced-motion` honoured everywhere.
