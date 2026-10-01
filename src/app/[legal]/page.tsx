import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CONTACT } from '@/components/navigation/nav-config'
import { SubNav } from '@/components/navigation/SubNav'
import { LegalDocument } from '@/features/legal/LegalDocument'
import { getLegalDoc, LEGAL, legalHref } from '@/lib/legal'
import { pageMetadata } from '@/lib/seo/metadata'

/** Only the four legal documents live at the root: anything else stays a 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return LEGAL.map((d) => ({ legal: d.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[legal]'>): Promise<Metadata> {
  const doc = getLegalDoc((await params).legal)
  if (!doc) return { title: 'Not found', robots: { index: false } }
  return { ...pageMetadata({ title: doc.title, description: doc.summary, path: legalHref(doc) }), robots: doc.topics ? undefined : { index: false } }
}

/** The shared legal page: title, related legal pages, then the document's topics. */
export default async function LegalPage({ params }: PageProps<'/[legal]'>) {
  const doc = getLegalDoc((await params).legal)
  if (!doc) notFound()
  return (
    <div className="legal">
      <header className="legal__head">
        <p className="legal__kicker">LEGAL</p>
        <h1 className="legal__title">{doc.title}</h1>
        {(doc.intro ?? [doc.summary]).map((p) => (
          <p key={p} className="legal__intro">
            {p}
          </p>
        ))}
      </header>
      <SubNav label="Legal pages" items={LEGAL.map((d) => ({ href: legalHref(d), label: d.title }))} current={legalHref(doc)} />
      {doc.topics?.length ? (
        <LegalDocument title={doc.title} topics={doc.topics} />
      ) : (
        <p className="legal__notice">
          This policy is being finalised by Garage 27 and will be published here. For anything you need in the meantime, write to{' '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
        </p>
      )}
    </div>
  )
}
