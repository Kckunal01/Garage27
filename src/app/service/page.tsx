import type { Metadata } from 'next'
import { ServiceBay } from '@/features/service/ServiceBay'
import { ServiceHero } from '@/features/service/ServiceHero'
import { bikeChoices } from '@/features/service/bikeChoices'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Motorcycle Customisation Services',
  description: 'Custom design, consultation, doorstep installation, custom paint & upholstery, and detailing & restoration from the Garage 27 workshop.',
  path: '/service',
})

export default async function ServicePage({ searchParams }: PageProps<'/service'>) {
  const [{ services, bikes }, params] = await Promise.all([getCatalogue(), searchParams])
  const wanted = typeof params.request === 'string' ? params.request : null
  // Only a real catalogue service opens the request flow.
  const requested = wanted && services.some((s) => s.id === wanted) ? wanted : null
  return (
    <div className="svc">
      <ServiceHero compact={!!requested} />
      <div className="svc__body">
        <ServiceBay services={services} bikes={bikeChoices(bikes)} requested={requested} />
      </div>
    </div>
  )
}
