import Image from 'next/image'
import Link from 'next/link'
import type { ServiceOffering } from '@/types/catalogue'

/** Catalogue names are upper-case; the neon script only reads in title case. */
const signCase = (name: string) => name.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())

/** The sign lettering's own ampersand is illegible; set "&" in the house face. */
const signText = (name: string) =>
  signCase(name)
    .split('&')
    .flatMap((part, i) =>
      i === 0
        ? [part]
        : [
            <span key={i} className="svc-amp">
              &amp;
            </span>,
            part,
          ],
    )

/**
 * One service, as a lit panel in the garage: neon title and copy on the
 * dark left, the service photograph bleeding in from the right.
 * With `href` it is the way into the request flow; without, it labels it.
 */
export function ServiceCard({
  service,
  href,
  eager,
  onClick,
}: {
  service: ServiceOffering
  href?: string
  eager?: boolean
  onClick?: () => void
}) {
  const lines = service.pitch ?? [service.summary]
  const body = (
    <>
      {service.image && (
        <span className="svc-card__media" aria-hidden="true">
          <Image
            className="svc-card__img"
            src={service.image.src}
            alt=""
            fill
            sizes="(width < 768px) 62vw, 50vw"
            quality={75}
            loading={eager ? 'eager' : 'lazy'}
            style={{ objectPosition: service.image.focus ?? '50% 50%' }}
          />
        </span>
      )}
      <span className="svc-card__body">
        <span className="svc-card__title">{signText(service.name)}</span>
        <span className="svc-card__copy">
          {lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </span>
    </>
  )
  if (!href) return <div className="svc-card svc-card--static">{body}</div>
  return (
    <Link href={href} className="svc-card" onClick={onClick} aria-label={`${service.name}: ${lines.join(' ')} Request this service.`}>
      {body}
    </Link>
  )
}
