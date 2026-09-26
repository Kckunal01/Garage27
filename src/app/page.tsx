import type { Metadata } from 'next'
import { GarageHero, GarageHeroStatement } from '@/features/garage/home/GarageHero'
import { GarageHeroCopy } from '@/features/garage/home/GarageHeroCopy'
import { GarageHeroActions } from '@/features/garage/home/GarageHeroActions'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Custom Motorcycles, Built Different',
    description: 'Garage 27 builds custom motorcycles. Design yours in the 3D build bay, explore pre-customised builds, shop parts, or book a service.',
    path: '/',
    image: '/assets/environments/garage27-home-base.png',
  }),
  title: { absolute: 'Garage 27 — Custom Motorcycles, Built Different' },
}

/** Garage / home: one environmental composition over the supplied production image. */
export default function HomePage() {
  return (
    <GarageHero>
      <GarageHeroStatement />
      <div className="ghero__lower">
        <GarageHeroCopy />
        <GarageHeroActions />
      </div>
    </GarageHero>
  )
}
