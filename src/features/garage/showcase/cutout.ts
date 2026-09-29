/**
 * Keys a painted-in backdrop (the grey/white "transparency" checkerboard some
 * cutouts ship with, baked into opaque pixels) out of RGBA pixel data, in place.
 * The source file is never changed; this runs on the pixels the page draws.
 *
 * Backdrop = light, colourless pixels that either touch the image edge or form
 * a pocket showing the checker's darker tone (between spokes, inside the
 * frame). Small or uniformly hot-white pockets — a headlamp, a chrome glint —
 * are part of the machine and stay. The one- and two-pixel rim is then
 * softened so no light fringe shows against a dark floor, and feathered by a
 * pixel so the outline stays smooth when the machine is shown enlarged.
 */
const isBackdrop = (d: Uint8ClampedArray, i: number) => {
  const lo = Math.min(d[i]!, d[i + 1]!, d[i + 2]!)
  const hi = Math.max(d[i]!, d[i + 1]!, d[i + 2]!)
  return lo >= 200 && hi - lo <= 16
}
/** The checker's darker tone sits below this; hot highlights sit above it. */
const CHECKER_DARK = 241
const MIN_POCKET = 24

export function keyPaintedBackdrop(d: Uint8ClampedArray, w: number, h: number): void {
  const n = w * h
  const bg = new Uint8Array(n)
  const seen = new Uint8Array(n)
  const stack = new Int32Array(n)
  const members = new Int32Array(n)

  for (let s = 0; s < n; s++) {
    if (seen[s] || !isBackdrop(d, s * 4)) continue
    let top = 0
    let len = 0
    let edge = false
    let dark = 0
    stack[top++] = s
    seen[s] = 1
    while (top) {
      const p = stack[--top]!
      members[len++] = p
      const x = p % w
      const y = (p - x) / w
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true
      if (Math.min(d[p * 4]!, d[p * 4 + 1]!, d[p * 4 + 2]!) < CHECKER_DARK) dark++
      const next = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]
      for (const q of next) {
        if (q >= 0 && !seen[q] && isBackdrop(d, q * 4)) {
          seen[q] = 1
          stack[top++] = q
        }
      }
    }
    const pocket = len >= MIN_POCKET && dark / len >= 0.12
    if (edge || pocket) for (let k = 0; k < len; k++) bg[members[k]!] = 1
  }

  // Rim: Chebyshev distance 1 or 2 from the backdrop.
  const near = new Uint8Array(n)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      if (bg[p]) continue
      let dist = 3
      for (let dy = -2; dy <= 2 && dist > 1; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const a = x + dx
          const b = y + dy
          if (a >= 0 && a < w && b >= 0 && b < h && bg[b * w + a]) dist = Math.min(dist, Math.max(Math.abs(dx), Math.abs(dy)))
        }
      }
      near[p] = dist
    }
  }
  for (let p = 0; p < n; p++) {
    const i = p * 4
    if (bg[p]) {
      d[i + 3] = 0
      continue
    }
    if (near[p]! > 2) continue
    const l = 0.3 * d[i]! + 0.59 * d[i + 1]! + 0.11 * d[i + 2]!
    const k = near[p] === 1 ? (225 - l) / 90 : (240 - l) / 60
    d[i + 3] = Math.round(d[i + 3]! * Math.max(0, Math.min(1, k)))
  }

  // Feather: on the rim, alpha becomes the 3×3 mean (never raised).
  const a = new Uint8ClampedArray(n)
  for (let p = 0; p < n; p++) a[p] = d[p * 4 + 3]!
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      if (bg[p] || near[p]! > 2) continue
      let sum = 0
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const q = (y + dy) * w + (x + dx)
          if (x + dx < 0 || x + dx >= w || y + dy < 0 || y + dy >= h) continue
          sum += a[q]!
          count++
        }
      }
      d[p * 4 + 3] = Math.min(a[p]!, Math.round(sum / count))
    }
  }
}
