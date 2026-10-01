import Image from 'next/image'
import { PartsTicker } from './PartsTicker'

export const PARTS_HERO = '/assets/parts/parts-hero.png'

/** The Parts reference hero: the parts wall full-bleed under the header, the promises ticker just below it, the headline set low-left. */
export function PartsHero() {
  return (
    <section className="prt-hero">
      <div className="prt-hero__media" aria-hidden="true">
        <Image className="prt-hero__img" src={PARTS_HERO} alt="" fill sizes="100vw" quality={75} preload />
        <div className="prt-hero__shade" />
      </div>
      <PartsTicker />
      <div className="prt-hero__copy">
        <h1 className="prt-hero__title">
          THE DETAILS
          <br />
          MAKE THE BIKE.
        </h1>
        <p className="prt-hero__lede">
          Curated parts. Proven quality.
          <br />
          Built for your vision.
        </p>
        <span className="prt-hero__rule" aria-hidden="true" />
      </div>
    </section>
  )
}
