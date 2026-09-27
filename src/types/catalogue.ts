/**
 * Garage 27 domain model.
 *
 * Everything the visualiser, parts shop and garage showcase render is described
 * by these records. Pages never hardcode bikes, colours, slots or prices — they
 * read records shaped like this from the catalogue repository (Supabase in
 * production, the local seed in `src/data/catalogue` for development).
 */

/** Money is always stored as integer minor units (paise) to avoid float drift. */
export type Paise = number

export type AvailabilityStatus = 'active' | 'preview-only' | 'coming-soon' | 'retired'

/** Build categories, in the order the build bay presents them. */
export const BUILD_CATEGORIES = [
  'lighting',
  'cockpit',
  'body',
  'seat',
  'detail',
  'luggage',
  'rearWheel',
] as const
export type BuildCategory = (typeof BUILD_CATEGORIES)[number]

/** Parts-shop categories (the shop splits REAR and WHEEL). */
export const PART_CATEGORIES = [
  'lighting',
  'cockpit',
  'body',
  'seat',
  'detail',
  'luggage',
  'rear',
  'wheel',
] as const
export type PartCategory = (typeof PART_CATEGORIES)[number]

/**
 * A build-bay ZONE: the visual category the customer edits (TANK, FRONT,
 * COCKPIT…). Pure presentation over the engine: a zone owns catalogue SLOT
 * ids, and is live on a vehicle only when that vehicle has one of those slots
 * (or, for `paint`, active colours). Adding a slot with a listed id to a
 * vehicle lights its zone up — no page code changes.
 */
export interface BuildZone {
  id: string
  label: string
  /** Editorial line in the option panel. */
  descriptor: string
  /** Key into CategoryGlyph. */
  glyph: string
  /** Catalogue slot ids this zone edits. */
  slots: string[]
  /** The zone also carries the vehicle's paint colours. */
  paint?: boolean
  /** Shown on the category rail (otherwise reachable from its hotspot). */
  rail: boolean
}

export interface CategoryMeta {
  id: string
  label: string
  descriptor: string
}

/** A 3D material description. Kept renderer-agnostic (no three.js types). */
export interface MaterialConfig {
  color: string
  metalness: number
  roughness: number
  clearcoat?: number
  /** Optional accent (pinstripe / badge) colour. */
  accent?: string
}

/**
 * Where the geometry for a component comes from.
 * - `procedural`: a named variant built by the in-house procedural bike rig.
 *   Used for the vertical slice until production GLB files are delivered.
 * - `glb`: a node inside a GLB/glTF file (Draco/Meshopt compressed).
 * - `none`: slot intentionally left empty (e.g. "no luggage").
 */
export type ModelAsset =
  | { kind: 'procedural'; variant: string }
  | { kind: 'glb'; url: string; node?: string }
  | { kind: 'none' }

/**
 * A vehicle's 3D model. Component nodes are addressed by STABLE NAMES, never
 * mesh indexes: `bike.frame`, `bike.wheelFront`, `bike.wheelRear`,
 * `bike.engine`, `bike.tank`, `bike.seat`, `bike.headlight`, `bike.handlebar`,
 * `bike.exhaust`, `bike.luggage`, `bike.rearFender`, … (see docs/ADDING_A_BIKE.md).
 */
export interface BikeModelSource {
  kind: 'procedural' | 'glb'
  /** Procedural rig id or GLB url. */
  ref: string
  /** Approximate transfer size, used to warn / choose quality tier. */
  approxKb?: number
  /** GLB: node names whose meshes take the selected colour's material. */
  paintNodes?: string[]
  /**
   * Stock parts this vehicle has but does not expose for configuration
   * (node id → procedural variant). E.g. a bike with no BODY options still
   * needs its tank rendered.
   */
  fixedNodes?: Record<string, string>
}

export interface Hotspot {
  slot: string
  category: BuildCategory
  label: string
  position: [number, number, number]
}

export interface Bike {
  id: string
  slug: string
  /** Manufacturer, e.g. "Royal Enfield". */
  brand: string
  model: string
  /** Display name, e.g. "CLASSIC 350". */
  name: string
  year?: number
  /** Trim / variant where the catalogue needs it, e.g. "Signals". */
  variant?: string
  /** Vehicle-picker thumbnail (optimised still). Falls back to the silhouette. */
  thumbnail?: string
  status: AvailabilityStatus
  basePrice: Paise
  summary: string
  /** Static preview used when 3D is not available (and as the poster). */
  previewImage?: string
  /** Silhouette key for the procedural SVG preview. */
  silhouette: 'roadster' | 'bobber' | 'scrambler' | 'cafe'
  model3d?: BikeModelSource
  defaultColourId?: string
  /** Slots that physically exist on this bike. Only these are exposed. */
  slots: ComponentSlot[]
  hotspots: Hotspot[]
  camera: { position: [number, number, number]; target: [number, number, number]; minDistance: number; maxDistance: number }
}

export interface ComponentSlot {
  id: string
  category: BuildCategory
  label: string
  /** Option applied when the configuration is initialised. */
  defaultOptionId: string
  /** Whether the slot may be left without an option. */
  optional?: boolean
}

export interface BikeColour {
  id: string
  bikeId: string
  name: string
  swatch: string
  material: MaterialConfig
  priceDelta: Paise
  status: AvailabilityStatus
  previewImage?: string
}

export interface ComponentOption {
  id: string
  /**
   * Vehicles this option fits. Compatibility is data: the build bay only ever
   * shows an option on a vehicle listed here AND whose model has the slot.
   */
  compatibleBikeIds: string[]
  category: BuildCategory
  slot: string
  name: string
  descriptor: string
  priceDelta: Paise
  status: AvailabilityStatus
  modelAsset: ModelAsset
  /** Stable model node ids this option replaces/updates, e.g. ['bike.seat']. */
  affectedNodes: string[]
  materialConfig?: Partial<MaterialConfig>
  previewAsset?: string
  /** Option ids that must also be selected. */
  requires?: string[]
  /** Option ids that cannot be combined with this one. */
  excludes?: string[]
  /** Linked shop part, if the option is also sold standalone. */
  partId?: string
}

export interface Part {
  id: string
  slug: string
  sku: string
  name: string
  brand: string
  category: PartCategory
  summary: string
  description: string
  price: Paise
  currency: 'INR'
  /** Bike ids this part fits. Empty array = universal. */
  compatibleBikeIds: string[]
  material: string
  finish: string
  installationNotes: string
  stock: number
  status: AvailabilityStatus
  images: { src: string; alt: string }[]
}

export interface ShowcaseBuild {
  id: string
  number: number
  name: string
  bikeId: string
  style: string
  summary: string
  image?: string
  silhouette: Bike['silhouette']
  tone: 'amber' | 'red' | 'chrome' | 'olive'
  /** Configuration preset opened in the build bay. */
  preset?: BuildConfiguration
}

export interface ServiceOffering {
  id: string
  name: string
  kicker: string
  summary: string
  includes: string[]
}

/** The entire build as reconstructable JSON. Never only a screenshot. */
export interface BuildConfiguration {
  bikeId: string
  colourId: string
  /** slotId -> optionId (null when an optional slot is left empty). */
  components: Record<string, string | null>
}

export interface CatalogueSnapshot {
  bikes: Bike[]
  colours: BikeColour[]
  options: ComponentOption[]
  parts: Part[]
  showcase: ShowcaseBuild[]
  services: ServiceOffering[]
}
