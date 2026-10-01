import { notFound, permanentRedirect } from 'next/navigation'
import { LEGAL, legalHref } from '@/lib/legal'

/** The legal pages moved to /privacy-policy, /shipping, /returns-cancellation and /terms-and-conditions. */
export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.legacySlug }))
}

export default async function LegacyLegalPage({ params }: PageProps<'/legal/[slug]'>) {
  const { slug } = await params
  const doc = LEGAL.find((d) => d.legacySlug === slug)
  if (!doc) notFound()
  permanentRedirect(legalHref(doc))
}
