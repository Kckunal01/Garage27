'use client'

import { SubNav } from '@/components/navigation/SubNav'
import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'
import type { ServiceOffering } from '@/types/catalogue'
import { ServiceCard } from './ServiceCard'
import { ServiceRequestForm } from './ServiceRequestForm'

export const requestHref = (id: string) => `/service?request=${encodeURIComponent(id)}`

/**
 * SERVICE → pick a service (card) → request flow for that service.
 * The chosen service lives in the URL (`?request=`), so the browser's back
 * button returns to the list and a request link can be shared.
 */
export function ServiceBay({ services, requested }: { services: ServiceOffering[]; requested: string | null }) {
  useEffect(() => {
    track('service_viewed', requested ? { service: requested } : undefined)
  }, [requested])

  if (requested) return <ServiceRequest key={requested} services={services} initial={requested} />

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

function ServiceRequest({ services, initial }: { services: ServiceOffering[]; initial: string }) {
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
        <p className="svc-request__lede">Three short steps. A builder calls you back — no bots, no ticket queue.</p>
      </div>
      <ServiceRequestForm services={services} selected={selected} onSelect={setSelected} />
    </div>
  )
}
