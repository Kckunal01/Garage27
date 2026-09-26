import Link from 'next/link'
import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import type { Bike, ShowcaseBuild } from '@/types/catalogue'

/** Showcase card: numbered, minimal metadata, one clear way into the build. */
export function BuildCard({ build, bike, image }: { build: ShowcaseBuild; bike?: Bike; image?: string }) {
  const href = build.preset ? `/build?preset=${build.id}` : `/build?bike=${build.bikeId}`
  return (
    <article className={`bcard bcard--${build.tone}`}>
      <Link href={href} className="bcard__link" aria-label={`${build.name} — open build`}>
        <div className="bcard__stage">
          <span className="bcard__number" aria-hidden="true">
            #{String(build.number).padStart(2, '0')}
          </span>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- pre-optimised showcase still
            <img className="bcard__img" src={image} alt={`${build.name}, a ${build.style.toLowerCase()} ${bike?.brand ?? ''} ${bike?.model ?? ''}`} loading="lazy" decoding="async" />
          ) : (
            <BikeSilhouette className="bcard__bike" silhouette={build.silhouette} tone={build.tone} />
          )}
        </div>
        <div className="bcard__meta">
          <p className="label">
            #{String(build.number).padStart(2, '0')} · {build.style}
          </p>
          <h3 className="bcard__name">{build.name}</h3>
          <p className="bcard__base muted">
            {bike ? `${bike.brand} ${bike.model}` : ''}
          </p>
          <p className="bcard__summary">{build.summary}</p>
          <span className="neon-link">{build.preset ? 'OPEN BUILD' : 'QUOTE THIS BUILD'}</span>
        </div>
      </Link>
    </article>
  )
}
