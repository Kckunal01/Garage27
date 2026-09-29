import type { ReactNode } from 'react'
import { AddingBar } from '@/features/checkout/AddingBar'

export default function PartsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AddingBar />
    </>
  )
}
