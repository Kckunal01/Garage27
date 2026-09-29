'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isAdding, readSelection } from './selection'

/**
 * While a customer is on the "Want to add something?" detour, a thin strip
 * above the nav says their order is kept and takes them back to it.
 */
export function AddingBar() {
  const pathname = usePathname()
  const [items, setItems] = useState(0)
  useEffect(() => {
    // Storage is only readable after mount; re-check on every Parts page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(isAdding() ? readSelection().reduce((n, l) => n + l.quantity, 0) : 0)
  }, [pathname])
  useEffect(() => {
    document.documentElement.toggleAttribute('data-adding', items > 0)
    return () => document.documentElement.removeAttribute('data-adding')
  }, [items])
  if (!items) return null
  return (
    <p className="adding-bar" role="status">
      <span>
        ADDING TO YOUR ORDER · {items} ITEM{items === 1 ? '' : 'S'}
      </span>
      <Link href="/checkout?selection=1">BACK TO CHECKOUT →</Link>
    </p>
  )
}
