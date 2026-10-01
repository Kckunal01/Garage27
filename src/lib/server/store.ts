import 'server-only'
import { randomBytes } from 'node:crypto'
import { getAdminSupabase } from '@/lib/supabase/admin'
import type { BuildConfiguration, Paise } from '@/types/catalogue'
import type { BuildEstimate } from '@/features/build/engine'
import type { PaymentMethod } from '@/lib/pricing/cart'

/**
 * Persistence for customer records. Supabase (service role) in production;
 * an in-memory store for local development only. Production without Supabase
 * refuses writes rather than silently dropping customer data.
 */

/** `placed` = cash-on-delivery order accepted; payment is collected on delivery. */
export type OrderStatus = 'pending' | 'awaiting_payment' | 'placed' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'fulfilled'

export interface Contact {
  name: string
  email: string
  phone: string
}

export interface QuoteRecord {
  reference: string
  configuration: BuildConfiguration
  priceSnapshot: BuildEstimate
  estimatedTotal: Paise
  contact: Contact
  city?: string
  notes?: string
  attachments: string[]
}

export interface ServiceRequestRecord {
  reference: string
  serviceId: string
  bike: string
  requirement: string
  location: string
  contact: Contact
  notes?: string
  attachments: string[]
}

/** About → LET'S TALK: a free-form enquiry with optional references. */
export interface EnquiryRecord {
  reference: string
  name: string
  /** WhatsApp number or email, as given. */
  reach: string
  message: string
  link?: string
  attachments: string[]
}

export interface OrderItemRecord {
  partId: string
  name: string
  sku: string
  unitPrice: Paise
  quantity: number
}

export interface OrderRecord {
  reference: string
  status: OrderStatus
  subtotal: Paise
  /** 4% platform fee on the products. */
  platformFee: Paise
  shipping: Paise
  /** Cash-on-delivery surcharge; 0 for online payment. */
  codFee: Paise
  total: Paise
  currency: 'INR'
  paymentMethod: PaymentMethod
  contact: Contact
  shippingAddress: Record<string, string>
  paymentProvider: string
  providerOrderId?: string
  items: OrderItemRecord[]
  /** When the order was placed (ISO). Set by the store on insert. */
  createdAt?: string
}

export interface PaymentEvent {
  orderReference: string
  provider: string
  providerPaymentId?: string
  providerEventId: string
  status: 'created' | 'captured' | 'failed' | 'refunded'
  amount: Paise
  raw?: unknown
}

export interface Store {
  kind: 'supabase' | 'memory'
  insertQuote(q: QuoteRecord): Promise<void>
  insertServiceRequest(s: ServiceRequestRecord): Promise<void>
  insertEnquiry(e: EnquiryRecord): Promise<void>
  insertOrder(o: OrderRecord): Promise<void>
  setOrderProviderId(reference: string, providerOrderId: string, status: OrderStatus): Promise<void>
  getOrderByReference(reference: string): Promise<OrderRecord | null>
  getOrderByProviderId(providerOrderId: string): Promise<OrderRecord | null>
  /** Returns false if the event was already recorded (idempotency). */
  recordPaymentEvent(e: PaymentEvent): Promise<boolean>
  setOrderStatus(reference: string, status: OrderStatus, onlyFrom?: OrderStatus[]): Promise<void>
}

export class StoreUnavailableError extends Error {
  constructor() {
    super('Persistence is not configured')
  }
}

/** Human-friendly, unguessable reference, e.g. G27-Q-7KX3M9QD. */
export function makeReference(prefix: 'Q' | 'S' | 'O' | 'E'): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const bytes = randomBytes(8)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return `G27-${prefix}-${out}`
}

// ── In-memory (development) ──────────────────────────────────────────────
interface MemoryDb {
  quotes: QuoteRecord[]
  services: ServiceRequestRecord[]
  enquiries: EnquiryRecord[]
  orders: Map<string, OrderRecord>
  events: Set<string>
}
const g = globalThis as unknown as { __g27db?: MemoryDb }
const memory: MemoryDb = (g.__g27db ??= { quotes: [], services: [], enquiries: [], orders: new Map(), events: new Set() } as MemoryDb)
memory.enquiries ??= [] // a dev server started before enquiries existed

const memoryStore: Store = {
  kind: 'memory',
  async insertQuote(q) {
    memory.quotes.push(q)
  },
  async insertServiceRequest(s) {
    memory.services.push(s)
  },
  async insertEnquiry(e) {
    memory.enquiries.push(e)
  },
  async insertOrder(o) {
    memory.orders.set(o.reference, { ...structuredClone(o), createdAt: o.createdAt ?? new Date().toISOString() })
  },
  async setOrderProviderId(reference, providerOrderId, status) {
    const o = memory.orders.get(reference)
    if (o) Object.assign(o, { providerOrderId, status })
  },
  async getOrderByReference(reference) {
    return memory.orders.get(reference) ?? null
  },
  async getOrderByProviderId(id) {
    return [...memory.orders.values()].find((o) => o.providerOrderId === id) ?? null
  },
  async recordPaymentEvent(e) {
    if (memory.events.has(e.providerEventId)) return false
    memory.events.add(e.providerEventId)
    return true
  },
  async setOrderStatus(reference, status, onlyFrom) {
    const o = memory.orders.get(reference)
    if (o && (!onlyFrom || onlyFrom.includes(o.status))) o.status = status
  },
}

// ── Supabase ─────────────────────────────────────────────────────────────
function supabaseStore(): Store | null {
  const sb = getAdminSupabase()
  if (!sb) return null
  const must = <T extends { error: { message: string; code?: string } | null }>(r: T, what: string) => {
    if (r.error) throw new Error(`${what}: ${r.error.message}`)
    return r
  }
  const toOrder = (row: Record<string, unknown>, items: Record<string, unknown>[]): OrderRecord => ({
    reference: row.reference as string,
    status: row.status as OrderStatus,
    subtotal: row.subtotal as number,
    platformFee: (row.platform_fee as number) ?? 0,
    shipping: row.shipping as number,
    codFee: (row.cod_fee as number) ?? 0,
    total: row.total as number,
    currency: 'INR',
    paymentMethod: ((row.payment_method as PaymentMethod) ?? 'online'),
    contact: { name: row.customer_name as string, email: row.customer_email as string, phone: row.customer_phone as string },
    shippingAddress: row.shipping_address as Record<string, string>,
    paymentProvider: row.payment_provider as string,
    providerOrderId: (row.provider_order_id as string) ?? undefined,
    createdAt: (row.created_at as string) ?? undefined,
    items: items.map((i) => ({
      partId: i.part_id as string,
      name: i.name as string,
      sku: i.sku as string,
      unitPrice: i.unit_price as number,
      quantity: i.quantity as number,
    })),
  })
  const loadOrder = async (column: 'reference' | 'provider_order_id', value: string) => {
    const r = must(await sb.from('orders').select('*, order_items(*)').eq(column, value).maybeSingle(), 'order.get')
    if (!r.data) return null
    return toOrder(r.data, (r.data.order_items as Record<string, unknown>[]) ?? [])
  }

  return {
    kind: 'supabase',
    async insertQuote(q) {
      const conf = must(
        await sb.from('build_configurations').insert({ bike_id: q.configuration.bikeId, configuration: q.configuration }).select('id').single(),
        'build_configuration.insert',
      )
      must(
        await sb.from('quotes').insert({
          reference: q.reference,
          build_configuration_id: conf.data!.id,
          configuration: q.configuration,
          price_snapshot: q.priceSnapshot,
          estimated_total: q.estimatedTotal,
          customer_name: q.contact.name,
          customer_email: q.contact.email,
          customer_phone: q.contact.phone,
          city: q.city,
          notes: q.notes,
          attachments: q.attachments,
        }),
        'quote.insert',
      )
    },
    async insertServiceRequest(s) {
      must(
        await sb.from('service_requests').insert({
          reference: s.reference,
          service_id: s.serviceId,
          bike: s.bike,
          requirement: s.requirement,
          location: s.location,
          customer_name: s.contact.name,
          customer_email: s.contact.email,
          customer_phone: s.contact.phone,
          notes: s.notes,
          attachments: s.attachments,
        }),
        'service_request.insert',
      )
    },
    async insertEnquiry(e) {
      must(
        await sb.from('enquiries').insert({
          reference: e.reference,
          customer_name: e.name,
          customer_contact: e.reach,
          message: e.message,
          link: e.link || null,
          attachments: e.attachments,
        }),
        'enquiry.insert',
      )
    },
    async insertOrder(o) {
      const r = must(
        await sb
          .from('orders')
          .insert({
            reference: o.reference,
            status: o.status,
            subtotal: o.subtotal,
            platform_fee: o.platformFee,
            shipping: o.shipping,
            cod_fee: o.codFee,
            total: o.total,
            currency: o.currency,
            payment_method: o.paymentMethod,
            customer_name: o.contact.name,
            customer_email: o.contact.email,
            customer_phone: o.contact.phone,
            shipping_address: o.shippingAddress,
            payment_provider: o.paymentProvider,
          })
          .select('id')
          .single(),
        'order.insert',
      )
      must(
        await sb.from('order_items').insert(
          o.items.map((i) => ({ order_id: r.data!.id, part_id: i.partId, name: i.name, sku: i.sku, unit_price: i.unitPrice, quantity: i.quantity })),
        ),
        'order_items.insert',
      )
    },
    async setOrderProviderId(reference, providerOrderId, status) {
      must(
        await sb.from('orders').update({ provider_order_id: providerOrderId, status, updated_at: new Date().toISOString() }).eq('reference', reference),
        'order.provider',
      )
    },
    getOrderByReference: (ref) => loadOrder('reference', ref),
    getOrderByProviderId: (id) => loadOrder('provider_order_id', id),
    async recordPaymentEvent(e) {
      const order = must(await sb.from('orders').select('id').eq('reference', e.orderReference).single(), 'payment.order')
      const r = await sb.from('payments').insert({
        order_id: order.data!.id,
        provider: e.provider,
        provider_payment_id: e.providerPaymentId,
        provider_event_id: e.providerEventId,
        status: e.status,
        amount: e.amount,
        raw: e.raw ?? null,
      })
      if (r.error?.code === '23505') return false // unique violation → already processed
      must(r, 'payment.insert')
      return true
    },
    async setOrderStatus(reference, status, onlyFrom) {
      let q = sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('reference', reference)
      if (onlyFrom?.length) q = q.in('status', onlyFrom)
      must(await q, 'order.status')
    },
  }
}

export function getStore(): Store {
  const remote = supabaseStore()
  if (remote) return remote
  // ALLOW_MEMORY_STORE lets a throwaway preview deployment demo the flows; records are not persisted.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MEMORY_STORE !== 'true') throw new StoreUnavailableError()
  return memoryStore
}
