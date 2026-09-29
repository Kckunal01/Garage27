import Image from 'next/image'

export const SERVICE_HERO = '/assets/service/service-hero.png'

/**
 * The Service reference hero: the workshop photograph full-bleed under the
 * header, the neon SERVICE sign, then the editorial headline.
 */
export function ServiceHero({ compact }: { compact?: boolean }) {
  return (
    <section className={`svc-hero${compact ? ' svc-hero--compact' : ''}`}>
      <div className="svc-hero__media" aria-hidden="true">
        <Image className="svc-hero__img" src={SERVICE_HERO} alt="" fill sizes="100vw" quality={75} preload />
        <div className="svc-hero__shade" />
      </div>
      <div className="svc-hero__copy">
        <p className="svc-hero__neon" aria-hidden="true">
          SERVICE
        </p>
        <h1 className="svc-hero__title">
          <span className="sr-only">Service: </span>
          FROM IDEA
          <br />
          TO ROAD.
        </h1>
        {!compact && (
          <>
            <p className="svc-hero__lede">
              Expert hands. Real experience.
              <br />
              Your bike, our craft.
            </p>
            <span className="svc-hero__rule" aria-hidden="true" />
          </>
        )}
      </div>
    </section>
  )
}
