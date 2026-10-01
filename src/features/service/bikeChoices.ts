import type { Bike } from '@/types/catalogue'

export interface BikeChoiceGroup {
  /** Manufacturer, e.g. ROYAL ENFIELD. */
  brand: string
  /** label: the model as shown (Classic 350); value: manufacturer + model, as stored (Royal Enfield Classic 350). */
  options: { label: string; value: string }[]
}

const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)(\S)/g, (_, sep: string, c: string) => sep + c.toUpperCase()).replace(/\bX\b/gi, 'X')

/** The service form's bike list: the catalogue's active motorcycles, grouped by manufacturer, in catalogue order. */
export function bikeChoices(bikes: Bike[]): BikeChoiceGroup[] {
  const groups: BikeChoiceGroup[] = []
  for (const b of bikes.filter((x) => x.status === 'active')) {
    const brand = b.brand.toUpperCase()
    let g = groups.find((x) => x.brand === brand)
    if (!g) groups.push((g = { brand, options: [] }))
    g.options.push({ label: titleCase(b.name), value: `${b.brand} ${b.model}` })
  }
  return groups
}
