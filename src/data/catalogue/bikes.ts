import type { Bike, BikeColour } from '@/types/catalogue'

/**
 * LOCAL SEED CATALOGUE — the 16 motorcycles of the Build landing (Choose your
 * bike), in Garage 27's order. Two are interactive in the 3D bay (Classic 350,
 * Jawa 42, on the procedural TEST rig); the rest open the bay's preview +
 * quote path until their 3D rigs land.
 *
 * Production reads the same shapes from Supabase (see supabase/migrations).
 * Prices below are INDICATIVE placeholders pending Garage 27 approval, which is
 * why every customer-facing figure is labelled "ESTIMATED BUILD VALUE". Models
 * without an approved price carry no basePrice: the bay shows PRICE ON REQUEST.
 * Images: set `previewImage` (featured, large) and `thumbnail` (catalogue card)
 * when photographs are delivered; until then the line drawing stands in.
 * Do not add bikes here that Garage 27 cannot actually build.
 */

/** Camera for bikes shown on the procedural roadster rig or its preview. */
const ROADSTER_CAMERA: Bike['camera'] = { position: [2.9, 1.45, 3.3], target: [0, 0.62, 0], minDistance: 2.4, maxDistance: 6 }

/** A catalogue model with no 3D rig yet: selectable, opens preview + quote. */
function previewModel(b: Pick<Bike, 'id' | 'slug' | 'brand' | 'model' | 'name' | 'silhouette'> & Partial<Pick<Bike, 'tagline' | 'basePrice'>>): Bike {
  return { ...b, status: 'active', summary: '', defaultColourId: `col-${b.id.replace(/^bike-/, '')}-1`, slots: [], hotspots: [], camera: ROADSTER_CAMERA }
}

export const bikes: Bike[] = [
  {
    id: 'bike-re-classic-350',
    slug: 'royal-enfield-classic-350',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    name: 'CLASSIC 350',
    tagline: 'Timeless. Iconic. Yours.',
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
      { slot: 'exhaust', category: 'detail', label: 'DETAIL', position: [0.02, 0.34, 0.22] },
      { slot: 'luggage', category: 'luggage', label: 'LUGGAGE', position: [-0.5, 0.5, 0.3] },
      { slot: 'rearFender', category: 'rearWheel', label: 'REAR WHEEL', position: [-0.86, 0.72, 0.05] },
    ],
    camera: ROADSTER_CAMERA,
  },
  previewModel({ id: 'bike-re-bullet-350', slug: 'royal-enfield-bullet-350', brand: 'Royal Enfield', model: 'Bullet 350', name: 'BULLET 350', silhouette: 'roadster' }),
  previewModel({ id: 'bike-re-hunter-350', slug: 'royal-enfield-hunter-350', brand: 'Royal Enfield', model: 'Hunter 350', name: 'HUNTER 350', silhouette: 'roadster' }),
  previewModel({ id: 'bike-re-meteor-350', slug: 'royal-enfield-meteor-350', brand: 'Royal Enfield', model: 'Meteor 350', name: 'METEOR 350', silhouette: 'roadster' }),
  previewModel({ id: 'bike-re-goan-classic-350', slug: 'royal-enfield-goan-classic-350', brand: 'Royal Enfield', model: 'Goan Classic 350', name: 'GOAN CLASSIC 350', silhouette: 'bobber' }),
  previewModel({ id: 'bike-re-interceptor-650', slug: 'royal-enfield-interceptor-650', brand: 'Royal Enfield', model: 'Interceptor 650', name: 'INTERCEPTOR 650', silhouette: 'roadster' }),
  previewModel({ id: 'bike-re-super-meteor-650', slug: 'royal-enfield-super-meteor-650', brand: 'Royal Enfield', model: 'Super Meteor 650', name: 'SUPER METEOR 650', silhouette: 'roadster' }),
  {
    id: 'bike-jawa-42',
    slug: 'jawa-42',
    brand: 'Jawa',
    model: '42',
    name: 'JAWA 42',
    status: 'active',
    basePrice: 19_800_000,
    summary: 'Second vehicle on the same engine: its own slots, stock parts and compatible upgrades.',
    silhouette: 'bobber',
    // Same procedural test rig as the Classic until the production GLB lands.
    // No BODY slot on this bike, so its tank is a fixed stock node.
    model3d: { kind: 'procedural', ref: 'rig-roadster-v1', approxKb: 0, fixedNodes: { 'bike.tank': 'tank-teardrop' } },
    defaultColourId: 'col-jawa-black',
    slots: [
      { id: 'headlight', category: 'lighting', label: 'HEADLIGHT', defaultOptionId: 'opt-jawa-headlight-stock' },
      { id: 'handlebar', category: 'cockpit', label: 'HANDLEBAR', defaultOptionId: 'opt-jawa-bar-stock' },
      { id: 'seat', category: 'seat', label: 'SEAT', defaultOptionId: 'opt-jawa-seat-stock' },
      { id: 'exhaust', category: 'detail', label: 'EXHAUST', defaultOptionId: 'opt-jawa-exhaust-stock' },
      { id: 'rearFender', category: 'rearWheel', label: 'REAR FENDER', defaultOptionId: 'opt-jawa-fender-stock' },
    ],
    hotspots: [
      { slot: 'headlight', category: 'lighting', label: 'LIGHTING', position: [0.8, 1.02, 0] },
      { slot: 'handlebar', category: 'cockpit', label: 'COCKPIT', position: [0.6, 1.26, 0.28] },
      { slot: 'seat', category: 'seat', label: 'SEAT', position: [-0.3, 0.98, 0.1] },
      { slot: 'exhaust', category: 'detail', label: 'DETAIL', position: [0.02, 0.34, 0.22] },
      { slot: 'rearFender', category: 'rearWheel', label: 'REAR WHEEL', position: [-0.86, 0.72, 0.05] },
    ],
    camera: ROADSTER_CAMERA,
  },
  previewModel({ id: 'bike-jawa-350', slug: 'jawa-350', brand: 'Jawa', model: '350', name: 'JAWA 350', silhouette: 'roadster' }),
  previewModel({ id: 'bike-jawa-42-bobber', slug: 'jawa-42-bobber', brand: 'Jawa', model: '42 Bobber', name: '42 BOBBER', silhouette: 'bobber' }),
  previewModel({ id: 'bike-jawa-perak', slug: 'jawa-perak', brand: 'Jawa', model: 'Perak', name: 'PERAK', silhouette: 'bobber' }),
  // Indicative placeholder price carried over from the original seed.
  previewModel({ id: 'bike-yezdi-roadster', slug: 'yezdi-roadster', brand: 'Yezdi', model: 'Roadster', name: 'ROADSTER', silhouette: 'scrambler', basePrice: 20_900_000 }),
  previewModel({ id: 'bike-yezdi-classic', slug: 'yezdi-classic', brand: 'Yezdi', model: 'Classic', name: 'CLASSIC', silhouette: 'roadster' }),
  previewModel({ id: 'bike-yezdi-scrambler', slug: 'yezdi-scrambler', brand: 'Yezdi', model: 'Scrambler', name: 'SCRAMBLER', silhouette: 'scrambler' }),
  previewModel({ id: 'bike-triumph-speed-400', slug: 'triumph-speed-400', brand: 'Triumph', model: 'Speed 400', name: 'SPEED 400', silhouette: 'roadster' }),
  previewModel({ id: 'bike-triumph-scrambler-400x', slug: 'triumph-scrambler-400-x', brand: 'Triumph', model: 'Scrambler 400 X', name: 'SCRAMBLER 400 X', silhouette: 'scrambler' }),
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
    name: 'GLOSS BLACK',
    swatch: '#101010',
    material: { color: '#101010', metalness: 0.3, roughness: 0.22, clearcoat: 1, accent: '#d6b36e' },
    priceDelta: 0,
    status: 'active',
  },
  {
    id: 'col-jawa-oxblood',
    bikeId: 'bike-jawa-42',
    name: 'OXBLOOD',
    swatch: '#5e1414',
    material: { color: '#5e1414', metalness: 0.4, roughness: 0.3, clearcoat: 0.9, accent: '#d8b06a' },
    priceDelta: 1_200_000,
    status: 'active',
  },

  ...factoryPalettes(),
]

/**
 * Factory / market colours for the catalogue models, by their published names
 * (manufacturer and Indian launch coverage, 2023–2026). Swatch hex values are
 * approximations of each paint for on-screen swatches; two-tone schemes carry
 * the second tone as `accent`. No surcharge is claimed (priceDelta 0).
 */
function factoryPalettes(): BikeColour[] {
  type Paint = [name: string, hex: string, accent?: string, finish?: 'matt']
  const PALETTES: Record<string, Paint[]> = {
    'bike-re-bullet-350': [
      ['MILITARY RED', '#8c1f22'],
      ['MILITARY BLACK', '#17171a'],
      ['MILITARY SILVER RED', '#9b2226', '#c0c2c4'],
      ['MILITARY SILVER BLACK', '#17171a', '#c0c2c4'],
      ['STANDARD MAROON', '#5a1420', '#d6b36e'],
      ['STANDARD BLACK', '#0f0f11', '#d6b36e'],
      ['BATTALION BLACK', '#121213'],
      ['BLACK GOLD', '#121110', '#c9a24a'],
    ],
    'bike-re-hunter-350': [
      ['RIO WHITE', '#e9e6df'],
      ['TOKYO BLACK', '#141416'],
      ['LONDON RED', '#9e1b22'],
      ['DAPPER GREY', '#8a8c8e'],
      ['REBEL BLUE', '#1f4e8c'],
      ['FACTORY BLACK', '#1b1b1c'],
      ['GRAPHITE GREY', '#4a4d52'],
    ],
    'bike-re-meteor-350': [
      ['FIREBALL ORANGE', '#d4581e'],
      ['FIREBALL GREY', '#6b6e72'],
      ['STELLAR MATT GREY', '#55585c', undefined, 'matt'],
      ['STELLAR MARINE BLUE', '#1d3557'],
      ['AURORA RETRO GREEN', '#3f5a3c'],
      ['AURORA RED', '#8c1c1c'],
      ['SUPERNOVA BLACK', '#111113'],
    ],
    'bike-re-goan-classic-350': [
      ['PURPLE HAZE', '#5b3a73'],
      ['SHACK BLACK', '#151516'],
      ['RAVE RED', '#b01e2a'],
      ['TRIP TEAL', '#1f7a7a'],
    ],
    'bike-re-interceptor-650': [
      ['BARCELONA BLUE', '#1f5fa8'],
      ['BLACK RAY', '#151516'],
      ['CALI GREEN', '#5c7d4d'],
      ['CANYON RED', '#7c1f1f'],
      ['MARK 2', '#c9ccd1'],
      ['SUNSET STRIP', '#c8643b', '#efe8dc'],
    ],
    'bike-re-super-meteor-650': [
      ['ASTRAL BLACK', '#111113'],
      ['ASTRAL BLUE', '#1d3b6e'],
      ['ASTRAL GREEN', '#2f4f3a'],
      ['INTERSTELLAR GREY', '#5f6368', '#111113'],
      ['INTERSTELLAR GREEN', '#3a5a45', '#111113'],
      ['CELESTIAL RED', '#9b1c22', '#e8e2d4'],
      ['CELESTIAL BLUE', '#2a5b9b', '#e8e2d4'],
    ],
    'bike-jawa-350': [
      ['MAROON', '#5a1420'],
      ['ORANGE', '#d2691e'],
      ['BLACK', '#111112'],
      ['WHITE', '#ecebe6'],
      ['OBSIDIAN BLACK', '#0c0c0e'],
      ['GREY', '#6e7074'],
      ['DEEP FOREST', '#24402f'],
    ],
    'bike-jawa-42-bobber': [
      ['MYSTIC COPPER', '#8a5a3b'],
      ['MOONSTONE WHITE', '#e6e3dc'],
      ['JASPER RED', '#8e1e22', '#151515'],
    ],
    'bike-jawa-perak': [['STEALTH', '#1b1b1d', '#55585c', 'matt']],
    'bike-yezdi-roadster': [
      ['SHARKSKIN BLUE', '#5d7fa3'],
      ['SMOKE GREY', '#6b6d70'],
      ['BLOODRUSH MAROON', '#5b1a1f'],
      ['SAVAGE GREEN', '#3e5a36'],
      ['SHADOW BLACK', '#141414', undefined, 'matt'],
    ],
    'bike-yezdi-scrambler': [
      ['FIRE ORANGE', '#e0601c'],
      ['OUTLAW OLIVE', '#5b5d3a'],
      ['YELLING YELLOW', '#e8b923'],
      ['MIDNIGHT BLUE', '#1b2a4a'],
      ['MEAN GREEN', '#3f7a3a'],
      ['REBEL RED', '#b3202a'],
    ],
    'bike-triumph-speed-400': [
      ['RACING RED / STORM GREY', '#b3141d', '#4c4f54'],
      ['PHANTOM BLACK / STORM GREY', '#111113', '#4c4f54'],
      ['CASPIAN BLUE / STORM GREY', '#1d4f7a', '#4c4f54'],
      ['PEARL METALLIC WHITE / PHANTOM BLACK', '#ece9e2', '#111113'],
    ],
    'bike-triumph-scrambler-400x': [
      ['MATT KHAKI GREEN / FUSION WHITE', '#6b6a45', '#e9e6dd', 'matt'],
      ['CARNIVAL RED / PHANTOM BLACK', '#b3151d', '#111113'],
      ['PHANTOM BLACK / SILVER ICE', '#111113', '#c0c4c8'],
    ],
  }
  // No published Yezdi Classic palette was found: the Yezdi Roadster's is the
  // closest existing catalogue data, used until Garage 27 confirms the Classic's.
  PALETTES['bike-yezdi-classic'] = PALETTES['bike-yezdi-roadster']!

  return Object.entries(PALETTES).flatMap(([bikeId, paints]) =>
    paints.map(([name, hex, accent, finish], i) => ({
      id: `col-${bikeId.replace(/^bike-/, '')}-${i + 1}`,
      bikeId,
      name,
      swatch: hex,
      material: finish === 'matt' ? { color: hex, metalness: 0.2, roughness: 0.7, clearcoat: 0.1, accent } : { color: hex, metalness: 0.35, roughness: 0.25, clearcoat: 0.9, accent },
      priceDelta: 0,
      status: 'active' as const,
    })),
  )
}
