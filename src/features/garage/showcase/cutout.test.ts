import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { garageMachines } from '@/data/catalogue/garage'
import { keyPaintedBackdrop } from './cutout'

/** A w×h image: a 5px checker (232 / 250), with a painter callback on top. */
function checker(w: number, h: number, paint: (x: number, y: number) => [number, number, number] | null) {
  const d = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = (Math.floor(x / 5) + Math.floor(y / 5)) % 2 ? 250 : 232
      const [r, g, b] = paint(x, y) ?? [v, v, v]
      d.set([r, g, b, 255], (y * w + x) * 4)
    }
  }
  return d
}
const alpha = (d: Uint8ClampedArray, w: number, x: number, y: number) => d[(y * w + x) * 4 + 3]

describe('keyPaintedBackdrop', () => {
  const W = 60
  const H = 40
  const inBody = (x: number, y: number) => x >= 10 && x < 50 && y >= 8 && y < 32
  const inPocket = (x: number, y: number) => x >= 15 && x < 25 && y >= 12 && y < 22 // enclosed checker
  const inLamp = (x: number, y: number) => x >= 38 && x < 44 && y >= 14 && y < 20 // hot white
  const d = checker(W, H, (x, y) => (inPocket(x, y) ? null : inLamp(x, y) ? [255, 254, 252] : inBody(x, y) ? [30, 20, 18] : null))
  keyPaintedBackdrop(d, W, H)

  it('removes the checker that reaches the edge', () => {
    expect(alpha(d, W, 0, 0)).toBe(0)
    expect(alpha(d, W, 55, 35)).toBe(0)
  })
  it('removes enclosed checker pockets (between spokes)', () => {
    expect(alpha(d, W, 20, 17)).toBe(0)
  })
  it('keeps the machine, including a hot-white headlamp', () => {
    expect(alpha(d, W, 30, 26)).toBe(255)
    expect(alpha(d, W, 41, 17)).toBe(255)
  })
})

describe('garage catalogue', () => {
  it('every machine has a unique slug and number, a real image and sane floor contact', () => {
    expect(new Set(garageMachines.map((m) => m.slug)).size).toBe(garageMachines.length)
    expect(new Set(garageMachines.map((m) => m.number)).size).toBe(garageMachines.length)
    for (const m of garageMachines) {
      const file = path.join(process.cwd(), 'public', decodeURIComponent(m.image.src))
      expect(existsSync(file), file).toBe(true)
      const { rear, front } = m.image.contact
      for (const v of [...rear, ...front]) expect(v).toBeGreaterThanOrEqual(0)
      for (const v of [...rear, ...front]) expect(v).toBeLessThanOrEqual(1)
      expect(front[0]).toBeGreaterThan(rear[0])
    }
  })
})
