# Adding a vehicle to the build bay

No Build-page code changes. Data, a model, and QA. The bay only ever reads the catalogue.

1. **Vehicle** — `bikes`: id, slug, brand (manufacturer), model, name, optional `year` / `variant` / `thumbnail`, `base_price` (paise), `engine_cc` (displacement), silhouette, `camera`. Start as `status = 'coming-soon'`.
2. **3D model** — one GLB per vehicle, Draco/Meshopt-compressed, textures ≤ 2K, at `public/assets/3d/bikes/<slug>/<slug>.glb`. Set
   `model3d = { kind: 'glb', ref: '<url>', paintNodes: ['bike.tank', 'bike.frontFender', …] }`.
   **Stable node names** (never mesh indexes): `bike.frame`, `bike.engine`, `bike.wheelFront`, `bike.wheelRear`, `bike.tank`, `bike.seat`, `bike.headlight`, `bike.handlebar`, `bike.mirrors`, `bike.exhaust`, `bike.luggage`, `bike.rearFender`, …
   Option variants inside the vehicle file are child nodes (e.g. `bike.seat:solo`); the selected one is shown, the rest hidden. The loader is lazy: only the selected vehicle's GLB is fetched.
3. **Colours** — `bike_colours`: name, `swatch` (hex), `material` `{color, metalness, roughness, clearcoat, accent}`, `price_delta`. Applied to the `paintNodes` materials in place.
4. **Slots** — `bike_slots`: only the slots this vehicle physically has. Categories with no slot are hidden for that vehicle. Stock parts you don't want configurable go in `model3d.fixedNodes`.
5. **Options** — `build_options`: `compatible_bike_ids` (every vehicle it fits), slot, category, `affected_nodes` (e.g. `{bike.seat}`), name, `price_delta`, `model_asset` (`{kind:'glb', url, node}` or `{kind:'none'}`), `requires[]`, `excludes[]`. An option shows on a vehicle only if it lists that vehicle **and** the vehicle has the slot. Shipping an upgrade for another vehicle = add its id to `compatible_bike_ids` (+ a node in that vehicle's GLB).
6. **Prices** — confirmed by Garage 27. Copy stays "ESTIMATED BUILD VALUE".
7. **Build zones** — the Build page rail (TANK, FRONT, COCKPIT, SEAT, MID-BODY, REAR, WHEELS, DETAILS, FINISH) and hotspot names come from `BUILD_ZONES` in `src/data/catalogue/index.ts`. Each zone owns slot ids (e.g. FRONT = `headlight`, `frontFender`; MID-BODY = `sidePanels`, `engineCovers`; WHEELS = `wheels`; FINISH = `finish`). A zone is live on a vehicle when the vehicle has one of those slots (TANK is also live for paint). Give a new slot one of these ids and its zone lights up; a new kind of slot needs its id added to a zone (the QA gate fails otherwise).
8. **Hotspots** — `bike_slots.hotspot = [x, y, z]` in model space (metres, +X forward, +Y up, +Z right).
9. **QA** — `npm run catalogue:check`: ids, defaults, renderable assets, stable node ids, rule targets, fixed nodes, hotspots.
10. **Activate** — `status = 'active'`. Without a GLB yet: `'preview-only'` (static preview + quote), or run it on the procedural TEST rig (`kind: 'procedural'`), as the sample Classic 350 and Jawa 42 do.

## The Build landing (`/build`, Choose your bike)

`/build` lists every `active` bike in catalogue order (`sort_order`); the first is featured by default. It reads, per bike: `name`, `brand`, optional `tagline`, `previewImage` (the large featured photograph) and `thumbnail` (the catalogue card). Until photographs are delivered the line drawing (`silhouette`) stands in, painted in the selected colour. Only the featured bike shows its `bike_colours`; a bike without verified colours shows none (and is built without one) until they are added. **BUILD NOW** opens the bay at `/build/visualiser?bike=<id>&colour=<colourId>`: only bikes with a 3D rig (`model3d` + slots) open the interactive editor with that colour; the rest open preview + quote. A bike without `base_price` shows **PRICE ON REQUEST** in the bay. Old `/build?bike=…`, `?preset=`, `?c=`, `?saved=1` links redirect to the bay.
