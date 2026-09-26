import type { Metadata } from 'next'
import { EnvironmentalHero } from '@/components/media/EnvironmentalHero'
import { ServiceBay } from '@/features/service/ServiceBay'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Motorcycle Customisation Services',
  description: 'Custom design, consultation, doorstep installation, custom paint & upholstery, and detailing & restoration from the Garage 27 workshop.',
  path: '/service',
})

export default async function ServicePage() {
  const { services } = await getCatalogue()
  return (
    <>
      <EnvironmentalHero environment="workshop" size="band">
        <p className="label label--amber">SERVICE</p>
        <h1 className="display" style={{ marginTop: 12 }}>
          Ride. Restore.
          <br />
          <em>Repeat.</em>
        </h1>
      </EnvironmentalHero>
      <section className="section--tight wrap" aria-label="Services">
        <ServiceBay services={services} />
      </section>
    </>
  )
}
