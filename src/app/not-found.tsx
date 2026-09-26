import type { Metadata } from 'next'
import { LostInGarage } from '@/components/garage-ui/LostInGarage'

export const metadata: Metadata = { title: 'Wrong bay', robots: { index: false } }

export default function NotFound() {
  return <LostInGarage />
}
