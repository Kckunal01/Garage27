/**
 * Legal pages. Garage 27 supplies the policy text — it is never invented here.
 * A document is an optional intro plus numbered topics; each topic is a list
 * of blocks (paragraphs, bullet lists, or the contact block). A document
 * without approved topics yet says so plainly.
 */
export type LegalBlock = string | { list: string[] } | { contact: true }

export interface LegalTopic {
  id: string
  title: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  /** Route segment: /<slug>. */
  slug: string
  /** Previous /legal/<legacySlug> address, redirected here. */
  legacySlug: string
  title: string
  summary: string
  intro?: string[]
  topics?: LegalTopic[]
}

export const LEGAL: LegalDoc[] = [
  {
    slug: 'privacy-policy',
    legacySlug: 'privacy',
    title: 'Privacy Policy',
    summary: 'How Garage 27 collects, uses and protects your information.',
    intro: [
      'Garage 27 respects your privacy and is committed to protecting the information you share with us when you use our website, purchase products, request services, or contact us.',
    ],
    topics: [
      {
        id: 'information-we-collect',
        title: 'INFORMATION WE COLLECT',
        blocks: [
          'We may collect information you provide directly when you:',
          {
            list: [
              'Create an account or place an order',
              'Purchase products or services',
              'Submit a service or build request',
              'Contact our support team',
              'Subscribe to communications',
              'Participate in promotions or other activities on our website',
            ],
          },
          'This may include your name, email address, phone number, billing and shipping details, and information necessary to fulfil your requests.',
        ],
      },
      {
        id: 'how-we-use-your-information',
        title: 'HOW WE USE YOUR INFORMATION',
        blocks: [
          'We use the information we collect to:',
          {
            list: [
              'Process and fulfil orders',
              'Arrange shipping and delivery',
              'Provide customer support',
              'Respond to enquiries and service requests',
              'Process payments',
              'Improve our website, products and services',
              'Communicate with you about orders, requests and relevant updates',
              'Prevent fraud, misuse or unauthorised activity',
            ],
          },
          'We only use information for purposes connected to operating and improving Garage 27 and providing the services you request.',
        ],
      },
      {
        id: 'payment-information',
        title: 'PAYMENT INFORMATION',
        blocks: [
          'Payments made through Garage 27 may be processed through third-party payment providers.',
          'Garage 27 does not need to directly store your complete payment card or banking credentials when these are handled by the relevant payment provider.',
          'Payment information is subject to the privacy policies and security practices of the payment provider used for your transaction.',
        ],
      },
      {
        id: 'cookies-and-website-data',
        title: 'COOKIES & WEBSITE DATA',
        blocks: [
          'Our website may use cookies and similar technologies to help operate the website, understand how visitors use it and improve your experience.',
          'These technologies may collect information such as browser type, device information, pages visited and general website usage.',
          'You can control or restrict cookies through your browser settings, although doing so may affect certain website functionality.',
        ],
      },
      {
        id: 'sharing-your-information',
        title: 'SHARING YOUR INFORMATION',
        blocks: [
          'We may share relevant information with trusted third parties when necessary to operate Garage 27 and fulfil your requests.',
          'This may include:',
          {
            list: [
              'Payment processors',
              'Shipping and delivery partners',
              'Website and technology service providers',
              'Customer-support or communication providers',
              'Other service providers working on our behalf',
            ],
          },
          'We do not sell your personal information simply for the purpose of selling it to third parties.',
        ],
      },
      {
        id: 'data-security',
        title: 'DATA SECURITY',
        blocks: [
          'We take reasonable measures to protect the information we collect from unauthorised access, misuse, alteration or disclosure.',
          'However, no online transmission or storage system can be guaranteed to be completely secure.',
        ],
      },
      {
        id: 'data-retention',
        title: 'DATA RETENTION',
        blocks: [
          'We retain information for as long as reasonably necessary to fulfil the purposes for which it was collected, including fulfilling orders, providing services, maintaining business records and complying with applicable legal obligations.',
          'When information is no longer required, it may be deleted or securely disposed of where appropriate.',
        ],
      },
      {
        id: 'your-rights',
        title: 'YOUR RIGHTS',
        blocks: [
          'Depending on applicable law, you may have rights relating to your personal information, including the ability to request access, correction or deletion of certain information.',
          'For privacy-related requests, you can contact Garage 27 using the contact details provided below.',
        ],
      },
      {
        id: 'third-party-links',
        title: 'THIRD-PARTY LINKS',
        blocks: [
          'Our website may contain links to third-party websites or services.',
          'Garage 27 is not responsible for the privacy practices, content or security of external websites. We recommend reviewing the privacy policy of any third-party website you visit.',
        ],
      },
      {
        id: 'childrens-privacy',
        title: 'CHILDREN’S PRIVACY',
        blocks: [
          'Garage 27’s website and services are not intentionally directed toward children.',
          'We do not knowingly collect personal information from children without appropriate consent where such consent is required by law.',
        ],
      },
      {
        id: 'changes-to-this-policy',
        title: 'CHANGES TO THIS POLICY',
        blocks: [
          'Garage 27 may update this Privacy Policy from time to time to reflect changes in our services, technology, business practices or applicable requirements.',
          'Any updated version will be published on this page with the revised effective date.',
        ],
      },
      {
        id: 'contact-us',
        title: 'CONTACT US',
        blocks: ['If you have questions about this Privacy Policy or how your information is handled, contact us:', { contact: true }],
      },
    ],
  },
  { slug: 'shipping', legacySlug: 'shipping', title: 'Shipping Policy', summary: 'How and when parts orders are dispatched and delivered.' },
  { slug: 'returns-cancellation', legacySlug: 'refunds', title: 'Returns & Cancellation', summary: 'Returns, refunds and cancelling an order or a build.' },
  { slug: 'terms-and-conditions', legacySlug: 'terms', title: 'Terms & Conditions', summary: 'The terms that apply when you use this site, buy parts or request a build.' },
]

export const legalHref = (d: Pick<LegalDoc, 'slug'>) => `/${d.slug}`

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL.find((d) => d.slug === slug)
}
