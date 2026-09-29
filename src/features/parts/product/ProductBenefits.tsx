import type { Part } from '@/types/catalogue'

/** The part's three or four benefits, straight from its catalogue record. */
export function ProductBenefits({ part }: { part: Part }) {
  const benefits = part.page?.benefits ?? []
  if (!benefits.length) return null
  return (
    <section className="pben" aria-label="Why this part">
      <ul className="pben__list">
        {benefits.map((b, i) => (
          <li key={b.title} className="pben__item">
            <span className="pben__n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="pben__title">{b.title}</p>
            <p className="pben__text">{b.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
