import Image from 'next/image'
import type { ReactNode } from 'react'

/** The clean Build plate (851×1848). The bike is never in it — the 3D engine stands it on this floor. */
export const BUILD_ENVIRONMENT = '/assets/environments/build-base.png'

/**
 * The Garage 27 build bay: the supplied environment photograph, full-bleed
 * behind the header, with the page title set into the garage. Every Build
 * stage (picker, editor, review) happens inside it.
 */
export function BuildEnvironment({ stage, title = true, head, children }: { stage: string; title?: boolean; head?: ReactNode; children: ReactNode }) {
  return (
    <div className={`bbay bbay--${stage}`}>
      <div className="bbay__env" aria-hidden="true">
        <Image className="bbay__env-img" src={BUILD_ENVIRONMENT} alt="" fill sizes="100vw" quality={75} preload />
        <div className="bbay__env-shade" />
      </div>
      {title && (
        <header className="bbay__head">
          <h1 className="bbay__title">BUILD YOUR BIKE</h1>
          <p className="bbay__sub">TURN YOUR DREAM INTO YOUR BIKE.</p>
          {head}
        </header>
      )}
      {children}
    </div>
  )
}
