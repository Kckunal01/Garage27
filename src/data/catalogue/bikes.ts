import type { Bike, BikeColour } from '@/types/catalogue'

/**
 * LOCAL SEED CATALOGUE — development + vertical-slice fallback.
 *
 * Production reads the same shapes from Supabase (see supabase/migrations).
 * Prices below are INDICATIVE placeholders pending Garage 27 approval, which is
 * why every customer-facing figure is labelled "ESTIMATED BUILD VALUE".
 * Do not add bikes here that Garage 27 cannot actually build.
 */

export const bikes: Bike[] = [
  {
    id: 'bike-re-classic-350',
    slug: 'royal-enfield-classic-350',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    name: 'CLASSIC 350',
    status: 'active',
    basePrice: 19_300_000,
    summary: 'The vertical-slice build: full interactive 3D bay, every slot live.',
    silhouette: 'roadster',
    model3d: { kind: 'procedural', ref: 'rig-roadster-v1', approxKb: 0 },
    defaultColourId: 'col-classic-gunmetal',
    slots: [
      { id: 'headlight', category: 'lighting', label: 'HEADLIGHT', defaultOptionId: 'opt-headlight-stock' },
      { id: 'handlebar', category: 'cockpit', label: 'HANDLEBAR', defaultOptionId: 'opt-bar-stock' },
      { id: 'tank', category: 'body', label: 'TANK', defaultOptionId: 'opt-tank-teardrop' },
      { id: 'seat', category: 'seat', label: 'SEAT', defaultOptionId: 'opt-seat-stock' },
      { id: 'exhaust', category: 'detail', label: 'EXHAUST', defaultOptionId: 'opt-exhaust-chrome' },
      { id: 'luggage', category: 'luggage', label: 'LUGGAGE', defaultOptionId: 'opt-luggage-none', optional: true },
      { id: 'rearFender', category: 'rearWheel', label: 'REAR FENDER', defaultOptionId: 'opt-fender-stock' },
    ],
    hotspots: [
      { slot: 'headlight', category: 'lighting', label: 'LIGHTING', position: [0.8, 1.02, 0] },
      { slot: 'handlebar', category: 'cockpit', label: 'COCKPIT', position: [0.6, 1.26, 0.28] },
      { slot: 'tank', category: 'body', label: 'BODY', position: [0.18, 1.08, 0.14] },
      { slot: 'seat', category: 'seat', label: 'SEAT', position: [-0.3, 0.98, 0.1] },
      { slot: 'exhaust', category: 'detail', label: 'DETAIL', position: [-0.3, 0.42, 0.24] },
      { slot: 'luggage', category: 'luggage', label: 'LUGGAGE', position: [-0.6, 0.78, 0.26] },
      { slot: 'rearFender', category: 'rearWheel', label: 'REAR WHEEL', position: [-0.86, 0.72, 0.05] },
    ],
    camera: { position: [2.4, 1.3, 2.6], target: [0, 0.65, 0], minDistance: 2.2, maxDistance: 5.2 },
  },
  {
    id: 'bike-jawa-42',
    slug: 'jawa-42',
    brand: 'Jawa',
    model: '42',
    name: 'JAWA 42',
    status: 'preview-only',
    basePrice: 19_800_000,
    summary: 'Interactive 3D still in the workshop. Static preview and custom quote available now.',
    silhouette: 'bobber',
    slots: [],
    hotspots: [],
    camera: { position: [2.4, 1.3, 2.6], target: [0, 0.65, 0], minDistance: 2.2, maxDistance: 5.2 },
  },
  {
    id: 'bike-yezdi-roadster',
    slug: 'yezdi-roadster',
    brand: 'Yezdi',
    model: 'Roadster',
    name: 'ROADSTER',
    status: 'coming-soon',
    basePrice: 20_900_000,
    summary: 'Coming to the build bay.',
    silhouette: 'scrambler',
    slots: [],
    hotspots: [],
    camera: { position: [2.4, 1.3, 2.6], target: [0, 0.65, 0], minDistance: 2.2, maxDistance: 5.2 },
  },
]

export const colours: BikeColour[] = [
  {
    id: 'col-classic-gunmetal',
    bikeId: 'bike-re-classic-350',
    name: 'GUNMETAL GREY',
    swatch: '#3a3d40',
    material: { color: '#3a3d40', metalness: 0.55, roughness: 0.38, clearcoat: 0.6, accent: '#b9b2a4' },
    priceDelta: 0,
    status: 'active',
  },
  {
    id: 'col-classic-oxblood',
    bikeId: 'bike-re-classic-350',
    name: 'OXBLOOD',
    swatch: '#5e1414',
    material: { color: '#5e1414', metalness: 0.4, roughness: 0.3, clearcoat: 0.9, accent: '#d8b06a' },
    priceDelta: 1_200_000,
    status: 'active',
  },
  {
    id: 'col-classic-olive',
    bikeId: 'bike-re-classic-350',
    name: 'WORKSHOP OLIVE',
    swatch: '#4a4a32',
    material: { color: '#4a4a32', metalness: 0.15, roughness: 0.72, clearcoat: 0.1, accent: '#e8dcc0' },
    priceDelta: 900_000,
    status: 'active',
  },
  {
    id: 'col-classic-midnight',
    bikeId: 'bike-re-classic-350',
    name: 'MIDNIGHT GLOSS',
    swatch: '#0d0d10',
    material: { color: '#0d0d10', metalness: 0.3, roughness: 0.18, clearcoat: 1, accent: '#c1272d' },
    priceDelta: 1_500_000,
    status: 'active',
  },
  {
    id: 'col-jawa-black',
    bikeId: 'bike-jawa-42',
    name: 'ALL BLACK',
    swatch: '#101010',
    material: { color: '#101010', metalness: 0.3, roughness: 0.3 },
    priceDelta: 0,
    status: 'active',
  },
]
