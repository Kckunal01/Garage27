import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { garageMachines } from '@/data/catalogue/garage'

describe('garage catalogue', () => {
  it('every machine has a unique slug and number, a real image and a frame inside it', () => {
    expect(new Set(garageMachines.map((m) => m.slug)).size).toBe(garageMachines.length)
    expect(new Set(garageMachines.map((m) => m.number)).size).toBe(garageMachines.length)
    for (const m of garageMachines) {
      const file = path.join(process.cwd(), 'public', decodeURIComponent(m.image.src))
      expect(existsSync(file), file).toBe(true)
      const { x, y, w, h } = m.image.frame
      expect(Math.min(x, y, w, h)).toBeGreaterThanOrEqual(0)
      expect(x + w).toBeLessThanOrEqual(1)
      expect(y + h).toBeLessThanOrEqual(1)
    }
  })
})
