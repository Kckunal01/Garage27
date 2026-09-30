import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BuildBay, BuildBayShell } from '@/features/build/BuildBay'
import { getCatalogue } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Build Your Bike — 3D Motorcycle Customiser',
  description: 'Customise your motorcycle part by part in the Garage 27 3D build bay: tank, front, cockpit, seat, rear, wheels, details and finish. Review your add-ons and request the build.',
  path: '/build/visualiser',
})

/** The 3D build bay (visualizer). The Build landing at /build chooses the bike and colour. */
export default async function BuildVisualiserPage() {
  const { bikes, colours, options, parts, showcase } = await getCatalogue()
  // Only what the bay needs crosses to the client. 3D assets load per bike, on demand.
  const presets = showcase.filter((s) => s.preset).map((s) => ({ id: s.id, name: s.name, preset: s.preset }))
  // Each option's real product photograph: its own preview, else its shop part's first image — only files that exist.
  const optionImages: Record<string, string> = {}
  for (const o of options) {
    const part = o.partId ? parts.find((p) => p.id === o.partId) : undefined
    const src = [o.previewAsset, part?.images[0]?.src].find((s) => assetExists(s))
    if (src) optionImages[o.id] = src
  }
  return (
    <Suspense fallback={<BuildBayShell />}>
      <BuildBay bikes={bikes} colours={colours} options={options} presets={presets} optionImages={optionImages} />
    </Suspense>
  )
}
