import { TrackedLink } from '@/components/garage-ui/TrackedLink'

/** BUILD NOW (solid red, the primary CTA) · EXPLORE BUILDS (cream line) — text-only pill CTAs. */
export function GarageHeroActions() {
  return (
    <div className="ghero__actions">
      <TrackedLink href="/build" className="gpill gpill--neon" event="cta_clicked" props={{ cta: 'build_now', surface: 'home_hero' }}>
        <span>BUILD NOW</span>
      </TrackedLink>
      <TrackedLink href="/garage" className="gpill gpill--line" event="cta_clicked" props={{ cta: 'explore_builds', surface: 'home_hero' }}>
        <span>EXPLORE BUILDS</span>
      </TrackedLink>
    </div>
  )
}
