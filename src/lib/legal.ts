/**
 * Legal pages. Garage 27 supplies the policy text — it is never invented here.
 * A document is an optional intro plus numbered topics; each topic is a list
 * of blocks (paragraphs, bullet lists, or the contact block). A document
 * without approved topics yet says so plainly.
 */
/**
 * `contact`: Garage 27's email and phone; `name: false` leaves out the "Garage 27" line.
 * `tiers`: the Moneyback / Buyback quality tiers — the percentage is the focal point.
 */
export type LegalBlock = string | { list: string[] } | { contact: true; name?: boolean } | { tiers: LegalTier[] }

export interface LegalTier {
  tier: 1 | 2 | 3 | 4
  percent: string
  text: string
}

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
  {
    slug: 'returns-cancellation',
    legacySlug: 'refunds',
    title: 'Returns & Cancellation',
    summary: 'Returns, refunds and cancelling an order or a build.',
    intro: [
      'Garage 27 wants you to be confident in every purchase and service you make through our platform.',
      'This Returns & Cancellation Policy explains when an order may be cancelled, when a product may be returned, how eligible returns are assessed, and how refunds or Moneyback / Buyback amounts may be determined.',
      'Because Garage 27 operates across products, services, motorcycle customisation and build-related requests, return and cancellation eligibility may differ depending on the nature of the product or service.',
      'Please review the applicable conditions before placing an order or requesting a service.',
    ],
    topics: [
      {
        id: 'cancellation-before-dispatch',
        title: 'CANCELLATION BEFORE DISPATCH',
        blocks: [
          'You may request cancellation of an order before it has been dispatched.',
          'To request a cancellation, contact Garage 27 as soon as possible using:',
          'CONTACT',
          'Cancellation requests are subject to the status of the order.',
          'If an order has already entered processing, been prepared for dispatch, or otherwise progressed beyond a stage where cancellation is reasonably possible, Garage 27 may not be able to cancel it.',
          'Where a cancellation is approved before dispatch and payment has already been received, the applicable refund will be processed according to the payment method and applicable refund terms.',
        ],
      },
      {
        id: 'cancellation-after-dispatch',
        title: 'CANCELLATION AFTER DISPATCH',
        blocks: [
          'Once an order has been dispatched, cancellation may no longer be possible.',
          'If you no longer require an order after dispatch, you should contact Garage 27 and follow the applicable return or delivery process.',
          'Refusing delivery does not automatically constitute an approved cancellation or refund.',
          'Any refund or return will be subject to the applicable eligibility requirements of this Policy.',
        ],
      },
      {
        id: 'service-and-build-cancellations',
        title: 'SERVICE & BUILD CANCELLATIONS',
        blocks: [
          'Service requests, consultations, customisation requests and build requests may involve preparation, design work, procurement, scheduling or other activities before the actual work begins.',
          'Submitting a service or build request does not automatically mean that Garage 27 has accepted the work.',
          'Before work begins, Garage 27 may confirm the scope, pricing, parts, requirements and expected timeline.',
          'Cancellation of a service or build request may therefore depend on the stage reached by the request and whether Garage 27 has already incurred costs or commenced work.',
          'Where applicable, any cancellation terms, committed costs or non-refundable amounts will be communicated before the relevant work proceeds.',
        ],
      },
      {
        id: 'return-eligibility',
        title: 'RETURN ELIGIBILITY',
        blocks: [
          'A product may be eligible for return where it meets the applicable return requirements communicated by Garage 27.',
          'To be considered for a return, the product should generally:',
          {
            list: [
              'Be purchased directly through Garage 27 or through an authorised Garage 27 sales channel',
              'Be within the applicable return period, where a return period applies',
              'Be in the condition required for return',
              'Include the applicable components, accessories and packaging where required',
              'Not have been materially damaged, modified or misused',
              'Be accompanied by the relevant order or purchase information',
            ],
          },
          'Certain products may have different return conditions because of their nature, installation requirements, customisation or hygiene/safety considerations.',
          'Eligibility is determined after reviewing the circumstances of the return.',
        ],
      },
      {
        id: 'non-returnable-and-custom-products',
        title: 'NON-RETURNABLE & CUSTOM PRODUCTS',
        blocks: [
          'Certain products may not be eligible for return because of their nature or because they have been specifically prepared or customised for the customer.',
          'This may include products that are:',
          {
            list: [
              'Custom-made',
              'Specially ordered',
              'Personalised',
              'Modified according to customer instructions',
              'Installed or altered after delivery',
              'Made specifically for a particular motorcycle or configuration',
            ],
          },
          'A product being unsuitable because of customer-provided information, incorrect motorcycle details or a customer-requested specification does not automatically make it eligible for return.',
          'Where a product has specific return restrictions, those restrictions may be communicated on the product page or before purchase.',
          'Nothing in this section limits any rights that cannot legally be excluded under applicable law.',
        ],
      },
      {
        id: 'damaged-incorrect-or-defective-products',
        title: 'DAMAGED, INCORRECT OR DEFECTIVE PRODUCTS',
        blocks: [
          'If you receive a product that appears damaged, incorrect or materially different from what you ordered, contact Garage 27 as soon as reasonably possible.',
          'Please provide:',
          {
            list: [
              'Order number',
              'Description of the issue',
              'Photographs or videos where relevant',
              'Photographs of the packaging where relevant',
              'Any other information reasonably required to investigate the issue',
            ],
          },
          'Garage 27 may review the information provided and, where necessary, inspect the product before determining the appropriate resolution.',
          'Depending on the circumstances, the resolution may include replacement, repair, return, refund or another appropriate solution.',
          'The resolution will depend on the nature of the issue, product availability and applicable law.',
        ],
      },
      {
        id: 'return-request-process',
        title: 'RETURN REQUEST PROCESS',
        blocks: [
          'To request a return, contact Garage 27 using:',
          'CONTACT',
          'Please provide:',
          {
            list: [
              'Your name',
              'Order number',
              'Product details',
              'Reason for the return',
              'Relevant photographs or videos where applicable',
            ],
          },
          'Garage 27 may provide return instructions after reviewing the request.',
          'Do not send products back to Garage 27 without receiving return instructions where such instructions are required.',
          'Unauthorised returns may cause delays in processing the request.',
        ],
      },
      {
        id: 'return-inspection-and-approval',
        title: 'RETURN INSPECTION & APPROVAL',
        blocks: [
          'Returned products may be inspected before a return, replacement, refund or Moneyback / Buyback amount is approved.',
          'The inspection may consider:',
          {
            list: [
              'Overall product condition',
              'Physical damage',
              'Signs of misuse',
              'Wear and tear',
              'Missing components',
              'Missing accessories',
              'Alterations or modifications',
              'Installation condition',
              'Packaging where relevant',
              'Product authenticity',
              'Compatibility-related issues',
              'Other factors relevant to the particular product',
            ],
          },
          'The condition of a returned product may affect the resolution available under this Policy.',
          'Where an inspection is required, Garage 27 may wait until the inspection has been completed before confirming the final outcome.',
        ],
      },
      {
        id: 'moneyback-buyback-programme',
        title: 'MONEYBACK / BUYBACK PROGRAMME',
        blocks: [
          'Garage 27 may operate a Moneyback / Buyback Programme for eligible products.',
          'Under this programme, an eligible product may qualify for a partial moneyback amount based on the quality tier assigned after evaluation.',
          'The applicable quality tiers are:',
          {
            tiers: [
              {
                tier: 1,
                percent: '50%',
                text: 'Eligible products meeting the highest applicable condition and eligibility requirements may qualify for 50% Moneyback.',
              },
              {
                tier: 2,
                percent: '30%',
                text: 'Eligible products meeting the applicable second-level condition and eligibility requirements may qualify for 30% Moneyback.',
              },
              {
                tier: 3,
                percent: '10%',
                text: 'Eligible products meeting the applicable third-level condition and eligibility requirements may qualify for 10% Moneyback.',
              },
              {
                tier: 4,
                percent: '0%',
                text: 'Products that fall into the applicable Tier 4 condition or otherwise do not qualify for the programme may receive 0% Moneyback.',
              },
            ],
          },
          'The percentages above do not represent an automatic or unconditional refund.',
          'The applicable tier is determined after evaluation of the product and its eligibility under the programme.',
        ],
      },
      {
        id: 'moneyback-valuation-and-quality-assessment',
        title: 'MONEYBACK VALUATION & QUALITY ASSESSMENT',
        blocks: [
          'The Moneyback percentage is applied to the applicable eligible programme value determined for the product.',
          'Unless specifically stated otherwise for a particular programme or product, the Moneyback percentage should not automatically be interpreted as a percentage of the original purchase invoice.',
          'The applicable valuation may take into account factors including:',
          {
            list: [
              'Product condition',
              'Current usability',
              'Age or usage where relevant',
              'Missing components',
              'Physical damage',
              'Modifications',
              'Product completeness',
              'Applicable market or programme valuation',
              'Other relevant condition factors',
            ],
          },
          'Garage 27 may inspect the product before assigning a quality tier and determining the applicable Moneyback amount.',
          'The final Moneyback amount is subject to the applicable programme criteria and inspection outcome.',
        ],
      },
      {
        id: 'quality-tier-criteria',
        title: 'QUALITY TIER CRITERIA',
        blocks: [
          'The quality assessment may broadly consider the following:',
          {
            tiers: [
              {
                tier: 1,
                percent: '50%',
                text: 'Products in strong eligible condition with the required components and without material damage, unauthorised modifications or significant signs of misuse.',
              },
              {
                tier: 2,
                percent: '30%',
                text: 'Products showing reasonable signs of use or minor condition issues while remaining functional and otherwise eligible for the programme.',
              },
              {
                tier: 3,
                percent: '10%',
                text: 'Products showing significant usage, visible wear, cosmetic deterioration or other condition issues while still meeting the minimum requirements for programme eligibility.',
              },
              {
                tier: 4,
                percent: '0%',
                text: 'Products that do not meet the applicable eligibility requirements or have conditions that prevent them from qualifying for Moneyback / Buyback.',
              },
            ],
          },
          "Tier classification is subject to inspection and the specific product's applicable requirements.",
        ],
      },
      {
        id: 'modifications-damage-and-missing-components',
        title: 'MODIFICATIONS, DAMAGE & MISSING COMPONENTS',
        blocks: [
          'Unauthorised modifications, significant damage, missing components, tampering, counterfeit components or other material alterations may affect eligibility or reduce the applicable Moneyback / Buyback valuation.',
          'Products may also be rejected from the programme where their condition prevents reasonable evaluation or resale, reuse or other intended programme treatment.',
          'Normal wear and tear may be considered differently from damage caused by misuse, neglect, accident, improper installation or unauthorised modification.',
          'Garage 27 may request additional information or evidence where necessary to assess the condition of a product.',
        ],
      },
      {
        id: 'refunds',
        title: 'REFUNDS',
        blocks: [
          'Where a refund is approved, the refund amount will depend on the applicable cancellation, return or resolution terms.',
          'Refunds may be subject to deductions or exclusions where permitted and applicable, including charges that are not refundable under the relevant transaction terms.',
          'Shipping charges, installation charges, customisation charges or other service-related charges may be treated separately depending on the circumstances.',
          'Where a Moneyback / Buyback programme applies, the amount payable will be determined according to the applicable programme valuation and quality tier rather than automatically being treated as a standard product refund.',
          'Refunds will generally be processed through the applicable payment method or another appropriate method communicated by Garage 27.',
        ],
      },
      {
        id: 'shipping-and-return-costs',
        title: 'SHIPPING & RETURN COSTS',
        blocks: [
          'Where a return is approved, Garage 27 may provide instructions regarding how the product should be returned.',
          'Responsibility for return shipping or other logistics costs may depend on the reason for the return and the applicable product or service terms.',
          'Where the issue is determined to be attributable to an incorrect, damaged or defective product supplied by Garage 27, Garage 27 may determine an appropriate resolution for the applicable return or shipping costs.',
          "Where a return is requested for reasons unrelated to a product issue, applicable return or shipping costs may be the customer's responsibility where permitted.",
          'Any applicable charges will be communicated where reasonably practicable.',
        ],
      },
      {
        id: 'exchanges-and-replacements',
        title: 'EXCHANGES & REPLACEMENTS',
        blocks: [
          'Where appropriate, Garage 27 may offer an exchange or replacement instead of a refund.',
          'An exchange or replacement may depend on:',
          {
            list: [
              'Product availability',
              'Product condition',
              'Return eligibility',
              'Nature of the issue',
              'Compatibility',
              'Inspection outcome',
            ],
          },
          'A replacement product may not necessarily be identical where the original product is unavailable.',
          'In such cases, Garage 27 may communicate the available alternatives or applicable resolution.',
        ],
      },
      {
        id: 'service-returns-and-completed-work',
        title: 'SERVICE RETURNS & COMPLETED WORK',
        blocks: [
          'Services such as installation, customisation, paint, upholstery, detailing and restoration are different from standard product purchases.',
          'Once a service has been performed, return eligibility may not operate in the same way as it does for an unused physical product.',
          'If you believe a service was not completed according to the confirmed scope or there is an issue with the completed work, contact Garage 27 as soon as reasonably possible.',
          'Garage 27 may review the original scope, work performed, condition of the motorcycle and circumstances of the complaint before determining an appropriate resolution.',
          'Where a service involves customer-approved customisation, changes made according to the confirmed customer instructions may not automatically qualify for reversal or refund simply because the customer subsequently changes their preference.',
          'Nothing in this section limits any rights that cannot legally be excluded.',
        ],
      },
      {
        id: 'build-and-customisation-cancellations',
        title: 'BUILD & CUSTOMISATION CANCELLATIONS',
        blocks: [
          'Build and customisation projects may involve design, procurement, preparation, parts allocation, labour and scheduling before completion.',
          'Once Garage 27 has begun work or committed resources to a confirmed project, cancellation may be subject to the costs already incurred and the stage of the project.',
          'Customer-requested changes after approval may result in additional costs or changes to the timeline.',
          'Garage 27 will communicate material changes in scope or pricing where reasonably practicable before proceeding with additional work.',
        ],
      },
      {
        id: 'fraudulent-or-abusive-claims',
        title: 'FRAUDULENT OR ABUSIVE CLAIMS',
        blocks: [
          'Garage 27 may reject or investigate claims where there is reasonable evidence of:',
          {
            list: [
              'Fraud',
              'False information',
              'Product tampering',
              'Intentional damage',
              'Misrepresentation',
              'Repeated abusive returns',
              'Counterfeit products',
              'Unauthorised alteration',
              'Abuse of the Moneyback / Buyback Programme',
            ],
          },
          'Where necessary, Garage 27 may request additional documentation, photographs, product information or other evidence before processing a claim.',
        ],
      },
      {
        id: 'statutory-rights',
        title: 'STATUTORY RIGHTS',
        blocks: [
          "This Policy is intended to explain Garage 27's standard return, cancellation and Moneyback / Buyback processes.",
          'Nothing in this Policy is intended to remove, restrict or override any consumer rights or remedies that cannot legally be excluded or limited under applicable law.',
          'Where applicable law provides a customer with a mandatory right or remedy, that right will continue to apply.',
        ],
      },
      {
        id: 'policy-exceptions',
        title: 'POLICY EXCEPTIONS',
        blocks: [
          'Certain products, services or transactions may have specific terms because of their nature, customisation, installation, availability or other circumstances.',
          'Where product-specific or service-specific terms are provided before purchase or approval, those terms may apply in addition to this Policy.',
          'If there is a conflict between a specific written term communicated for a particular transaction and this general Policy, the specific applicable term may govern that transaction to the extent permitted by law.',
        ],
      },
      {
        id: 'changes-to-this-policy',
        title: 'CHANGES TO THIS POLICY',
        blocks: [
          'Garage 27 may update this Returns & Cancellation Policy from time to time to reflect changes in:',
          {
            list: [
              'Products',
              'Services',
              'Return processes',
              'Moneyback / Buyback programmes',
              'Business practices',
              'Technology',
              'Applicable requirements',
            ],
          },
          'Any updated version will be published on this page with the revised effective date.',
        ],
      },
      {
        id: 'contact-us',
        title: 'CONTACT US',
        blocks: [
          'If you have questions about a return, cancellation, refund or Moneyback / Buyback request, contact Garage 27:',
          'CONTACT_FULL',
          'For an existing order, please include your order number and relevant product or service details so that we can assist you efficiently.',
        ],
      },
    ],
  },
  {
    slug: 'terms-and-conditions',
    legacySlug: 'terms',
    title: 'Terms & Conditions',
    summary: 'The terms that apply when you use this site, buy parts or request a build.',
  },
]

export const legalHref = (d: Pick<LegalDoc, 'slug'>) => `/${d.slug}`

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL.find((d) => d.slug === slug)
}
