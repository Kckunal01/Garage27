import { garageMachines } from '@/data/catalogue/garage'
import type { GarageMachine } from '@/types/catalogue'

export function getGarageMachines(): GarageMachine[] {
  return garageMachines
}

export function getGarageMachine(slug: string): GarageMachine | undefined {
  return garageMachines.find((m) => m.slug === slug)
}

/** The catalogue identifier as shown: #01. */
export const machineNumber = (m: Pick<GarageMachine, 'number'>) => `#${String(m.number).padStart(2, '0')}`

export const machineHref = (m: Pick<GarageMachine, 'slug'>) => `/garage/${m.slug}`
