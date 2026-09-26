import type { Metadata } from 'next'
import { EnvironmentalHero } from '@/components/media/EnvironmentalHero'
import { ContactForm } from '@/features/service/ContactForm'
import { CONTACT } from '@/components/navigation/nav-config'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'About Us — People. Motorcycles. Good Times.',
  description: 'Garage 27 is a custom motorcycle workshop built on community, craftsmanship and creativity. Ideate, build, ride.',
  path: '/about',
})

const PILLARS = [
  { k: 'COMMUNITY', t: 'Every bike brings its rider into the family. Sunday rides, late nights, shared tools.' },
  { k: 'CRAFTSMANSHIP', t: 'Measured twice, cut once. Welded, stitched and painted by hand, in-house.' },
  { k: 'CREATIVITY', t: 'No catalogue builds. Your bike starts with your story, not our template.' },
  { k: 'GOOD TIMES', t: 'If it isn’t fun to ride, it isn’t finished.' },
]

const PROCESS = [
  { k: 'IDEATE', t: 'We sit down, sketch, and pull the build sheet together.' },
  { k: 'BUILD', t: 'The bike comes into the bay. You see progress, not just an invoice.' },
  { k: 'RIDE', t: 'Handover, first ride, and a workshop that has your back after.' },
]

export default async function AboutPage() {
  const { services } = await getCatalogue()
  return (
    <>
      <EnvironmentalHero environment="editorial" size="tall" sign="since day one">
        <p className="label label--amber">ABOUT US</p>
        <h1 className="display" style={{ marginTop: 12 }}>
          People. Motorcycles.
          <br />
          <em>Good times.</em>
        </h1>
      </EnvironmentalHero>

      <section className="section wrap about-mission">
        <p className="label label--amber">THE MISSION</p>
        <p className="about-mission__text">
          Garage 27 exists to turn the bike in your head into the bike in your driveway — <em>custom without compromise</em>, built by people who ride.
        </p>
      </section>

      <section className="section--tight wrap" aria-labelledby="pillars">
        <h2 id="pillars" className="sr-only">
          What we stand for
        </h2>
        <ul className="pillars">
          {PILLARS.map((p, i) => (
            <li key={p.k} className="pillar">
              <span className="pillar__n">0{i + 1}</span>
              <h3 className="title">{p.k}</h3>
              <p className="muted">{p.t}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section wrap" aria-labelledby="process">
        <h2 id="process" className="label label--amber">
          HOW A BUILD HAPPENS
        </h2>
        <ol className="process">
          {PROCESS.map((p, i) => (
            <li key={p.k} className="process__step">
              <span className="process__word headline">{p.k}</span>
              {i < PROCESS.length - 1 && (
                <span className="process__arrow" aria-hidden="true">
                  →
                </span>
              )}
              <p className="muted">{p.t}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="section wrap about-contact" aria-labelledby="contact-heading">
        <div>
          <p className="label label--amber">COME BY THE GARAGE</p>
          <h2 id="contact-heading" className="headline">
            Talk to a builder.
          </h2>
          <p className="lede">Tell us what you ride and what you’re dreaming of. We’ll take it from there.</p>
          <dl className="specs">
            <div>
              <dt className="label">HOURS</dt>
              <dd>{CONTACT.hours}</dd>
            </div>
            <div>
              <dt className="label">EMAIL</dt>
              <dd>
                <a className="neon-link" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm services={services} />
      </section>
    </>
  )
}
