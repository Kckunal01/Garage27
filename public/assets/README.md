# Asset contract

Pages already reference these paths. When a file exists at build time it is used; otherwise the procedural fallback (CSS environment, SVG bike, stencil plate) renders. Rebuild/redeploy after adding media.

Keep **originals out of the repo** (`assets-masters/` is git-ignored). Ship only optimised delivery files. `/assets/*` is cached `immutable` for a year — change the filename when you change the file.

| Path | Used by | Spec |
| --- | --- | --- |
| `environments/exterior/garage-night.webp` | Home hero still (LCP) | 1920×1080 + 900×1600 art-directed crop, WebP ≤ 180 KB desktop / ≤ 110 KB mobile; AVIF variant optional |
| `video/hero-lights.webm`, `video/hero-lights.mp4` | Home light-on/off loop | 6–10 s seamless, silent, ≤ 1.5 MB, poster = still above |
| `environments/{garage,workshop,parts-wall,build-bay}/…` | Page heroes | same as above |
| `builds/<id>.webp` (set `showcase_builds.image`) | Garage cards | 1600×1000, ≤ 140 KB |
| `parts/<category>/<file>.webp` (set in `parts.images`) | Product cards/PDP | 1200×1200 square, ≤ 90 KB, neutral workshop bench |
| `bikes/<brand>/<slug>-preview.webp` (set `bikes.preview_image`) | Preview-only bikes, 3D fallback | 1600×1000 transparent/dark background |
| `3d/bikes/<slug>/<slug>.glb` | Build bay | Draco/Meshopt, ≤ 3 MB, one named node per slot |
| `brand/garage27-logo.svg` | Header/hero signature | Official vector; swap into `GarageLogo` |

All imagery should feel like one physical garage: near-black concrete, tungsten/amber light, red neon accents, chrome, haze — no clean studio white.
