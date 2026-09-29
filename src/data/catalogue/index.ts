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

/**
 * Parts categories. Each has a photograph for its tile and page. LIGHTING and
 * COCKPIT have no dedicated shot yet, so they crop into the Garage 27
 * doorstep-installation photograph (its lit headlamp and its bars).
 */
export const PART_CATEGORY_META: Record<PartCategory, CategoryMeta> = {
  lighting: { id: 'lighting', label: 'LIGHTING', descriptor: 'Headlamps, indicators and tail lights.', image: { src: '/assets/service/doorstep-installation.png', focus: '64% 31%', zoom: 2.4 } },
  cockpit: { id: 'cockpit', label: 'COCKPIT', descriptor: 'Bars, grips, mirrors and gauges.', image: { src: '/assets/service/doorstep-installation.png', focus: '53% 9%', zoom: 2.6 } },
  body: { id: 'body', label: 'BODY', descriptor: 'Tanks, fenders and panels.', image: { src: '/assets/parts/body.png', focus: '50% 45%' } },
  seat: { id: 'seat', label: 'SEAT', descriptor: 'Comfort, stance and character.', image: { src: '/assets/parts/seat.png', focus: '50% 55%' } },
  detail: { id: 'detail', label: 'DETAIL', descriptor: 'Badges, trim and the finishing touches.', image: { src: '/assets/parts/detail.png', focus: '50% 40%' } },
  luggage: { id: 'luggage', label: 'LUGGAGE', descriptor: 'Bags and racks for the long road.', image: { src: '/assets/parts/luggage.png', focus: '55% 45%' } },
  rear: { id: 'rear', label: 'REAR', descriptor: 'Tail lights, fenders and plates.', image: { src: '/assets/parts/rear.png', focus: '55% 45%' } },
  wheel: { id: 'wheel', label: 'WHEEL', descriptor: 'Wheels, rims and rubber.', image: { src: '/assets/parts/wheel.png', focus: '60% 45%' } },
}
