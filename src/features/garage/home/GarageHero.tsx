import Image from 'next/image'
import type { ReactNode } from 'react'

/** The supplied production environment. One file; next/image serves AVIF/WebP at device width. */
export const HOME_BASE_IMAGE = '/assets/environments/garage27-home-base.png'

/**
 * Full-viewport environmental hero. The photograph (bike, building, signage,
 * neon, wet ground) is the composition; the interface sits on top of it.
 * Framing is tuned per breakpoint with --hero-focus-* in home.css.
 */
export function GarageHero({ children }: { children: ReactNode }) {
  return (
    <section className="ghero" aria-labelledby="ghero-title">
      <div className="ghero__media" aria-hidden="true">
        <Image className="ghero__img" src={HOME_BASE_IMAGE} alt="" fill sizes="100vw" quality={90} loading="eager" fetchPriority="high" />
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
      <span className="ghero__dash" aria-hidden="true">
        —
      </span>
    </p>
  )
}
