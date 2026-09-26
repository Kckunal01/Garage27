/**
 * Legal pages. Garage 27 supplies the policy text — it is never invented here.
 * Put approved copy in `body` (paragraphs); until then the page says so plainly.
 */
export interface LegalDoc {
  slug: string
  title: string
  summary: string
  body?: string[]
}

export const LEGAL: LegalDoc[] = [
  { slug: 'privacy', title: 'Privacy Policy', summary: 'How Garage 27 collects, uses and protects your information.' },
  { slug: 'terms', title: 'Terms & Conditions', summary: 'The terms that apply when you use this site, buy parts or request a build.' },
  { slug: 'shipping', title: 'Shipping Policy', summary: 'How and when parts orders are dispatched and delivered.' },
  { slug: 'refunds', title: 'Refund / Cancellation Policy', summary: 'Returns, refunds and cancelling an order or a build.' },
]
