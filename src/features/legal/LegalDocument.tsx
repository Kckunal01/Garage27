'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CONTACT } from '@/components/navigation/nav-config'
import type { LegalBlock, LegalTopic } from '@/lib/legal'

const num = (i: number) => String(i + 1).padStart(2, '0')

/** Sets every whole-word occurrence of `word` (any case) in bold red; the text itself is untouched. */
function mark(text: string, word?: string): ReactNode {
  if (!word) return text
  return text.split(new RegExp(`\\b(${word})\\b`, 'i')).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="ldoc__em">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

function Block({ block, em }: { block: LegalBlock; em?: string }) {
  if (typeof block === 'string') return <p>{mark(block, em)}</p>
  if ('tiers' in block)
    return (
      <ol className="ldoc__tiers" aria-label="Moneyback quality tiers">
        {block.tiers.map((t) => (
          <li key={t.tier} className={`ldoc__tier ldoc__tier--${t.tier}`}>
            <span className="ldoc__tier-num">{String(t.tier).padStart(2, '0')}</span>
            <span className="ldoc__tier-name">TIER {t.tier}</span>
            <span className="ldoc__tier-pct">{t.percent}</span>
            <span className="ldoc__tier-tag">VALUATION</span>
            <span className="ldoc__tier-text">{mark(t.text, em)}</span>
          </li>
        ))}
      </ol>
    )
  if ('list' in block)
    return (
      <ul className="ldoc__bullets">
        {block.list.map((item) => (
          <li key={item}>{mark(item, em)}</li>
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
export function LegalDocument({ title, topics, emphasis }: { title: string; topics: LegalTopic[]; emphasis?: string }) {
  const [active, setActive] = useState(0)
  const body = useRef<HTMLDivElement>(null)
  // A new topic starts at its top inside the scrolling content area.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [active])

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
                <span className="ldoc__name">{mark(t.title, emphasis)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article className="ldoc__panel" id="ldoc-panel" aria-live="polite" aria-labelledby="ldoc-topic-title">
        <p className="ldoc__panel-num">{num(active)}</p>
        <h2 id="ldoc-topic-title" className="ldoc__panel-title">
          {mark(topic.title, emphasis)}
        </h2>
        <div className="ldoc__body" ref={body} tabIndex={0} role="region" aria-label="Topic text">
          {topic.blocks.map((b, i) => (
            <Block key={i} block={b} em={emphasis} />
          ))}
        </div>
      </article>
    </div>
  )
}
