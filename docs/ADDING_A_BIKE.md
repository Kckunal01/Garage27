# Adding a bike to the build bay

No editor code changes. Only data, a model, and QA.

1. **Bike record** — `bikes`: id, slug, brand, model, name, `base_price` (paise), silhouette, `camera` (position/target/min/max distance). Start with `status = 'coming-soon'` (visible, not selectable).
2. **3D model** — GLB with a `Base` node (frame, wheels, engine) plus one named node per component option (e.g. `Headlight_Stock`, `Seat_Solo`). Draco/Meshopt-compress, textures ≤ 2K (KTX2 where possible). Put it at `public/assets/3d/bikes/<slug>/<slug>.glb` (or a CDN). Set `model3d = { "kind": "glb", "ref": "<url>", "approxKb": 1800 }`.
3. **Colours** — `bike_colours`: name, swatch, `material` `{color, metalness, roughness, clearcoat, accent}`, `price_delta`.
4. **Component slots** — `bike_slots`: only the slots that physically exist on this bike. Categories not present on any slot are hidden automatically.
5. **Options** — `build_options`: slot, category, name, descriptor, `price_delta`, `model_asset` `{ "kind": "glb", "url": "…", "node": "Seat_Solo" }` (or `{ "kind": "none" }`), optional `material_config`, `requires[]`, `excludes[]`, `part_id`.
6. **Prices** — confirm every delta with Garage 27. Customer-facing copy stays "ESTIMATED BUILD VALUE" unless a fixed price is approved.
7. **Hotspots** — `bike_slots.hotspot = [x, y, z]` in model space (metres, +X forward, +Y up, +Z right side).
8. **QA** — `npm run catalogue:check` (unique ids, defaults valid, every option renderable, rule targets exist, hotspots present). Walk the flow on a mid-range Android phone.
9. **Activate** — set `status = 'active'`. Until a GLB exists you can use `'preview-only'`: static preview + quote, clearly labelled.

Showcase builds (`showcase_builds.preset`) are just saved configurations — they are validated by the same engine and open directly in the bay via `/build?preset=<id>`.
