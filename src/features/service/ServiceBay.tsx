'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/analytics'
import type { ServiceOffering } from '@/types/catalogue'
import { ServiceRequestForm } from './ServiceRequestForm'

export function ServiceBay({ services }: { services: ServiceOffering[] }) {
  const [selected, setSelected] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    track('service_viewed')
  }, [])

  const request = (id: string) => {
    setSelected(id)
    track('service_selected', { service: id, surface: 'card' })
    formRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <>
      <ol className="scard-list">
        {services.map((s, i) => (
          <li key={s.id} className={`scard${selected === s.id ? ' is-selected' : ''}`}>
            <span className="scard__n">{String(i + 1).padStart(2, '0')}</span>
            <div className="scard__body">
              <p className="label label--amber">{s.kicker}</p>
              <h3 className="scard__name">{s.name}</h3>
              <p className="scard__summary">{s.summary}</p>
              <ul className="scard__includes">
                {s.includes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <button type="button" className="btn btn--amber scard__cta" onClick={() => request(s.id)} aria-label={`Request ${s.name.toLowerCase()}`}>
              REQUEST
            </button>
          </li>
        ))}
      </ol>

      <div id="request" ref={formRef} className="service-request">
        <div className="service-request__intro">
          <p className="label label--amber">REQUEST A SERVICE</p>
          <h2 className="headline">Tell us about the bike.</h2>
          <p className="lede">Three short steps. A builder calls you back — no bots, no ticket queue.</p>
        </div>
        <ServiceRequestForm services={services} selected={selected} onSelect={setSelected} />
      </div>
    </>
  )
}
