import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogueNote } from '@/components/garage-ui/CatalogueNote'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { BuyNow } from '@/features/parts/BuyNow'
import { CategoryPhoto } from '@/features/parts/CategoryPhoto'
import { CategoryShelf } from '@/features/parts/CategoryShelf'
import { fitmentLine } from '@/features/parts/fitment'
import { getCatalogue, getPartBySlug } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { publicEnv } from '@/lib/env'
import { formatINR } from '@/lib/pricing/money'
import { pageMetadata } from '@/lib/seo/metadata'
import { PART_CATEGORIES, type Part, type PartCategory } from '@/types/catalogue'

export const revalidate = 300

/** /parts/<category> is that category's shelf; any other slug is a product. */
const asCategory = (slug: string): PartCategory | null => ((PART_CATEGORIES as readonly string[]).includes(slug) ? (slug as PartCategory) : null)

export async function generateStaticParams() {
  const { parts } = await getCatalogue()
  return [...PART_CATEGORIES.map((c) => ({ slug: c })), ...parts.filter((p) => p.status !== 'retired').map((p) => ({ slug: p.slug }))]
}

export async function generateMetadata({ params }: PageProps<'/parts/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const category = asCategory(slug)
  if (category) {
    const meta = PART_CATEGORY_META[category]
    return pageMetadata({ title: `${meta.label[0]}${meta.label.slice(1).toLowerCase()} parts`, description: `${meta.descriptor} Custom motorcycle ${meta.label.toLowerCase()} parts from Garage 27.`, path: `/parts/${category}` })
  }
  const part = await getPartBySlug(slug)
  if (!part) return { title: 'Part not found', robots: { index: false } }
  const img = part.images.find((i) => assetExists(i.src))?.src
  return pageMetadata({ title: part.name, description: `${part.summary} ${part.material}, ${part.finish}.`.slice(0, 158), path: `/parts/${part.slug}`, image: img })
}

export default async function PartsSlugPage({ params }: PageProps<'/parts/[slug]'>) {
  const { slug } = await params
  const category = asCategory(slug)
  if (category) return <CategoryPage category={category} />
  const part = await getPartBySlug(slug)
  if (!part) notFound()
  return <ProductPage part={part} />
}

async function CategoryPage({ category }: { category: PartCategory }) {
  const { parts, bikes, source } = await getCatalogue()
  const meta = PART_CATEGORY_META[category]
  const own = parts.filter((p) => p.category === category)
  const images: Record<string, string> = {}
  for (const p of own) if (assetExists(p.images[0]?.src)) images[p.id] = p.images[0]!.src
  return (
    <div className="prt pcat">
      <section className="pcat__banner">
        <CategoryPhoto meta={meta} className="pcat__photo" sizes="100vw" eager />
        <div className="pcat__shade" aria-hidden="true" />
        <div className="pcat__head">
          <nav className="pcat__crumbs" aria-label="Breadcrumb">
            <Link href="/parts">PARTS</Link> <span aria-hidden="true">/</span> <span aria-current="page">{meta.label}</span>
          </nav>
          <h1 className="pcat__title">{meta.label}</h1>
          <p className="pcat__desc">{meta.descriptor}</p>
        </div>
      </section>
      <div className="prt__body pcat__body">
        <CategoryShelf parts={own} bikes={bikes} images={images} />
        {source === 'local' && <CatalogueNote />}
      </div>
    </div>
  )
}

async function ProductPage({ part }: { part: Part }) {
  const { bikes } = await getCatalogue()
  const images = part.images.filter((i) => assetExists(i.src))
  const meta = PART_CATEGORY_META[part.category]
  const inStock = part.status === 'active' && part.stock > 0
  const availability = !inStock ? 'Sold out' : part.stock <= 3 ? `Only ${part.stock} left` : 'In stock'

  // Truthful structured data only: no invented ratings or reviews.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.name,
    sku: part.sku,
    description: part.description,
    brand: { '@type': 'Brand', name: part.brand },
    category: meta.label,
    image: images.map((i) => `${publicEnv.siteUrl}${i.src}`),
    offers: {
      '@type': 'Offer',
      price: (part.price / 100).toFixed(2),
      priceCurrency: part.currency,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${publicEnv.siteUrl}/parts/${part.slug}`,
    },
  }

  return (
    <article className="pdp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="pdp__media">
        {images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- catalogue images are pre-optimised at delivery size
          <img className="pdp__img" src={images[0].src} alt={images[0].alt} loading="eager" decoding="async" />
        ) : (
          <CategoryPhoto meta={meta} className="pdp__photo" sizes="(width < 768px) 100vw, 55vw" eager />
        )}
        <div className="pdp__shade" aria-hidden="true" />
      </div>
      <div className="pdp__info">
        <nav className="pdp__eyebrow" aria-label="Breadcrumb">
          <Link href="/parts">PARTS</Link> <span aria-hidden="true">/</span> <Link href={`/parts/${part.category}`}>{meta.label}</Link>
        </nav>
        <h1 className="pdp__name">{part.name}</h1>
        <p className="pdp__summary">{part.summary}</p>
        <p className="pdp__price">{formatINR(part.price)}</p>
        <dl className="pdp__facts">
          <div>
            <dt>FITMENT</dt>
            <dd>{fitmentLine(part, bikes)}</dd>
          </div>
          <div>
            <dt>AVAILABILITY</dt>
            <dd className={inStock ? 'is-in' : 'is-out'}>{availability}</dd>
          </div>
        </dl>
        <BuyNow part={part} />
        <p className="pdp__desc">{part.description}</p>
        <dl className="pdp__specs">
          <div>
            <dt>MATERIAL</dt>
            <dd>{part.material}</dd>
          </div>
          <div>
            <dt>FINISH</dt>
            <dd>{part.finish}</dd>
          </div>
          <div>
            <dt>INSTALLATION</dt>
            <dd>
              {part.installationNotes}{' '}
              <Link className="neon-link" href="/service?request=doorstep-installation">
                BOOK FITTING
              </Link>
            </dd>
          </div>
          <div>
            <dt>SKU</dt>
            <dd>{part.sku}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
