import type { BuildCategory, CatalogueSnapshot, CategoryMeta, PartCategory } from '@/types/catalogue'
import { bikes, colours } from './bikes'
import { options } from './options'
import { parts } from './parts'
import { services, showcase } from './showcase'

export const localCatalogue: CatalogueSnapshot = { bikes, colours, options, parts, showcase, services }

export const BUILD_CATEGORY_META: Record<BuildCategory, CategoryMeta> = {
  lighting: { id: 'lighting', label: 'LIGHTING', descriptor: 'See and be seen.' },
  cockpit: { id: 'cockpit', label: 'COCKPIT', descriptor: 'Where your hands live.' },
  body: { id: 'body', label: 'BODY', descriptor: 'Tank, panels, paint.' },
  seat: { id: 'seat', label: 'SEAT', descriptor: 'Leather and posture.' },
  detail: { id: 'detail', label: 'DETAIL', descriptor: 'Finish is everything.' },
  luggage: { id: 'luggage', label: 'LUGGAGE', descriptor: 'Carry the long road.' },
  rearWheel: { id: 'rearWheel', label: 'REAR WHEEL', descriptor: 'Stance from behind.' },
}

export const PART_CATEGORY_META: Record<PartCategory, CategoryMeta> = {
  lighting: { id: 'lighting', label: 'LIGHTING', descriptor: 'Headlights, indicators, tail.' },
  cockpit: { id: 'cockpit', label: 'COCKPIT', descriptor: 'Bars, grips, mirrors, gauges.' },
  body: { id: 'body', label: 'BODY', descriptor: 'Tanks, fenders, panels.' },
  seat: { id: 'seat', label: 'SEAT', descriptor: 'Solo, bench, pillion.' },
  detail: { id: 'detail', label: 'DETAIL', descriptor: 'Badges, trim, finish.' },
  luggage: { id: 'luggage', label: 'LUGGAGE', descriptor: 'Bags, racks, tank bags.' },
  rear: { id: 'rear', label: 'REAR', descriptor: 'Tail lights, fenders.' },
  wheel: { id: 'wheel', label: 'WHEEL', descriptor: 'Wheels and tyres.' },
}
