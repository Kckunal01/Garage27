import { BUILD_ZONES } from '@/data/catalogue'
import type { BuildZone } from '@/types/catalogue'
import type { BikeBundle } from './engine'

/** Zone → which of its slots this vehicle actually has. */
export function zoneSlots(zone: BuildZone, bundle: BikeBundle) {
  return bundle.bike.slots.filter((s) => zone.slots.includes(s.id))
}

/** A zone is live on a vehicle when it has one of the zone's slots (or paint to choose). */
export function isZoneAvailable(zone: BuildZone, bundle: BikeBundle) {
  if (zone.paint && bundle.colours.some((c) => c.status === 'active')) return true
  return zoneSlots(zone, bundle).length > 0
}

export function zoneForSlot(slotId: string): BuildZone | undefined {
  return BUILD_ZONES.find((z) => z.slots.includes(slotId))
}

export function getZone(id: string | null): BuildZone | undefined {
  return BUILD_ZONES.find((z) => z.id === id)
}

/** First live zone in rail order — where a fresh build opens. */
export function firstZone(bundle: BikeBundle): string | null {
  return BUILD_ZONES.find((z) => isZoneAvailable(z, bundle))?.id ?? null
}

/** Every slot on a vehicle must belong to a zone, or it could never be edited. */
export function unzonedSlots(bundle: BikeBundle) {
  return bundle.bike.slots.filter((s) => !zoneForSlot(s.id)).map((s) => s.id)
}

/** Where a slot sits on the bike, e.g. FRONT · HEADLIGHT (just FRONT when they match). */
export function slotWhere(slotId: string, slotLabel: string): string {
  return [zoneForSlot(slotId)?.label ?? slotLabel, slotLabel].filter((x, i, all) => all.indexOf(x) === i).join(' · ')
}
