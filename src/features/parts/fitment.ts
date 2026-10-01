import type { Bike, Part } from '@/types/catalogue'

/** Parts that fit a bike (universal parts fit every bike). Retired parts never show. */
export const fitsBike = (parts: Part[], bike: string) =>
  parts.filter((p) => p.status !== 'retired' && (!bike || p.compatibleBikeIds.length === 0 || p.compatibleBikeIds.includes(bike)))

export const bikeName = (bikes: Bike[], id: string) => bikes.find((b) => b.id === id)?.name ?? ''
