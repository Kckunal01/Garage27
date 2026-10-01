import type { MetadataRoute } from 'next'
import { getGarageMachines, machineHref } from '@/lib/catalogue/garage'
import { LEGAL, legalHref } from '@/lib/legal'
import { getCatalogue } from '@/lib/catalogue/repository'
import { publicEnv } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl
  const { parts } = await getCatalogue()
  const pages = ['', '/garage', '/build', '/parts', '/service', '/about'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }))
  const products = parts.filter((p) => p.status === 'active').map((p) => ({ url: `${base}/parts/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.6 }))
  const machines = getGarageMachines().map((m) => ({ url: `${base}${machineHref(m)}`, changeFrequency: 'monthly' as const, priority: 0.7 }))
  const legal = LEGAL.filter((d) => d.topics?.length).map((d) => ({ url: `${base}${legalHref(d)}`, changeFrequency: 'yearly' as const, priority: 0.3 }))
  return [...pages, ...machines, ...products, ...legal]
}
