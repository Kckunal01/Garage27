import { TrackedLink } from '@/components/garage-ui/TrackedLink'

function Arrow() {
  return (
    <svg className="gpill__arrow" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 8h19M13.5 1.5 20 8l-6.5 6.5" />
    </svg>
  )
}

/** BUILD NOW (red neon) · EXPLORE BUILDS (cream line) — pill CTAs with arrows. */
export function GarageHeroActions() {
  return (
    <div className="ghero__actions">
      <TrackedLink href="/build" className="gpill gpill--neon" event="cta_clicked" props={{ cta: 'build_now', surface: 'home_hero' }}>
        <span>BUILD NOW</span>
        <Arrow />
      </TrackedLink>
      <TrackedLink href="/garage" className="gpill gpill--line" event="cta_clicked" props={{ cta: 'explore_builds', surface: 'home_hero' }}>
        <span>EXPLORE BUILDS</span>
        <Arrow />
      </TrackedLink>
    </div>
  )
}
