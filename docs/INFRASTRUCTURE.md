# Infrastructure

## Supabase — data & storage

1. Create a project. Run `supabase/migrations/*.sql`, then `supabase/seed.sql` (regenerate with `npm run db:seed:sql`).
   *No existing schema was available to reconcile against when this was written — if the project already has tables, diff before applying.*
2. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (**server only**, never `NEXT_PUBLIC_`).
3. RLS model:
   - catalogue tables: anon `select` of non-retired / published rows only;
   - `quotes`, `service_requests`, `orders`, `order_items`, `payments`, `build_configurations`: RLS on, **no** anon/auth policies — only route handlers (service role) touch them;
   - storage bucket `references`: private, 5 MB, JPEG/PNG/WebP. Staff view with signed URLs.
4. `src/lib/supabase/admin.ts` imports `server-only`, so bundling the service-role client into the browser is a build error.

## Vercel — hosting

- Framework preset Next.js; Node ≥ 20. Set env vars per environment (Production / Preview).
- Route handlers under `/api/*` run as functions and send `Cache-Control: no-store`.
- Catalogue pages use ISR (`revalidate = 300`). Static media under `/assets/*` and `/draco/*` are served `immutable` for a year — **version filenames** when replacing media.
- Throwaway previews without Supabase: `ALLOW_MEMORY_STORE=true` (+ `ALLOW_MOCK_PAYMENTS=true`). Never on production — records are not persisted.

## Cloudflare — edge security

Proxy the apex + `www` through Cloudflare (orange cloud) to Vercel.

| Control | Setting |
| --- | --- |
| SSL/TLS | Full (strict); Always Use HTTPS; HSTS (also sent by the app) |
| WAF | Managed ruleset on; OWASP core ruleset (paranoia 1, then tune) |
| Rate limiting | `POST /api/quotes`, `/api/service-requests`: 5 / min / IP · `POST /api/checkout`: 10 / min / IP · `/api/payments/verify`: 20 / min / IP |
| Bot protection | Bot Fight Mode / Super Bot Fight on; optionally Turnstile on forms (add the token to the zod schema + verify in the handler) |
| Webhook path | **Skip** WAF bot/challenge rules for `POST /api/payments/webhook` from Razorpay IPs (signature is verified in-app) |
| Caching | Respect origin headers; bypass cache for `/api/*`, `/cart`, `/checkout`, `/order/*` |
| Custom errors | Point 404 to `/404` |

The app does not rely on Cloudflare for authorisation: every handler validates input (zod), checks same-origin, rate-limits per instance, uses a honeypot, and verifies payment signatures. The client IP is read from `CF-Connecting-IP`.

Security headers (CSP, HSTS, nosniff, frame-ancestors none, Referrer-Policy, Permissions-Policy) are set in `next.config.ts`. If you add a third-party (analytics vendor, Turnstile), extend the CSP there.

## Payments — Razorpay

1. `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
2. Dashboard → Webhooks → `https://<domain>/api/payments/webhook`, events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
3. Test with test keys end-to-end (card, UPI) before switching to live keys.
4. No card data ever touches Garage 27 servers; the `payments.raw` column stores only event name + ids.

Switching gateway = implement `PaymentProvider` in `src/lib/payments/<name>.ts`, register it in `src/lib/payments/index.ts`, extend the CSP.

## Analytics & monitoring

See [ANALYTICS.md](ANALYTICS.md). Server errors are logged as structured JSON by `reportError` (keys matching secrets/PII are redacted); swap the sink for Sentry/Logtail in `src/lib/server/monitoring.ts`.
