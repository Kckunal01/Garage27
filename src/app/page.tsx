import type { Metadata } from 'next'
import Link from 'next/link'
import { EnvironmentalHero } from '@/components/media/EnvironmentalHero'
import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import { GarageLogo } from '@/components/garage-ui/GarageLogo'
import { TrackedLink } from '@/components/garage-ui/TrackedLink'
import { assetExists } from '@/lib/server/assets'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Custom Motorcycles, Built Different',
    description: 'Garage 27 builds custom motorcycles. Design yours in the 3D build bay, explore pre-customised builds, shop parts, or book a service.',
    path: '/',
  }),
  title: { absolute: 'Garage 27 — Custom Motorcycles, Built Different' },
}

const HERO_STILL = '/assets/environments/exterior/garage-night.webp'
const HERO_LOOP = { webm: '/assets/video/hero-lights.webm', mp4: '/assets/video/hero-lights.mp4' }

const BAYS = [
  { href: '/build', n: '01', title: 'BUILD', line: 'Turn your dream into your bike.', cta: 'ENTER THE BAY' },
  { href: '/parts', n: '02', title: 'PARTS', line: 'The details make the bike.', cta: 'BROWSE THE WALL' },
  { href: '/service', n: '03', title: 'SERVICE', line: 'Ride. Restore. Repeat.', cta: 'BOOK THE WORKSHOP' },
]

export default function HomePage() {
  const still = assetExists(HERO_STILL) ? { src: HERO_STILL, alt: '' } : undefined
  const loop = still && assetExists(HERO_LOOP.mp4) ? HERO_LOOP : undefined
  return (
    <>
      <EnvironmentalHero
        environment="exterior"
        size="full"
        ignition
        media={still ? { image: still, video: loop } : undefined}
        foreground={still ? undefined : <BikeSilhouette className="hero-bike" silhouette="cafe" tone="red" title="A custom café racer parked outside Garage 27" />}
      >
        <div className="home-hero">
          <div className="home-hero__sign">
            <GarageLogo size="lg" asLink={false} />
          </div>
          <p className="tagline home-hero__kicker">BUILT DIFFERENT. ALWAYS.</p>
          <h1 className="display home-hero__title">
            Turn your dream
            <br /> <em>into</em> your bike.
          </h1>
          <p className="label home-hero__sub">CUSTOM WITHOUT COMPROMISE.</p>
          <div className="home-hero__ctas">
            <TrackedLink href="/build" className="btn btn--ignite" event="cta_clicked" props={{ cta: 'build_now', surface: 'home_hero' }}>
              BUILD NOW
            </TrackedLink>
            <TrackedLink href="/garage" className="btn" event="cta_clicked" props={{ cta: 'explore_builds', surface: 'home_hero' }}>
              EXPLORE BUILDS
            </TrackedLink>
          </div>
        </div>
      </EnvironmentalHero>

      <section className="section wrap" aria-labelledby="bays-heading">
        <h2 id="bays-heading" className="sr-only">
          Inside Garage 27
        </h2>
        <ol className="bays">
          {BAYS.map((b) => (
            <li key={b.href}>
              <Link href={b.href} className="bay">
                <span className="bay__n">{b.n}</span>
                <span className="bay__title headline">{b.title}</span>
                <span className="bay__line">{b.line}</span>
                <span className="neon-link bay__cta">{b.cta}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="section--tight wrap manifesto">
        <p className="label label--amber">GARAGE 27</p>
        <p className="manifesto__line">
          Motorcycles. People. <em>Good times.</em>
        </p>
        <Link href="/about" className="neon-link">
          OUR STORY
        </Link>
      </section>
    </>
  )
}
