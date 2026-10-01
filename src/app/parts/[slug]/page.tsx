import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { CategoryPhoto } from '@/features/parts/CategoryPhoto'
import { CategoryShelf } from '@/features/parts/CategoryShelf'
import { ProductBenefits } from '@/features/parts/product/ProductBenefits'
import { ProductHero } from '@/features/parts/product/ProductHero'
import { ProductInstallation } from '@/features/parts/product/ProductInstallation'
import { ProductSpecifications } from '@/features/parts/product/ProductSpecifications'
import { RelatedProducts } from '@/features/parts/product/RelatedProducts'
import { relatedParts } from '@/lib/catalogue/related'
import { getCatalogue, getPartBySlug } from '@/lib/catalogue/repository'
import { assetExists } from '@/lib/server/assets'
import { publicEnv } from '@/lib/env'
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
  const { parts, bikes } = await getCatalogue()
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
        <CategoryShelf category={category} parts={own} bikes={bikes} images={images} />
      </div>
    </div>
  )
}

async function ProductPage({ part }: { part: Part }) {
  const { parts, bikes } = await getCatalogue()
  const images = part.images.filter((i) => assetExists(i.src))
  const meta = PART_CATEGORY_META[part.category]
  const inStock = part.status === 'active' && part.stock > 0
  const related = relatedParts(part, parts)
  const relatedImages: Record<string, string> = {}
  for (const p of related) if (assetExists(p.images[0]?.src)) relatedImages[p.id] = p.images[0]!.src

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
    <article className="prod">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="prod__crumbs" aria-label="Breadcrumb">
        <Link href="/parts">PARTS</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/parts/${part.category}`}>{meta.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{part.name}</span>
      </nav>
      <ProductHero part={part} meta={meta} number={PART_CATEGORIES.indexOf(part.category) + 1} images={images} />
      <ProductBenefits part={part} />
      <ProductSpecifications part={part} bikes={bikes} meta={meta} image={images[1] ?? images[0]} />
      <ProductInstallation part={part} />
      <RelatedProducts parts={related} images={relatedImages} />
    </article>
  )
}
