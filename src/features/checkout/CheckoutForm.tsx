'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart, type CartLine } from './cart-store'
import { PART_CATEGORY_META } from '@/data/catalogue'
import { CategoryPhoto } from '@/features/parts/CategoryPhoto'
import type { PartCategory } from '@/types/catalogue'
import { Honeypot, TextField } from '@/components/forms/FormField'
import { EmptyState, LoadingState } from '@/components/garage-ui/States'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { track } from '@/lib/analytics'
import { postJson } from '@/lib/http-client'
import { formatINR, valueBand } from '@/lib/pricing/money'
import { SHIPPING_RULES } from '@/lib/pricing/cart'
import { checkoutSchema, fieldErrors } from '@/lib/validation/schemas'
import type { ClientPaymentSession } from '@/lib/payments/types'

interface CheckoutResponse {
  reference: string
  payment: ClientPaymentSession
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open(): void; on(ev: string, cb: (r: unknown) => void): void }
  }
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('gateway script failed'))
    document.head.appendChild(s)
  })
}

const empty = { name: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }

/** `direct` = BUY NOW: check out exactly this line; the cart is left as it is. */
export function CheckoutForm({ direct = null }: { direct?: CartLine | null }) {
  const cart = useCart()
  const lines = direct ? [direct] : cart.lines
  const ready = direct ? true : cart.ready
  const subtotal = direct ? direct.price * direct.quantity : cart.subtotal
  const router = useRouter()
  const [values, setValues] = useState(empty)
  const [hp, setHp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [stage, setStage] = useState<'form' | 'creating' | 'gateway' | 'verifying'>('form')
  const [mockSession, setMockSession] = useState<{ reference: string; session: ClientPaymentSession } | null>(null)
  const started = useRef(false)
  // Long orders start folded on phones; desktop always shows the summary.
  const [summaryToggled, setSummaryToggled] = useState<boolean | null>(null)
  const summaryOpen = summaryToggled ?? lines.length <= 2

  useEffect(() => {
    if (ready && lines.length && !started.current) {
      started.current = true
      track('checkout_started', { items: lines.length, value_band: valueBand(subtotal) })
    }
  }, [ready, lines.length, subtotal])

  if (!ready) return <LoadingState message="CHECKING THE BENCH…" />
  if (!lines.length && stage === 'form')
    return (
      <EmptyState title="NOTHING TO CHECK OUT.">
        <Link className="btn btn--amber" href="/parts">
          BROWSE PARTS
        </Link>
      </EmptyState>
    )

  const shipping = subtotal >= SHIPPING_RULES.freeOver ? 0 : SHIPPING_RULES.flat
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const verify = async (reference: string, providerOrderId: string, providerPaymentId: string, signature: string) => {
    setStage('verifying')
    const r = await postJson<{ status: string }>('/api/payments/verify', { orderReference: reference, providerOrderId, providerPaymentId, signature })
    if (r.ok && r.data.status === 'paid') {
      track('payment_success', { value_band: valueBand(subtotal + shipping) })
    } else {
      track('payment_failed', { stage: 'verify' })
    }
    // Confirmation page shows the server's view of the order either way.
    router.push(`/order/success?ref=${encodeURIComponent(reference)}${direct ? '&direct=1' : ''}`)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(undefined)
    const payload = {
      items: lines.map((l) => ({ partId: l.partId, quantity: l.quantity })),
      contact: { name: values.name, email: values.email, phone: values.phone },
      address: { line1: values.line1, line2: values.line2, city: values.city, state: values.state, pincode: values.pincode },
      website: hp || undefined,
    }
    const local = checkoutSchema.safeParse(payload)
    if (!local.success) {
      setErrors(fieldErrors(local.error))
      return
    }
    setErrors({})
    setStage('creating')
    const r = await postJson<CheckoutResponse>('/api/checkout', payload)
    if (!r.ok) {
      setStage('form')
      setErrors(r.fields ?? {})
      setFormError(r.error)
      return
    }
    const { reference, payment } = r.data
    track('payment_started', { provider: payment.provider, value_band: valueBand(payment.amount) })

    if (payment.provider === 'mock') {
      setStage('gateway')
      setMockSession({ reference, session: payment })
      return
    }
    try {
      await loadRazorpay()
      setStage('gateway')
      const rzp = new window.Razorpay!({
        key: payment.publicKey,
        order_id: payment.providerOrderId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Garage 27',
        description: `Order ${reference}`,
        prefill: { name: values.name, email: values.email, contact: values.phone },
        theme: { color: '#e0262d' },
        handler: (resp: RazorpayResponse) => verify(reference, resp.razorpay_order_id, resp.razorpay_payment_id, resp.razorpay_signature),
        modal: {
          ondismiss: () => {
            setStage('form')
            track('payment_failed', { stage: 'dismissed' })
            setFormError('Payment window closed. Your cart is still here.')
          },
        },
      })
      rzp.on('payment.failed', () => track('payment_failed', { stage: 'gateway' }))
      rzp.open()
    } catch {
      setStage('form')
      setFormError('Couldn’t reach the payment gateway. Check your connection and try again.')
    }
  }

  const mockPay = async (outcome: 'success' | 'failure') => {
    if (!mockSession) return
    const r = await postJson<{ outcome: string; providerPaymentId?: string; signature?: string }>('/api/payments/mock', { providerOrderId: mockSession.session.providerOrderId, outcome })
    if (r.ok && r.data.outcome === 'success') {
      await verify(mockSession.reference, mockSession.session.providerOrderId, r.data.providerPaymentId!, r.data.signature!)
    } else {
      track('payment_failed', { stage: 'gateway' })
      setMockSession(null)
      setStage('form')
      setFormError('Payment didn’t go through. You have not been charged.')
    }
  }

  const busy = stage !== 'form'
  const total = subtotal + shipping
  const items = lines.reduce((n, l) => n + l.quantity, 0)
  return (
    <div className="co">
      <aside className={`co-sum${summaryOpen ? '' : ' is-collapsed'}`} aria-label="Order summary">
        <button type="button" className="co-sum__toggle" aria-expanded={summaryOpen} onClick={() => setSummaryToggled(!summaryOpen)}>
          <span className="co-step">ORDER SUMMARY</span>
          <span className="co-sum__peek">
            {items} ITEM{items === 1 ? '' : 'S'} · {formatINR(total)}
          </span>
        </button>
        <div className="co-sum__body">
          <ul className="co-sum__items">
            {lines.map((l) => {
              const meta = PART_CATEGORY_META[l.category as PartCategory]
              return (
                <li key={l.partId} className="co-line">
                  <span className="co-line__img">{meta && <CategoryPhoto meta={meta} sizes="72px" />}</span>
                  <span className="co-line__info">
                    <span className="co-line__cat">{meta?.label ?? ''}</span>
                    <span className="co-line__name">{l.name}</span>
                    <span className="co-line__qty">QTY {l.quantity}</span>
                  </span>
                  <span className="co-line__price">{formatINR(l.price * l.quantity)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="co-sum__totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{shipping ? formatINR(shipping) : 'FREE'}</dd>
            </div>
            <div className="co-sum__total">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
        </div>
      </aside>

      <form className="co-form" onSubmit={submit} noValidate aria-describedby={formError ? 'checkout-error' : undefined}>
        <fieldset disabled={busy} className="co-set">
          <legend className="co-step">
            <span>01</span> CUSTOMER DETAILS
          </legend>
          <div className="form-grid form-grid--2">
            <TextField label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors['contact.name']} className="span-2" />
            <TextField label="Mobile" type="tel" autoComplete="tel-national" inputMode="tel" value={values.phone} onChange={set('phone')} error={errors['contact.phone']} hint="For delivery updates only." />
            <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set('email')} error={errors['contact.email']} />
          </div>
        </fieldset>
        <fieldset disabled={busy} className="co-set">
          <legend className="co-step">
            <span>02</span> DELIVERY
          </legend>
          <div className="form-grid form-grid--2">
            <TextField label="Address" autoComplete="address-line1" value={values.line1} onChange={set('line1')} error={errors['address.line1']} className="span-2" />
            <TextField label="Apartment, landmark (optional)" autoComplete="address-line2" value={values.line2} onChange={set('line2')} className="span-2" />
            <TextField label="City" autoComplete="address-level2" value={values.city} onChange={set('city')} error={errors['address.city']} />
            <TextField label="State" autoComplete="address-level1" value={values.state} onChange={set('state')} error={errors['address.state']} />
            <TextField label="PIN code" autoComplete="postal-code" inputMode="numeric" maxLength={6} value={values.pincode} onChange={set('pincode')} error={errors['address.pincode']} />
          </div>
        </fieldset>
        <Honeypot value={hp} onChange={setHp} />
        <div className="co-set co-pay">
          <p className="co-step">
            <span>03</span> PAYMENT
          </p>
          <p className="co-pay__note">Payments are processed securely by our gateway. We never see or store your card details.</p>
          {formError && (
            <p className="form-error" id="checkout-error" role="alert">
              {formError}
            </p>
          )}
          <button type="submit" className="co-pay__cta" disabled={busy} aria-busy={busy || undefined}>
            <span>{stage === 'creating' ? 'OPENING GATEWAY…' : stage === 'verifying' ? 'CONFIRMING PAYMENT…' : stage === 'gateway' ? 'WAITING FOR PAYMENT…' : `PAY ${formatINR(total)}`}</span>
            <span className="co-pay__arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </form>

      {mockSession && (
        <div className="mock-gateway" role="dialog" aria-modal="true" aria-labelledby="mock-title">
          <div className="mock-gateway__card plate">
            <p className="label label--amber">DEVELOPMENT GATEWAY</p>
            <h2 id="mock-title" className="title">
              Simulate payment of {formatINR(mockSession.session.amount)}
            </h2>
            <p className="muted">No real money moves. The result is signed and verified server-side, like the live gateway.</p>
            <div className="mock-gateway__actions">
              <GarageButton variant="ignite" onClick={() => mockPay('success')} busy={stage === 'verifying'} autoFocus>
                PAY
              </GarageButton>
              <GarageButton onClick={() => mockPay('failure')} disabled={stage === 'verifying'}>
                FAIL
              </GarageButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
