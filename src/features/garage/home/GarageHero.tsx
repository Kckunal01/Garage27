import Image from 'next/image'
import type { ReactNode } from 'react'
import { ENVIRONMENTS } from '@/lib/environments'

/** The supplied production environment. One file, one optimised URL (both uses share src/sizes/quality). */
export const HOME_BASE_IMAGE = ENVIRONMENTS.garageNight

const imageProps = { src: HOME_BASE_IMAGE, fill: true, sizes: '(min-aspect-ratio: 5/8) 60vh, 100vw', quality: 90 } as const

/**
 * Full-viewport environmental hero. On phones the photograph fills the
 * screen exactly as in the reference; on wider screens it stands
 * full-height in the centre with the same file blurred behind it.
 */
export function GarageHero({ children }: { children: ReactNode }) {
  return (
    <section className="ghero" aria-labelledby="ghero-title">
      <div className="ghero__media" aria-hidden="true">
        <div className="ghero__fill">
          <Image {...imageProps} alt="" className="ghero__fill-img" loading="lazy" />
        </div>
        <div className="ghero__frame">
          <Image {...imageProps} alt="" className="ghero__img" loading="eager" fetchPriority="high" />
        </div>
        <div className="ghero__shade" />
      </div>
      {children}
    </section>
  )
}

/** Top-left stacked brand statement. */
export function GarageHeroStatement() {
  return (
    <p className="ghero__statement">
      <span>BUILT</span>
      <span>DIFFERENT.</span>
      <span>ALWAYS.</span>
      <span className="ghero__dash" aria-hidden="true" />
    </p>
  )
}
