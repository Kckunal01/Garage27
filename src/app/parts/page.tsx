import type { Metadata } from 'next'
import { PartsHero } from '@/features/parts/PartsHero'
import { PartsLanding } from '@/features/parts/PartsLanding'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Custom Motorcycle Parts',
  description: 'Lighting, cockpit, body, seats, luggage, wheels and detail parts for custom motorcycles — filtered by the bike you ride.',
  path: '/parts',
})

export default async function PartsPage() {
  const { parts, bikes } = await getCatalogue()
  return (
    <div className="prt">
      <PartsHero />
      <div className="prt__body">
        <PartsLanding parts={parts} bikes={bikes} />
      </div>
    </div>
  )
}
