import 'server-only'
import { cache } from 'react'
import { localCatalogue } from '@/data/catalogue'
import { getPublicSupabase } from '@/lib/supabase/public'
import { reportError } from '@/lib/server/monitoring'
import type {
  Bike,
  BikeColour,
  CatalogueSnapshot,
  ComponentOption,
  Part,
  ServiceOffering,
  ShowcaseBuild,
} from '@/types/catalogue'

export type CatalogueSource = 'supabase' | 'local'
export interface LoadedCatalogue extends CatalogueSnapshot {
  source: CatalogueSource
}

/* eslint-disable @typescript-eslint/no-explicit-any -- row mappers take untyped PostgREST rows */
const mapBike = (r: any, slots: any[]): Bike => {
  const own = slots.filter((s) => s.bike_id === r.id).sort((a, b) => a.sort_order - b.sort_order)
  return {
    id: r.id,
    slug: r.slug,
    brand: r.brand,
    model: r.model,
    name: r.name,
    status: r.status,
    basePrice: r.base_price,
    summary: r.summary,
    previewImage: r.preview_image ?? undefined,
    silhouette: r.silhouette,
    model3d: r.model3d ?? undefined,
    defaultColourId: r.default_colour_id ?? undefined,
    camera: r.camera,
    slots: own.map((s) => ({
      id: s.id,
      category: s.category,
      label: s.label,
      defaultOptionId: s.default_option_id,
      optional: s.optional,
    })),
    hotspots: own
      .filter((s) => Array.isArray(s.hotspot))
      .map((s) => ({ slot: s.id, category: s.category, label: s.label, position: s.hotspot })),
  }
}

const mapColour = (r: any): BikeColour => ({
  id: r.id,
  bikeId: r.bike_id,
  name: r.name,
  swatch: r.swatch,
  material: r.material,
  priceDelta: r.price_delta,
  status: r.status,
  previewImage: r.preview_image ?? undefined,
})

const mapOption = (r: any): ComponentOption => ({
  id: r.id,
  bikeId: r.bike_id,
  category: r.category,
  slot: r.slot_id,
  name: r.name,
  descriptor: r.descriptor,
  priceDelta: r.price_delta,
  status: r.status,
  modelAsset: r.model_asset,
  materialConfig: r.material_config ?? undefined,
  previewAsset: r.preview_asset ?? undefined,
  requires: r.requires ?? [],
  excludes: r.excludes ?? [],
  partId: r.part_id ?? undefined,
})

const mapPart = (r: any, compat: any[]): Part => ({
  id: r.id,
  slug: r.slug,
  sku: r.sku,
  name: r.name,
  brand: r.brand,
  category: r.category,
  summary: r.summary,
  description: r.description,
  price: r.price,
  currency: r.currency,
  compatibleBikeIds: compat.filter((c) => c.part_id === r.id).map((c) => c.bike_id),
  material: r.material,
  finish: r.finish,
  installationNotes: r.installation_notes,
  stock: r.stock,
  status: r.status,
  images: r.images ?? [],
})

const mapShowcase = (r: any): ShowcaseBuild => ({
  id: r.id,
  number: r.number,
  name: r.name,
  bikeId: r.bike_id,
  style: r.style,
  summary: r.summary,
  image: r.image ?? undefined,
  silhouette: r.silhouette,
  tone: r.tone,
  preset: r.preset ?? undefined,
})

const mapService = (r: any): ServiceOffering => ({
  id: r.id,
  name: r.name,
  kicker: r.kicker,
  summary: r.summary,
  includes: r.includes ?? [],
})
/* eslint-enable @typescript-eslint/no-explicit-any */

async function loadFromSupabase(): Promise<LoadedCatalogue | null> {
  const sb = getPublicSupabase()
  if (!sb) return null
  const [bikes, slots, colours, options, parts, compat, showcase, services] = await Promise.all([
    sb.from('bikes').select('*').order('sort_order'),
    sb.from('bike_slots').select('*'),
    sb.from('bike_colours').select('*').order('sort_order'),
    sb.from('build_options').select('*').order('sort_order'),
    sb.from('parts').select('*'),
    sb.from('bike_compatibility').select('*'),
    sb.from('showcase_builds').select('*').order('number'),
    sb.from('services').select('*').order('sort_order'),
  ])
  const failed = [bikes, slots, colours, options, parts, compat, showcase, services].find((r) => r.error)
  if (failed?.error) throw new Error(`catalogue: ${failed.error.message}`)
  return {
    source: 'supabase',
    bikes: (bikes.data ?? []).map((b) => mapBike(b, slots.data ?? [])),
    colours: (colours.data ?? []).map(mapColour),
    options: (options.data ?? []).map(mapOption),
    parts: (parts.data ?? []).map((p) => mapPart(p, compat.data ?? [])),
    showcase: (showcase.data ?? []).map(mapShowcase),
    services: (services.data ?? []).map(mapService),
  }
}

/**
 * Single entry point for catalogue data. Deduplicated per request via
 * React `cache`; pages add ISR `revalidate` on top.
 * Falls back to the local seed in development or if Supabase is unreachable,
 * so a catalogue outage never takes the whole garage down.
 */
export const getCatalogue = cache(async (): Promise<LoadedCatalogue> => {
  try {
    const remote = await loadFromSupabase()
    if (remote) return remote
  } catch (err) {
    reportError('supabase.catalogue', err)
  }
  return { ...localCatalogue, source: 'local' }
})

export async function getPartBySlug(slug: string) {
  const c = await getCatalogue()
  return c.parts.find((p) => p.slug === slug && p.status !== 'retired') ?? null
}
