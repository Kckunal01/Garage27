'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'
import { PART_CATEGORY_META } from '@/data/catalogue'
import type { Part } from '@/types/catalogue'
import { buyNowHref } from './buy-now'
import { CategoryPhoto } from './CategoryPhoto'
import { PartPrice } from './PartPrice'

/** A part on its category shelf. The one purchase action is BUY NOW (straight to checkout, quantity 1). */
export function PartCard({ part, image, eager }: { part: Part; image?: string; eager?: boolean }) {
  const inStock = part.status === 'active' && part.stock > 0
  return (
    <article className="pcard">
      <Link href={`/parts/${part.slug}`} className="pcard__link">
        <div className="pcard__media">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised at delivery size
            <img className="pcard__img" src={image} alt={part.images[0]?.alt ?? part.name} loading={eager ? 'eager' : 'lazy'} decoding="async" />
          ) : (
            <CategoryPhoto meta={PART_CATEGORY_META[part.category]} sizes="(width < 768px) 50vw, 25vw" eager={eager} />
          )}
        </div>
        <div className="pcard__body">
          <h3 className="pcard__name">{part.name}</h3>
        </div>
      </Link>
      <div className="pcard__foot">
        <PartPrice part={part} className="pcard__price" />
        {inStock ? (
          <Link
            href={buyNowHref(part.slug)}
            className="pcard__buy"
            onClick={() => track('buy_now', { part: part.id, category: part.category, surface: 'card', quantity: 1 })}
            aria-label={`Buy ${part.name} now`}
          >
            BUY NOW
          </Link>
        ) : (
          <span className="pcard__soldout">SOLD OUT</span>
        )}
      </div>
    </article>
  )
}
