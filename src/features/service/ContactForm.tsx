'use client'

import { useState } from 'react'
import type { ServiceOffering } from '@/types/catalogue'
import { ServiceRequestForm } from './ServiceRequestForm'

/** About-page contact: the same request pipeline, defaulting to a consultation. */
export function ContactForm({ services }: { services: ServiceOffering[] }) {
  const [selected, setSelected] = useState(services.find((s) => s.id === 'consultation')?.id ?? '')
  return <ServiceRequestForm services={services} selected={selected} onSelect={setSelected} compact />
}
