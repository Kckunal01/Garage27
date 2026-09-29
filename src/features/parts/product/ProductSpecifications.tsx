import type { Bike, CategoryMeta, Part } from '@/types/catalogue'
import { ProductGallery, type GalleryImage } from './ProductGallery'

/** Specification rows the catalogue actually holds — never an empty or guessed row. */
export function specRows(part: Part, bikes: Bike[]) {
  const fits = part.compatibleBikeIds.map((id) => bikes.find((b) => b.id === id)).filter((b): b is Bike => !!b)
  const rows = [
    ...(part.page?.specs ?? []),
    { label: 'Material', value: part.material },
    { label: 'Finish', value: part.finish },
    { label: 'Fitment', value: part.compatibleBikeIds.length === 0 ? 'Universal fit' : fits.map((b) => `${b.brand} ${b.model}`).join(' · ') },
    { label: 'SKU', value: part.sku },
  ]
  return rows.filter((r) => r.value && r.value.trim())
}

export function ProductSpecifications({ part, bikes, meta, image }: { part: Part; bikes: Bike[]; meta: CategoryMeta; image?: GalleryImage }) {
  const rows = specRows(part, bikes)
  return (
    <section className="pspec" aria-labelledby="specs-title">
      <div className="pspec__media" aria-hidden="true">
        <ProductGallery images={image ? [image] : []} fallback={meta} />
      </div>
      <div className="pspec__body">
        <h2 id="specs-title" className="psec__title">
          SPECIFICATIONS
        </h2>
        <dl className="pspec__table">
          {rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
