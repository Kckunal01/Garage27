import { PartPrice } from '../PartPrice'
import type { CategoryMeta, Part } from '@/types/catalogue'
import { BuyNow } from '../BuyNow'
import { ProductGallery, type GalleryImage } from './ProductGallery'

/** Image, then (or beside it on desktop) eyebrow, name, headline, description, price and BUY NOW. */
export function ProductHero({ part, meta, number, images }: { part: Part; meta: CategoryMeta; number: number; images: GalleryImage[] }) {
  const inStock = part.status === 'active' && part.stock > 0
  const availability = !inStock ? 'SOLD OUT' : part.stock <= 3 ? `ONLY ${part.stock} LEFT` : 'IN STOCK'
  return (
    <section className="phero" aria-labelledby="product-name">
      <ProductGallery images={images} fallback={meta} />
      <div className="phero__copy">
        <p className="phero__eyebrow">
          {String(number).padStart(2, '0')} / {meta.label}
        </p>
        <h1 id="product-name" className="phero__name">
          {part.name}
        </h1>
        {part.page && (
          <p className="phero__headline">
            {part.page.headline.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
        )}
        <p className="phero__desc">{part.description}</p>
        <div className="phero__price">
          <PartPrice part={part} className="phero__amount" />
          <p className={`phero__stock${inStock ? '' : ' is-out'}`}>{availability}</p>
        </div>
        <BuyNow part={part} />
      </div>
    </section>
  )
}
