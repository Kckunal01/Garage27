import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PartVisual } from '@/components/media/PartVisual'
import { AddToCart } from '@/features/parts/AddToCart'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { getCatalogue, getPartBySlug } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { publicEnv } from '@/lib/env'
import { formatINR } from '@/lib/pricing/money'
import { pageMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export async function generateStaticParams() {
  const { parts } = await getCatalogue()
  return parts.filter((p) => p.status !== 'retired').map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<'/parts/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const part = await getPartBySlug(slug)
  if (!part) return { title: 'Part not found', robots: { index: false } }
  const img = part.images.find((i) => assetExists(i.src))?.src
  return pageMetadata({ title: part.name, description: `${part.summary} ${part.material}, ${part.finish}.`.slice(0, 158), path: `/parts/${part.slug}`, image: img })
}

export default async function PartPage({ params }: PageProps<'/parts/[slug]'>) {
  const { slug } = await params
  const part = await getPartBySlug(slug)
  if (!part) notFound()
  const { bikes } = await getCatalogue()
  const images = part.images.filter((i) => assetExists(i.src))
  const fits = part.compatibleBikeIds.map((id) => bikes.find((b) => b.id === id)).filter((b) => !!b)
  const cat = PART_CATEGORY_META[part.category]

  // Truthful structured data only: no invented ratings or reviews.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.name,
    sku: part.sku,
    description: part.description,
    brand: { '@type': 'Brand', name: part.brand },
    category: cat.label,
    image: images.map((i) => `${publicEnv.siteUrl}${i.src}`),
    offers: {
      '@type': 'Offer',
      price: (part.price / 100).toFixed(2),
      priceCurrency: part.currency,
      availability: part.stock > 0 && part.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${publicEnv.siteUrl}/parts/${part.slug}`,
    },
  }

  return (
    <div className="wrap pdp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="crumbs label" aria-label="Breadcrumb">
        <Link href="/parts">PARTS</Link> <span aria-hidden="true">/</span> <Link href={`/parts?category=${part.category}`}>{cat.label}</Link>
      </nav>
      <div className="pdp__grid">
        <div className="pdp__gallery">
          {images.length ? (
            images.map((img, i) => <PartVisual key={img.src} src={img.src} alt={img.alt} category={part.category} eager={i === 0} className="pdp__img" />)
          ) : (
            <PartVisual alt={part.images[0]?.alt ?? part.name} category={part.category} className="pdp__img" />
          )}
        </div>
        <div className="pdp__info">
          <p className="label label--amber">
            {cat.label} · {part.sku}
          </p>
          <h1 className="headline">{part.name}</h1>
          <p className="pdp__price">{formatINR(part.price)}</p>
          <p className="lede">{part.description}</p>
          <AddToCart part={part} />
          <dl className="specs">
            <div>
              <dt className="label">FITS</dt>
              <dd>{fits.length ? fits.map((b) => `${b.brand} ${b.model}`).join(' · ') : 'Universal — most 22 mm / standard fitments'}</dd>
            </div>
            <div>
              <dt className="label">MATERIAL</dt>
              <dd>{part.material}</dd>
            </div>
            <div>
              <dt className="label">FINISH</dt>
              <dd>{part.finish}</dd>
            </div>
            <div>
              <dt className="label">INSTALLATION</dt>
              <dd>
                {part.installationNotes}{' '}
                <Link className="neon-link" href="/service#request">
                  BOOK FITTING
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
