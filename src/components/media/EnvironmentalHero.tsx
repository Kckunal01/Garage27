import type { ReactNode } from 'react'

export type Environment = 'exterior' | 'garage' | 'workshop' | 'parts-wall' | 'build-bay' | 'editorial'

export interface HeroMedia {
  /** Optimised still (AVIF/WebP). Rendered eagerly — it is the LCP element. */
  image?: { src: string; alt: string; avif?: string }
  /** Short silent loop. The poster (image above) shows first, always. */
  video?: { webm?: string; mp4?: string }
}

interface Props {
  environment: Environment
  media?: HeroMedia
  /** Neon sign text painted onto the wall (e.g. "Garage 27"). */
  sign?: string
  /** Lights-on sequence + idle flicker (home hero). */
  ignition?: boolean
  align?: 'bottom' | 'center'
  size?: 'full' | 'tall' | 'band'
  children?: ReactNode
  foreground?: ReactNode
  className?: string
}

/**
 * Every page is a different bay of the same garage. This paints the bay:
 * concrete wall, tungsten lamp cone, neon spill, haze and wet-floor sheen —
 * procedurally, so the page is atmospheric even before photography arrives,
 * and upgrades to real stills/video by passing `media`.
 */
export function EnvironmentalHero({ environment, media, sign, ignition, align = 'bottom', size = 'tall', children, foreground, className = '' }: Props) {
  return (
    <section className={`env env--${environment} env--${size} env--${align}${ignition ? ' env--ignite' : ''} ${className}`}>
      <div className="env__backdrop" aria-hidden="true">
        {media?.image && (
          <picture>
            {media.image.avif && <source srcSet={media.image.avif} type="image/avif" />}
            <img className="env__media" src={media.image.src} alt="" fetchPriority="high" decoding="async" />
          </picture>
        )}
        {media?.video && (
          <video className="env__media env__video" autoPlay muted loop playsInline preload="none" poster={media.image?.src}>
            {media.video.webm && <source src={media.video.webm} type="video/webm" />}
            {media.video.mp4 && <source src={media.video.mp4} type="video/mp4" />}
          </video>
        )}
        {!media?.image && (
          <>
            <div className="env__wall" />
            <div className="env__detail" />
            {sign && (
              <p className="env__sign neon" translate="no">
                {sign}
              </p>
            )}
            <div className="env__lamp" />
            <div className="env__cone" />
            <div className="env__floor" />
          </>
        )}
        <div className="env__haze" />
        <div className="env__vignette" />
      </div>
      {foreground && (
        <div className="env__foreground" aria-hidden="true">
          {foreground}
        </div>
      )}
      <div className="env__content wrap">{children}</div>
    </section>
  )
}
