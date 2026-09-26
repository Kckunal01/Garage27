import { TrackedLink } from '@/components/garage-ui/TrackedLink'

/** BUILD NOW (red neon) · EXPLORE BUILDS (cream) — pill CTAs with arrows. */
export function GarageHeroActions() {
  return (
    <div className="ghero__actions">
      <TrackedLink href="/build" className="gpill gpill--neon" event="cta_clicked" props={{ cta: 'build_now', surface: 'home_hero' }}>
        <span>BUILD NOW</span>
        <span className="gpill__arrow" aria-hidden="true">
          →
        </span>
      </TrackedLink>
      <TrackedLink href="/garage" className="gpill" event="cta_clicked" props={{ cta: 'explore_builds', surface: 'home_hero' }}>
        <span>EXPLORE BUILDS</span>
        <span className="gpill__arrow" aria-hidden="true">
          →
        </span>
      </TrackedLink>
    </div>
  )
}
