import Link from 'next/link'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { formatINR } from '@/lib/pricing/money'
import type { Part } from '@/types/catalogue'
import { CategoryPhoto } from '../CategoryPhoto'

/** The rest of the build: parts from other categories (see lib/catalogue/related). */
export function RelatedProducts({ parts, images }: { parts: Part[]; images: Record<string, string> }) {
  if (!parts.length) return null
  return (
    <section className="prel" aria-labelledby="related-title">
      <div className="prel__head">
        <h2 id="related-title" className="psec__title">
          RELATED PRODUCTS
        </h2>
        <Link href="/parts" className="prel__more">
          EXPLORE MORE PARTS <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="prel__list">
        {parts.map((p) => {
          const meta = PART_CATEGORY_META[p.category]
          return (
            <li key={p.id}>
              <Link href={`/parts/${p.slug}`} className="prel__card">
                <span className="prel__media">
                  {images[p.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised
                    <img className="prel__img" src={images[p.id]} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <CategoryPhoto meta={meta} sizes="(width < 768px) 60vw, 25vw" />
                  )}
                </span>
                <span className="prel__cat">{meta.label}</span>
                <span className="prel__name">{p.name}</span>
                <span className="prel__foot">
                  <span className="prel__price">{formatINR(p.price)}</span>
                  <span className="prel__arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
