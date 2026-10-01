import { z } from 'zod'
import { PAYMENT_METHODS } from '@/lib/pricing/cart'

/** Shared client + server validation. Messages are in the garage voice. */

const trimmed = (min: number, max: number, msg: string) =>
  z.string().trim().min(min, msg).max(max, `Keep it under ${max} characters.`)

export const contactSchema = z.object({
  name: trimmed(2, 80, 'Tell us your name.'),
  email: z.string().trim().toLowerCase().email('That email doesn’t look right.').max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Use a 10-digit Indian mobile number.')),
})
export type ContactInput = z.infer<typeof contactSchema>

/** Honeypot: real people never fill this hidden field. */
const honeypot = z.string().max(0).optional()

export const configurationSchema = z.object({
  bikeId: z.string().min(1).max(64),
  colourId: z.string().min(1).max(64),
  components: z.record(z.string().max(64), z.string().max(64).nullable()),
})

export const quoteRequestSchema = z.object({
  configuration: configurationSchema,
  contact: contactSchema,
  city: trimmed(2, 60, 'Which city are you in?'),
  notes: z.string().trim().max(1000, 'Keep notes under 1000 characters.').optional().default(''),
  /** Client estimate — informational only; the server recalculates. */
  clientEstimate: z.number().int().nonnegative().optional(),
  website: honeypot,
})
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

export const serviceRequestSchema = z.object({
  serviceId: z.string().min(1).max(64),
  bike: trimmed(2, 80, 'Which bike is it?'),
  requirement: trimmed(10, 600, 'Give us a line or two (10+ characters).'),
  location: trimmed(2, 80, 'Where should we meet you?'),
  contact: contactSchema,
  notes: z.string().trim().max(1000).optional().default(''),
  website: honeypot,
})
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>

export const addressSchema = z.object({
  line1: trimmed(4, 120, 'Add your street address.'),
  line2: z.string().trim().max(120).optional().default(''),
  city: trimmed(2, 60, 'Add your city.'),
  state: trimmed(2, 60, 'Add your state.'),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Use a 6-digit PIN code.'),
})

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ partId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(10) }))
    .min(1, 'Your cart is empty.')
    .max(20),
  contact: contactSchema,
  address: addressSchema,
  /** Only the method is accepted from the browser — never an amount. */
  paymentMethod: z.enum(PAYMENT_METHODS).default('online'),
  website: honeypot,
})
export type CheckoutInput = z.infer<typeof checkoutSchema>

export const verifyPaymentSchema = z.object({
  orderReference: z.string().regex(/^G27-O-[A-Z0-9]{8}$/),
  providerOrderId: z.string().min(1).max(100),
  providerPaymentId: z.string().min(1).max(100),
  signature: z.string().min(1).max(256),
})

/** Flatten zod issues into { "contact.email": "message" } for field display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

// ── Reference uploads ────────────────────────────────────────────────────
/** About → LET'S TALK: one way to reach the visitor (WhatsApp number or email). */
const EMAIL = z.string().email()
const INDIAN_MOBILE = /^(\+?91)?[6-9]\d{9}$/
export const enquirySchema = z.object({
  name: trimmed(2, 80, 'Tell us your name.'),
  reach: z
    .string()
    .trim()
    .max(120, 'Keep it under 120 characters.')
    .refine((v) => EMAIL.safeParse(v).success || INDIAN_MOBILE.test(v.replace(/[\s-]/g, '')), 'Add a WhatsApp number or an email.'),
  message: trimmed(10, 1000, 'Tell us what’s on your mind (10+ characters).'),
  link: z.union([z.literal(''), z.string().trim().url('That link doesn’t look right.').max(500)]).optional(),
  website: honeypot,
})
export type EnquiryInput = z.infer<typeof enquirySchema>

/** Service → LET'S TALK asks for a phone number only; it travels in `reach`, which the server already accepts. */
export const enquiryPhoneSchema = enquirySchema.extend({
  reach: z
    .string()
    .trim()
    .refine((v) => INDIAN_MOBILE.test(v.replace(/[\s-]/g, '')), 'Use a 10-digit Indian mobile number.'),
})

/** Enquiry references may also be PDFs. */
export const ENQUIRY_ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const

export const UPLOAD_LIMITS = {
  maxFiles: 3,
  maxBytesPerFile: 3 * 1024 * 1024,
  accept: ['image/jpeg', 'image/png', 'image/webp'] as const,
}
