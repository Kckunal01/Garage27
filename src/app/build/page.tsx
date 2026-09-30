import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BuildLanding, type LandingModel } from '@/features/build/landing/BuildLanding'
import { getCatalogue } from '@/lib/catalogue/repository'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Build Your Bike — Choose Your Motorcycle',
  description: 'Choose your motorcycle and its factory colour, then customise it in the Garage 27 build bay. Royal Enfield, Jawa, Yezdi and Triumph.',
  path: '/build',
})

/** Links that used to open the bay at /build keep working. */
const BAY_PARAMS = ['bike', 'preset', 'c', 'saved']

export default async function BuildLandingPage({ searchParams }: PageProps<'/build'>) {
  const params = await searchParams
  if (BAY_PARAMS.some((k) => typeof params[k] === 'string')) {
    const query = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])))
    redirect(`/build/visualiser?${query}`)
  }
  const { bikes, colours } = await getCatalogue()
  const models: LandingModel[] = bikes
    .filter((b) => b.status === 'active')
    .map((b) => ({
      id: b.id,
      brand: b.brand,
      name: b.name,
      tagline: b.tagline,
      silhouette: b.silhouette,
      image: b.previewImage,
      thumbnail: b.thumbnail,
      defaultColourId: b.defaultColourId,
      colours: colours
        .filter((c) => c.bikeId === b.id && c.status === 'active')
        .map((c) => ({ id: c.id, name: c.name, swatch: c.swatch, accent: c.material.accent })),
    }))
  return <BuildLanding models={models} />
}
