import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BREAKPOINTS } from '@/lib/breakpoints'

/**
 * Architecture guards. These fail the build if a change reintroduces the
 * causes of the navigation / mobile-on-desktop regressions.
 */
const SRC = path.resolve(__dirname, '..')
function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f)
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(f) ? [p] : []
  })
}
const css = files(path.join(SRC, 'styles'), /\.css$/)
const tsx = files(SRC, /\.tsx?$/).filter((f) => !f.endsWith('.test.ts'))
// Always forward slashes, so assertions match on Windows and Unix alike.
const rel = (f: string) => path.relative(SRC, f).replace(/\\/g, '/')

describe('responsive architecture', () => {
  it('no stylesheet hardcodes a width breakpoint (use --mobile / --desktop / --wide)', () => {
    const offenders = css
      .filter((f) => !f.endsWith('breakpoints.css'))
      .flatMap((f) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .map((line, i) => ({ line, i }))
          .filter(({ line }) => /@media[^{]*\b(min|max)-width|@media[^{]*\bwidth\s*[<>]/.test(line))
          .map(({ i }) => `${rel(f)}:${i + 1}`),
      )
    expect(offenders).toEqual([])
  })

  it('breakpoints.css and breakpoints.ts agree', () => {
    const def = readFileSync(path.join(SRC, 'styles/breakpoints.css'), 'utf8')
    expect(def).toContain(`--desktop (width >= ${BREAKPOINTS.desktop}px)`)
    expect(def).toContain(`--mobile (width < ${BREAKPOINTS.desktop}px)`)
    expect(def).toContain(`--wide (width >= ${BREAKPOINTS.wide}px)`)
  })
})

describe('global navigation', () => {
  it('GarageNav is rendered only by the root layout', () => {
    const users = tsx.filter((f) => /<GarageNav\b/.test(readFileSync(f, 'utf8'))).map(rel)
    expect(users).toEqual(['app/layout.tsx'])
  })

  it('GarageNav has no variants and the header contains no primary navigation', () => {
    const nav = readFileSync(path.join(SRC, 'components/navigation/GarageNav.tsx'), 'utf8')
    expect(nav).not.toMatch(/variant\s*[?:=]/) // no variant prop
    const header = readFileSync(path.join(SRC, 'components/navigation/SiteHeader.tsx'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(header).not.toMatch(/<GarageNav|import[^\n]*(GarageNav|PRIMARY_NAV)|<nav/)
  })

  it('only GarageNav declares the primary navigation landmark', () => {
    const primary = tsx.filter((f) => /aria-label="Primary"/.test(readFileSync(f, 'utf8'))).map(rel)
    expect(primary).toEqual(['components/navigation/GarageNav.tsx'])
  })

  it('no stylesheet hides or re-positions the nav per breakpoint', () => {
    const chrome = readFileSync(path.join(SRC, 'styles/chrome.css'), 'utf8')
    const blocks = [...chrome.matchAll(/@media[^{]*\{([\s\S]*?)\n\}/g)].map((m) => m[1])
    expect(blocks.some((b) => /\.gnav\b/.test(b!))).toBe(false)
    for (const f of css) expect(readFileSync(f, 'utf8'), rel(f)).not.toMatch(/\.gnav--/)
  })
})
