'use client'

import { useEffect, useState } from 'react'
import { CONTACT } from '@/components/navigation/nav-config'
import type { LegalBlock, LegalTopic } from '@/lib/legal'

const num = (i: number) => String(i + 1).padStart(2, '0')

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p>{block}</p>
  if ('list' in block)
    return (
      <ul className="ldoc__bullets">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  return (
    <address className="ldoc__contact">
      {block.name !== false && <strong>Garage 27</strong>}
      <span>
        Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </span>
      <span>
        Phone: <a href={`tel:${CONTACT.phoneE164}`}>{CONTACT.phone}</a>
      </span>
    </address>
  )
}

/**
 * A legal document as topics: the numbered topic list on the left, ONLY the
 * selected topic on the right. Choosing a topic swaps the content in place
 * and updates the address (#topic) so a topic can be linked to directly.
 */
export function LegalDocument({ title, topics }: { title: string; topics: LegalTopic[] }) {
  const [active, setActive] = useState(0)

  // Open the topic named in the address, and follow back/forward.
  useEffect(() => {
    const sync = () => {
      const i = topics.findIndex((t) => `#${t.id}` === window.location.hash)
      if (i >= 0) setActive(i)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [topics])

  const topic = topics[active]!
  const choose = (i: number) => {
    setActive(i)
    history.replaceState(null, '', `#${topics[i]!.id}`)
  }

  return (
    <div className="ldoc">
      <nav className="ldoc__nav" aria-label={`${title} topics`}>
        <p className="ldoc__nav-title">{title.toUpperCase()}</p>
        <ol className="ldoc__topics">
          {topics.map((t, i) => (
            <li key={t.id}>
              <button type="button" className={`ldoc__topic${i === active ? ' is-active' : ''}`} aria-current={i === active ? 'true' : undefined} aria-controls="ldoc-panel" onClick={() => choose(i)}>
                <span className="ldoc__num">{num(i)}</span>
                <span className="ldoc__name">{t.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article className="ldoc__panel" id="ldoc-panel" aria-live="polite" aria-labelledby="ldoc-topic-title">
        <p className="ldoc__panel-num">{num(active)}</p>
        <h2 id="ldoc-topic-title" className="ldoc__panel-title">
          {topic.title}
        </h2>
        <div className="ldoc__body">
          {topic.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      </article>
    </div>
  )
}
