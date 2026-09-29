import type { BuildCategory, BuildZone, CatalogueSnapshot, CategoryMeta, PartCategory } from '@/types/catalogue'
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

/**
 * Build-bay zones, in rail order (the Build reference: TANK → FINISH).
 * Slot ids are the catalogue's shared slot vocabulary; ids listed here that no
 * vehicle has yet (sidePanels, wheels, finish…) keep their zone visible but
 * unavailable until a vehicle's catalogue adds that slot.
 */
export const BUILD_ZONES: BuildZone[] = [
  { id: 'tank', label: 'TANK', descriptor: 'COLOUR. CHARACTER. ATTITUDE.', glyph: 'body', slots: ['tank'], paint: true, rail: true },
  { id: 'front', label: 'FRONT', descriptor: 'SEE AND BE SEEN.', glyph: 'lighting', slots: ['headlight', 'frontFender'], rail: true },
  { id: 'cockpit', label: 'COCKPIT', descriptor: 'WHERE YOUR HANDS LIVE.', glyph: 'cockpit', slots: ['handlebar', 'mirrors'], rail: true },
  { id: 'seat', label: 'SEAT', descriptor: 'LEATHER AND POSTURE.', glyph: 'seat', slots: ['seat'], rail: true },
  { id: 'midBody', label: 'MID-BODY', descriptor: 'PANELS AND ENGINE DRESS.', glyph: 'midBody', slots: ['sidePanels', 'engineCovers'], rail: true },
  { id: 'rear', label: 'REAR', descriptor: 'STANCE FROM BEHIND.', glyph: 'rear', slots: ['rearFender', 'tailLight'], rail: true },
  { id: 'wheels', label: 'WHEELS', descriptor: 'ROLLING STOCK.', glyph: 'wheel', slots: ['wheels'], rail: true },
  { id: 'details', label: 'DETAILS', descriptor: 'FINISH IS EVERYTHING.', glyph: 'detail', slots: ['exhaust'], rail: true },
  { id: 'finish', label: 'FINISH', descriptor: 'THE LAST COAT.', glyph: 'finish', slots: ['finish'], rail: true },
  { id: 'luggage', label: 'LUGGAGE', descriptor: 'CARRY THE LONG ROAD.', glyph: 'luggage', slots: ['luggage'], rail: false },
]

export const PART_CATEGORY_META: Record<PartCategory, CategoryMeta> = {
  lighting: { id: 'lighting', label: 'LIGHTING', descriptor: 'Headlights, indicators, tail.' },
  cockpit: { id: 'cockpit', label: 'COCKPIT', descriptor: 'Bars, grips, mirrors, gauges.' },
  body: { id: 'body', label: 'BODY', descriptor: 'Tanks, fenders, panels.', image: { src: '/assets/parts/body.png', focus: '50% 45%' } },
  seat: { id: 'seat', label: 'SEAT', descriptor: 'Solo, bench, pillion.', image: { src: '/assets/parts/seat.png', focus: '50% 55%' } },
  detail: { id: 'detail', label: 'DETAIL', descriptor: 'Badges, trim, finish.', image: { src: '/assets/parts/detail.png', focus: '50% 40%' } },
  luggage: { id: 'luggage', label: 'LUGGAGE', descriptor: 'Bags, racks, tank bags.', image: { src: '/assets/parts/luggage.png', focus: '55% 45%' } },
  rear: { id: 'rear', label: 'REAR', descriptor: 'Tail lights, fenders.', image: { src: '/assets/parts/rear.png', focus: '55% 45%' } },
  wheel: { id: 'wheel', label: 'WHEEL', descriptor: 'Wheels and tyres.', image: { src: '/assets/parts/wheel.png', focus: '60% 45%' } },
}
