import type { Metadata } from 'next'
import { EnvironmentalHero } from '@/components/media/EnvironmentalHero'
import { GarageLink } from '@/components/garage-ui/GarageButton'
import { EmptyState } from '@/components/garage-ui/States'
import { BuildCard } from '@/features/garage/BuildCard'
import { getCatalogue } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'The Garage — Pre-Customised Motorcycle Builds',
  description: 'Numbered, pre-customised motorcycles from the Garage 27 workshop. Open any build in the 3D build bay and make it yours.',
  path: '/garage',
})

export default async function GaragePage() {
  const { showcase, bikes } = await getCatalogue()
  return (
    <>
      <EnvironmentalHero environment="garage" size="band" sign="Garage 27">
        <p className="label label--amber">THE GARAGE</p>
        <h1 className="display" style={{ marginTop: 12 }}>
          Different bikes.
          <br />
          <em>Same soul.</em>
        </h1>
      </EnvironmentalHero>

      <section className="section wrap" aria-labelledby="showcase-heading">
        <div className="garage-intro">
          <h2 id="showcase-heading" className="title">
            PRE-CUSTOMISED BUILDS
          </h2>
          <p className="lede">Every bike here left the workshop with a number and a story. Open one in the build bay, keep what you love, change the rest.</p>
        </div>
        {showcase.length ? (
          <div className="bcard-grid">
            {showcase.map((b) => (
              <BuildCard key={b.id} build={b} bike={bikes.find((x) => x.id === b.bikeId)} image={assetExists(b.image) ? b.image : undefined} />
            ))}
          </div>
        ) : (
          <EmptyState title="THE GARAGE IS BEING SWEPT.">New builds roll in soon.</EmptyState>
        )}
        <div className="garage-cta">
          <p className="headline">Nothing here is yours yet.</p>
          <GarageLink href="/build" variant="ignite">
            START FROM SCRATCH
          </GarageLink>
        </div>
      </section>
    </>
  )
}
