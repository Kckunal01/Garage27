/**
 * Legal pages. Garage 27 supplies the policy text — it is never invented here.
 * A document is an optional intro plus numbered topics; each topic is a list
 * of blocks (paragraphs, bullet lists, or the contact block). A document
 * without approved topics yet says so plainly.
 */
/** `contact`: Garage 27's email and phone; `name: false` leaves out the "Garage 27" line. */
export type LegalBlock = string | { list: string[] } | { contact: true; name?: boolean }

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
  {
    slug: 'shipping',
    legacySlug: 'shipping',
    title: 'Shipping Policy',
    summary: 'How and when parts orders are dispatched and delivered.',
    intro: [
      'Garage 27 ships products across India through trusted shipping and delivery partners. We aim to process, pack and dispatch orders carefully so that your products reach you safely and within the estimated delivery window shown at the time of purchase.',
      'Shipping timelines may vary depending on the product, destination, availability, courier operations and circumstances outside our control.',
    ],
    topics: [
      {
        id: 'shipping-overview',
        title: 'SHIPPING OVERVIEW',
        blocks: [
          'We currently process orders placed through the Garage 27 website for delivery to eligible addresses in India.',
          'Once an order is successfully placed and payment is confirmed, we begin processing the order for dispatch.',
          'Orders may be shipped through third-party logistics and courier partners selected by Garage 27.',
          'Delivery availability may vary depending on the destination and the serviceability of the shipping partner.',
          'Certain products may require additional processing time due to their availability, customisation, size, weight or nature.',
        ],
      },
      {
        id: 'order-processing',
        title: 'ORDER PROCESSING',
        blocks: [
          'Orders are processed after successful order confirmation and payment verification.',
          'We generally aim to process and prepare orders for dispatch within 2–5 business days, unless a different timeline is mentioned on the product page or communicated to you.',
          'Orders containing products with different processing timelines may be dispatched separately.',
          'Custom, made-to-order or specially prepared products may require additional time before dispatch.',
          'If there is an unexpected delay in processing your order, we may contact you using the details provided during checkout.',
        ],
      },
      {
        id: 'delivery-time',
        title: 'DELIVERY TIME',
        blocks: [
          'After dispatch, delivery generally takes approximately 3–7 business days, depending on the destination and shipping partner.',
          'Delivery to certain locations, including remote or difficult-to-service areas, may take longer.',
          'The estimated delivery period is indicative and is not a guaranteed delivery date.',
          'Delivery may also be affected by circumstances such as weather conditions, transportation delays, public holidays, courier disruptions, operational issues or other events outside the reasonable control of Garage 27.',
        ],
      },
      {
        id: 'shipping-charges',
        title: 'SHIPPING CHARGES',
        blocks: [
          'Shipping charges, where applicable, will be displayed during checkout before you complete your order.',
          'Garage 27 currently offers free shipping on orders above ₹5,000, unless otherwise specified for a particular product or order.',
          'Orders below the applicable free-shipping threshold may be subject to shipping charges based on the order and delivery location.',
          'Any applicable shipping charges will be clearly shown before payment is completed.',
          'For Cash on Delivery orders, an additional ₹500 COD charge may apply where the COD option is available.',
        ],
      },
      {
        id: 'order-tracking',
        title: 'ORDER TRACKING',
        blocks: [
          'Once your order has been dispatched, tracking information may be provided through the contact details associated with your order.',
          'You can use the tracking information provided by Garage 27 or the relevant shipping partner to check the status of your shipment.',
          'Tracking information may take some time to become active after the shipment has been handed over to the courier.',
          'If your tracking information has not updated for an extended period, you can contact our support team for assistance.',
        ],
      },
      {
        id: 'delivery-attempts',
        title: 'DELIVERY ATTEMPTS',
        blocks: [
          'Our shipping partners may make multiple delivery attempts using the contact information and delivery address provided with the order.',
          'Please ensure that someone is available to receive the shipment when required.',
          'If a delivery cannot be completed because the recipient is unavailable, the address is incorrect or incomplete, the recipient refuses the shipment, or the courier is otherwise unable to complete delivery, the shipment may be returned to Garage 27.',
          'Additional shipping or re-delivery charges may apply where a shipment needs to be sent again because of an incorrect address, repeated failed delivery attempts or refusal to accept the order.',
        ],
      },
      {
        id: 'address-changes',
        title: 'ADDRESS CHANGES',
        blocks: [
          'Please carefully check your shipping address before completing your order.',
          'If you need to change your delivery address after placing an order, contact Garage 27 as soon as possible at:',
          { contact: true, name: false },
          'We will try to accommodate address-change requests where the order has not yet been dispatched.',
          'Once an order has been dispatched, we may not be able to change the delivery address.',
          'Garage 27 is not responsible for delays or failed deliveries caused by an incorrect, incomplete or inaccurate address provided by the customer.',
        ],
      },
      {
        id: 'damaged-lost-or-missing-shipments',
        title: 'DAMAGED, LOST OR MISSING SHIPMENTS',
        blocks: [
          'Please inspect the package when it is delivered.',
          'If the package appears visibly damaged, tampered with or opened, we recommend documenting the condition of the package before accepting or opening it and contacting Garage 27 as soon as possible.',
          'If an item is missing, damaged or incorrectly delivered, contact us with your order details and relevant photographs or other information that may help us investigate the issue.',
          'We may coordinate with the relevant shipping partner to investigate delivery-related issues.',
          'Resolution of damaged, missing or lost shipments may depend on the circumstances of the shipment and the investigation conducted by Garage 27 and/or the shipping partner.',
        ],
      },
      {
        id: 'delivery-delays-and-unforeseen-events',
        title: 'DELIVERY DELAYS & UNFORESEEN EVENTS',
        blocks: [
          'Garage 27 works with third-party shipping partners and therefore cannot guarantee delivery on a specific date unless expressly stated otherwise.',
          'Delivery may be delayed because of circumstances outside our reasonable control, including severe weather, natural events, transportation disruptions, strikes, public holidays, courier network issues, government restrictions or other unforeseen circumstances.',
          'Where we become aware of a significant delay affecting your order, we may communicate the relevant information using the contact details provided with the order.',
          'Such delays do not automatically qualify an order for cancellation or refund unless otherwise applicable under our Returns & Cancellation Policy.',
        ],
      },
      {
        id: 'international-shipping',
        title: 'INTERNATIONAL SHIPPING',
        blocks: [
          'International shipping availability may vary depending on the product and destination.',
          'Where international shipping is offered, applicable shipping charges, duties, taxes, customs charges and other costs may be the responsibility of the customer unless explicitly stated otherwise.',
          'International deliveries may also be subject to customs clearance requirements and additional delivery time.',
          'Garage 27 is not responsible for delays caused by customs authorities, import restrictions or other procedures outside our control.',
          'Customers are responsible for ensuring that the ordered products can legally be imported into their destination country.',
        ],
      },
      {
        id: 'contact-us',
        title: 'CONTACT US',
        blocks: [
          'If you have questions about shipping, delivery or the status of your order, contact Garage 27:',
          { contact: true },
          'Please include your order number when contacting us about an existing order so that we can assist you more efficiently.',
        ],
      },
    ],
  },
  { slug: 'returns-cancellation', legacySlug: 'refunds', title: 'Returns & Cancellation', summary: 'Returns, refunds and cancelling an order or a build.' },
  { slug: 'terms-and-conditions', legacySlug: 'terms', title: 'Terms & Conditions', summary: 'The terms that apply when you use this site, buy parts or request a build.' },
]

export const legalHref = (d: Pick<LegalDoc, 'slug'>) => `/${d.slug}`

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL.find((d) => d.slug === slug)
}
