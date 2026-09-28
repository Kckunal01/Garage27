import { describe, expect, it } from 'vitest'
import { isNavItemActive, PRIMARY_NAV } from './nav-config'

const activeOn = (pathname: string) => PRIMARY_NAV.filter((item) => isNavItemActive(pathname, item)).map((i) => i.label)

describe('bottom nav active state', () => {
  it('the home page has no active destination', () => {
    expect(activeOn('/')).toEqual([])
  })

  it.each([
    ['/garage', 'GARAGE'],
    ['/build', 'BUILD'],
    ['/parts', 'PARTS'],
    ['/parts/some-part', 'PARTS'],
    ['/service', 'SERVICE'],
    ['/about', 'ABOUT'],
  ])('%s → %s only', (pathname, label) => {
    expect(activeOn(pathname)).toEqual([label])
  })
})
