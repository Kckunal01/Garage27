import type { Metadata } from 'next'
import { EnvironmentalHero } from '@/components/media/EnvironmentalHero'
import { CatalogueNote } from '@/components/garage-ui/CatalogueNote'
import { PartsBrowser } from '@/features/parts/PartsBrowser'
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
    <>
      <EnvironmentalHero environment="parts-wall" size="band">
        <p className="label label--amber">PARTS</p>
        <h1 className="display" style={{ marginTop: 12 }}>
          The details
          <br />
          <em>make the bike.</em>
        </h1>
      </EnvironmentalHero>
      <div className="section--tight wrap parts-page">
        <PartsBrowser parts={parts} bikes={bikes} images={images} />
        {source === 'local' && <CatalogueNote />}
      </div>
    </>
  )
}
