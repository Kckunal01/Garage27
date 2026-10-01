'use client'

import { SubNav } from '@/components/navigation/SubNav'
import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'
import type { ServiceOffering } from '@/types/catalogue'
import type { BikeChoiceGroup } from './bikeChoices'
import { ServiceCard } from './ServiceCard'
import { ServiceRequestForm } from './ServiceRequestForm'

export const requestHref = (id: string) => `/service?request=${encodeURIComponent(id)}`

/**
 * SERVICE → pick a service (card) → request flow for that service.
 * The chosen service lives in the URL (`?request=`), so the browser's back
 * button returns to the list and a request link can be shared.
 */
export function ServiceBay({ services, bikes, requested }: { services: ServiceOffering[]; bikes: BikeChoiceGroup[]; requested: string | null }) {
  useEffect(() => {
    track('service_viewed', requested ? { service: requested } : undefined)
  }, [requested])

  if (requested) return <ServiceRequest key={requested} services={services} bikes={bikes} initial={requested} />

  return (
    <ol className="svc-list" aria-label="Services">
      {services.map((s, i) => (
        <li key={s.id}>
          <ServiceCard service={s} href={requestHref(s.id)} eager={i < 2} onClick={() => track('service_selected', { service: s.id, surface: 'card' })} />
        </li>
      ))}
    </ol>
  )
}

function ServiceRequest({ services, bikes, initial }: { services: ServiceOffering[]; bikes: BikeChoiceGroup[]; initial: string }) {
  const [selected, setSelected] = useState(initial)
  const service = services.find((s) => s.id === selected)
  return (
    <div className="svc-request">
      <div className="svc-request__intro">
        <SubNav
          label="Service pages"
          items={[{ href: '/service', label: 'All services' }, ...services.map((s) => ({ href: requestHref(s.id), label: s.name.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) }))]}
          current={requestHref(selected)}
        />
        {service && <ServiceCard service={service} eager />}
      </div>
      <ServiceRequestForm services={services} bikes={bikes} selected={selected} onSelect={setSelected} />
    </div>
  )
}
