import Link from 'next/link'
import type { Part } from '@/types/catalogue'

/** Installation, from the part's own notes. A guide link appears only when a real guide exists. */
export function ProductInstallation({ part }: { part: Part }) {
  if (!part.installationNotes.trim()) return null
  const guide = part.page?.installationGuideUrl
  return (
    <section className="pinst" aria-labelledby="install-title">
      <div className="pinst__body">
        <h2 id="install-title" className="psec__title">
          INSTALLATION
        </h2>
        <p className="pinst__text">{part.installationNotes}</p>
      </div>
      <div className="pinst__actions">
        {guide && (
          <a className="pinst__btn" href={guide} target="_blank" rel="noopener">
            VIEW INSTALLATION GUIDE <span aria-hidden="true">↗</span>
          </a>
        )}
        <Link className="pinst__btn" href="/service?request=doorstep-installation">
          BOOK A FITTING <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
