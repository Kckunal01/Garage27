import type { Metadata } from 'next'
import { publicEnv } from '@/lib/env'

export const SITE_NAME = 'Garage 27'

/** Unique title, description, canonical and OG for each indexable page. */
export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = `${publicEnv.siteUrl}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: `${title} · ${SITE_NAME}`, description },
  }
}
