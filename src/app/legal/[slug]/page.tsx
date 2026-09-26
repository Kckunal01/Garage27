import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LEGAL } from '@/lib/legal'
import { pageMetadata } from '@/lib/seo/metadata'

export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: PageProps<'/legal/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const doc = LEGAL.find((d) => d.slug === slug)
  if (!doc) return { title: 'Not found', robots: { index: false } }
  return { ...pageMetadata({ title: doc.title, description: doc.summary, path: `/legal/${doc.slug}` }), robots: doc.body ? undefined : { index: false } }
}

export default async function LegalPage({ params }: PageProps<'/legal/[slug]'>) {
  const { slug } = await params
  const doc = LEGAL.find((d) => d.slug === slug)
  if (!doc) notFound()
  return (
    <div className="wrap section--tight doc-page">
      <p className="doc-page__kicker">LEGAL</p>
      <h1 className="doc-page__title">{doc.title}</h1>
      <p className="lede">{doc.summary}</p>
      {doc.body ? (
        <div className="doc-page__body">
          {doc.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="doc-page__notice">
          This policy is being finalised by Garage 27 and will be published here. For anything you need in the meantime, visit{' '}
          <Link className="neon-link" href="/help">
            HELP
          </Link>
          .
        </p>
      )}
    </div>
  )
}
