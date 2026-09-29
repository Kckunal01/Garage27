'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { isImmersive } from './nav-config'

/** Header wrapper: switches to the minimal, transparent treatment on immersive routes. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const immersive = isImmersive(usePathname() ?? '/')
  return <header className={`site-header${immersive ? ' site-header--immersive' : ''}`}>{children}</header>
}
