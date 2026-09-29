import type { Metadata } from 'next'
import { EmptyState } from '@/components/garage-ui/States'
import { GarageScene } from '@/features/garage/showcase/GarageScene'
import { getGarageMachines } from '@/lib/catalogue/garage'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'The Garage — Finished Garage 27 Motorcycles',
  description: 'Finished, custom-built Garage 27 motorcycles. No legal issues, no insurance issues, no resale issues. Customise without compromising.',
  path: '/garage',
})

export default function GaragePage() {
  const [featured] = getGarageMachines()
  if (!featured) return <EmptyState title="THE GARAGE IS BEING SWEPT.">The next machine rolls in soon.</EmptyState>
  return <GarageScene machine={featured} />
}
