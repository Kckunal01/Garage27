import type { Metadata } from 'next'
import { LostInGarage } from '@/components/garage-ui/LostInGarage'

export const metadata: Metadata = { title: 'Wrong bay', robots: { index: false } }

/** Explicit /404 route (linked from Cloudflare custom error rules). */
export default function Explicit404() {
  return <LostInGarage />
}
