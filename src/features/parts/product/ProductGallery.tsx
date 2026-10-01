'use client'

import Image from 'next/image'
import { useState, type CSSProperties } from 'react'
import { CategoryPhoto } from '../CategoryPhoto'
import type { CategoryMeta } from '@/types/catalogue'

export interface GalleryImage {
  src: string
  alt: string
}

interface Shot {
  src: string
  alt: string
  /** CSS object-position, and how far the frame is pushed in on it. */
  focus?: string
  zoom?: number
}

/**
 * Stand-in framings of the category photograph, used to fill the four slots
 * until a product has its own photographs (Garage 27 will replace them).
 */
const STANDIN_CROPS: { focus?: string; zoom: number }[] = [
  { zoom: 1 },
  { focus: '30% 45%', zoom: 1.7 },
  { focus: '70% 40%', zoom: 1.7 },
  { focus: '50% 80%', zoom: 1.5 },
]

/** The product's photos first (up to four), then category-photo framings to fill four slots. */
function shotsFor(images: GalleryImage[], fallback: CategoryMeta): Shot[] {
  const own: Shot[] = images.slice(0, 4).map((i) => ({ src: i.src, alt: i.alt }))
  const photo = fallback.image
  if (!photo) return own
  const fill = STANDIN_CROPS.slice(own.length).map((c, i) => ({
    src: photo.src,
    alt: `${fallback.label.toLowerCase()} — photo ${own.length + i + 1}`,
    focus: c.focus ?? photo.focus ?? '50% 50%',
    zoom: c.zoom,
  }))
  return [...own, ...fill].slice(0, 4)
}

const frame = (s: Shot): CSSProperties => ({ objectPosition: s.focus ?? '50% 50%', transform: s.zoom && s.zoom !== 1 ? `scale(${s.zoom})` : undefined, transformOrigin: s.focus ?? '50% 50%' })

/**
 * Four photographs: the open one large, and four small boxes below it that
 * open each one. Product photographs come first; until a product has four,
 * framings of its category photograph fill the remaining boxes. `single`
 * shows just the first photo (the specifications section).
 */
export function ProductGallery({ images, fallback, single }: { images: GalleryImage[]; fallback: CategoryMeta; single?: boolean }) {
  const shots = shotsFor(images, fallback).slice(0, single ? 1 : 4)
  const [active, setActive] = useState(0)
  const current = shots[active]
  return (
    <div className="pgal">
      <div className="pgal__main">
        {current ? (
          <Image key={active} className="pgal__img" src={current.src} alt={current.alt} fill sizes="(width < 768px) 100vw, 55vw" quality={80} preload={active === 0} style={frame(current)} />
        ) : (
          <CategoryPhoto meta={fallback} className="pgal__photo" sizes="(width < 768px) 100vw, 55vw" eager />
        )}
      </div>
      {shots.length > 1 && (
        <div className="pgal__rail" role="group" aria-label="Product photos">
          {shots.map((s, i) => (
            <button key={i} type="button" className={`pgal__thumb${i === active ? ' is-active' : ''}`} aria-pressed={i === active} aria-label={`Show photo ${i + 1} of ${shots.length}`} onClick={() => setActive(i)}>
              <Image src={s.src} alt="" fill sizes="96px" quality={60} style={frame(s)} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
