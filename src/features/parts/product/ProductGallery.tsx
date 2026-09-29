'use client'

import { useState } from 'react'
import type { CategoryMeta } from '@/types/catalogue'
import { CategoryPhoto } from '../CategoryPhoto'

export interface GalleryImage {
  src: string
  alt: string
}

/**
 * Up to four product photographs: the main frame plus a thumbnail rail (only
 * when there is more than one). No product photograph yet → the category
 * photograph stands in; nothing is ever shown broken.
 */
export function ProductGallery({ images, fallback }: { images: GalleryImage[]; fallback: CategoryMeta }) {
  const shots = images.slice(0, 4)
  const [active, setActive] = useState(0)
  const current = shots[active]
  return (
    <div className="pgal">
      <div className="pgal__main">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised at delivery size
          <img className="pgal__img" src={current.src} alt={current.alt} loading="eager" decoding="async" />
        ) : (
          <CategoryPhoto meta={fallback} className="pgal__photo" sizes="(width < 768px) 100vw, 55vw" eager />
        )}
      </div>
      {shots.length > 1 && (
        <div className="pgal__rail" role="group" aria-label="Product photos">
          {shots.map((img, i) => (
            <button key={img.src} type="button" className={`pgal__thumb${i === active ? ' is-active' : ''}`} aria-pressed={i === active} aria-label={`Photo ${i + 1}: ${img.alt}`} onClick={() => setActive(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- catalogue thumbnails */}
              <img src={img.src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
