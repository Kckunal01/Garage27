# Analytics

`track(event, props)` in `src/lib/analytics` is the only call site API. Adapters (set with `NEXT_PUBLIC_ANALYTICS_ADAPTERS`, comma separated):

- `datalayer` — pushes to `window.dataLayer` (GTM → GA4 / Meta / anything)
- `beacon` — `navigator.sendBeacon(NEXT_PUBLIC_ANALYTICS_ENDPOINT)`
- `console` — always on in development

Every event also dispatches a `g27:track` DOM event (used by the end-to-end checks). `registerAnalyticsAdapter()` adds vendors at runtime, e.g. after consent.

**PII:** `scrub()` drops keys like email/phone/name/address/card/token and any value that looks like an email or Indian mobile number. Order and build values are sent as bands (`value_band`: `<5k`, `5k-25k`, `25k-1L`, `1L-2.5L`, `2.5L+`), never exact amounts tied to a person.

| Journey | Events |
| --- | --- |
| Navigation | `nav_garage` `nav_build` `nav_parts` `nav_service` `nav_about` (prop `surface`: pill/bar/rack) · `rack_open` `rack_close` (`reason`) · `cta_clicked` |
| Build | `build_started` (`entry`) · `build_bike_selected` · `build_colour_selected` · `build_category_opened` · `build_option_selected` · `build_option_blocked` · `build_configuration_changed` · `build_quote_started` · `build_quote_submitted` · `build_saved` · `build_3d_failed` (`reason`) |
| Parts & commerce | `parts_bike_filter_selected` · `parts_category_opened` · `product_viewed` · `add_to_cart` · `cart_viewed` · `checkout_started` · `payment_started` · `payment_success` · `payment_failed` (`stage`) |
| Service | `service_viewed` · `service_selected` · `service_form_started` · `service_reference_uploaded` · `service_request_submitted` |
| Performance | `web_vital` (`metric`: LCP/INP/CLS/TTFB/FCP, `value`, `rating`) |

Every event carries `route`.
