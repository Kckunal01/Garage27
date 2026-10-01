import type { Metadata } from 'next'
import Image from 'next/image'
import { EnquiryForm } from '@/features/about/EnquiryForm'
import { ValueIcon } from '@/features/about/ValueIcon'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'About Us — People. Motorcycles. Good Times.',
  description: 'Garage 27 exists to make better humans through motorcycles: community, craftsmanship, creativity and good times. Ideate, build, ride.',
  path: '/about',
})

/** The supplied About photographs (public/assets/about). */
const A = (name: string) => `/assets/about/${name}.webp`

const VALUES = [
  { icon: 'helmet', title: 'COMMUNITY', line: ['RIDERS,', 'NOT CUSTOMERS.'] },
  { icon: 'wrenches', title: 'CRAFTSMANSHIP', line: ['DETAILS', 'THAT MATTER.'] },
  { icon: 'plug', title: 'CREATIVITY', line: ['IDEAS', 'ON TWO WHEELS.'] },
  { icon: 'peaks', title: 'GOOD TIMES', line: ['RIDES THAT', 'TURN INTO FAMILY.'] },
] as const

const Arrow = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 30 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6h27M23 1l5 5-5 5" />
  </svg>
)

/**
 * About — after the About Us reference: garage hero, mission beside a taped
 * sunset print, four values, and LET'S TALK inside the workshop. Only the supplied About assets.
 */
export default function AboutPage() {
  return (
    <div className="abt">
      <section className="abt-hero" aria-labelledby="abt-title">
        {/* The supplied 1328px photograph, served as delivered: re-encoding it would only soften it. */}
        <Image className="abt-hero__img" src={A('01-hero-garage')} alt="" fill sizes="100vw" unoptimized preload />
        <div className="abt-hero__shade" aria-hidden="true" />
        <div className="abt-hero__copy">
          <h1 id="abt-title" className="abt-hero__title">
            ABOUT
            <br />
            US
          </h1>
          <p className="abt-hero__motto">
            <span>PEOPLE.</span>
            <span>MOTORCYCLES.</span>
            <span>GOOD TIMES.</span>
          </p>
        </div>
      </section>

      <section className="abt-mission" aria-labelledby="abt-mission-title">
        <Image className="abt-bg" src={A('02-mission-workbench')} alt="" fill sizes="100vw" />
        <div className="abt-mission__inner">
          <div className="abt-mission__text">
            <p className="abt-label">OUR MISSION</p>
            <h2 id="abt-mission-title" className="abt-mission__title">
              BETTER HUMANS
              <br />
              THROUGH
              <br />
              MOTORCYCLES.
            </h2>
            <p className="abt-mission__body">
              We believe motorcycles do more than take you places. They make you more mindful, more present and more alive. Garage 27 exists to bring people, ideas and machines together to create a stronger, freer
              and more connected community.
            </p>
          </div>
          <figure className="abt-print">
            <span className="abt-print__photo">
              <Image src={A('05-ride-sunset')} alt="A Garage 27 rider watching the sun set over the city" fill sizes="(width < 768px) 42vw, 320px" />
            </span>
            <figcaption className="abt-print__caption">
              SAME ROADS.
              <br />
              BETTER HUMANS.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="abt-values" aria-label="What Garage 27 stands for">
        <Image className="abt-bg abt-bg--faint" src={A('03-detail-wheel')} alt="" fill sizes="100vw" />
        <ul className="abt-values__list">
          {VALUES.map((v) => (
            <li key={v.title} className="abt-value">
              <ValueIcon name={v.icon} />
              <h3 className="abt-value__title">{v.title}</h3>
              <p className="abt-value__line">
                {v.line[0]}
                <br />
                {v.line[1]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" className="abt-talk" aria-labelledby="abt-talk-title">
        <Image className="abt-talk__img" src={A('10-workshop-rider')} alt="" fill sizes="100vw" />
        <div className="abt-talk__shade" aria-hidden="true" />
        <p className="abt-talk__aside">
          CAN’T FIND
          <br />
          WHAT YOU’RE
          <br />
          LOOKING FOR?
          <Arrow className="abt-talk__aside-arrow" />
        </p>
        <div className="abt-talk__panel">
          <h2 id="abt-talk-title" className="abt-talk__title">
            LET’S TALK.
          </h2>
          <p className="abt-talk__copy">
            Upload a reference or tell us what’s on your mind.
            <br />
            We’ll get back with ideas, possibilities and next steps.
          </p>
          <EnquiryForm />
        </div>
      </section>
    </div>
  )
}
