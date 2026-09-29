import type { Metadata } from 'next'
import { CatalogueNote } from '@/components/garage-ui/CatalogueNote'
import { PartsBrowser } from '@/features/parts/PartsBrowser'
import { PartsHero } from '@/features/parts/PartsHero'
import { getCatalogue } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Custom Motorcycle Parts',
  description: 'Lighting, cockpit, body, seats, luggage, wheels and detail parts for custom motorcycles — filtered by the bike you ride.',
  path: '/parts',
})

export default async function PartsPage() {
  const { parts, bikes, source } = await getCatalogue()
  const images: Record<string, string> = {}
  for (const p of parts) if (assetExists(p.images[0]?.src)) images[p.id] = p.images[0]!.src
  return (
    <div className="prt">
      <PartsHero />
      <div className="prt__body">
        <PartsBrowser parts={parts} bikes={bikes} images={images} />
        {source === 'local' && <CatalogueNote />}
      </div>
    </div>
  )
}
