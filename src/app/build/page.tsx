import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BikePickerShell } from '@/features/build/BikePicker'
import { CatalogueNote } from '@/components/garage-ui/CatalogueNote'
import { BuildBay } from '@/features/build/BuildBay'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: 'Build Your Bike — 3D Motorcycle Customiser',
  description: 'Choose your bike, pick a colour and customise lighting, cockpit, body, seat, detail, luggage and rear wheel in the Garage 27 3D build bay. Live estimate, custom quote.',
  path: '/build',
})

export default async function BuildPage() {
  const { bikes, colours, options, showcase, source } = await getCatalogue()
  // Only what the bay needs crosses to the client. 3D assets load per bike, on demand.
  const presets = showcase.filter((s) => s.preset).map((s) => ({ id: s.id, name: s.name, preset: s.preset }))
  return (
    <>
      <Suspense fallback={<BikePickerShell bikes={bikes} />}>
        <BuildBay bikes={bikes} colours={colours} options={options} presets={presets} />
      </Suspense>
      {source === 'local' && (
        <div className="wrap">
          <CatalogueNote />
        </div>
      )}
    </>
  )
}
