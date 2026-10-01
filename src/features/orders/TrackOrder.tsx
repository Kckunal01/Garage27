'use client'

import { useState } from 'react'
import { TextField } from '@/components/forms/FormField'
import { CopyCode } from '@/components/garage-ui/CopyCode'
import { GarageButton } from '@/components/garage-ui/GarageButton'
import { formatINR } from '@/lib/pricing/money'

interface OrderView {
  reference: string
  status: string
  total: number
  items: { name: string; quantity: number; unitPrice: number }[]
}

const STATUS: Record<string, string> = {
  pending: 'Order received — waiting for payment.',
  awaiting_payment: 'Waiting for payment confirmation.',
  placed: 'Order placed — cash on delivery. We’re packing your parts.',
  paid: 'Paid — we’re packing your parts.',
  fulfilled: 'Dispatched — on its way to you.',
  failed: 'Payment failed — you have not been charged.',
  cancelled: 'Cancelled.',
  refunded: 'Refunded.',
}

/** Looks up an order by its unguessable reference via the existing status API. */
export function TrackOrder() {
  const [ref, setRef] = useState('')
  const [error, setError] = useState<string>()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const reference = ref.trim().toUpperCase()
    setOrder(null)
    if (!/^G27-O-[A-Z0-9]{8}$/.test(reference)) {
      setError('Use the reference from your confirmation, e.g. G27-O-7KX3M9QD.')
      return
    }
    setError(undefined)
    setBusy(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`, { cache: 'no-store' })
      if (res.status === 404) setError('We couldn’t find that order. Check the reference and try again.')
      else if (!res.ok) setError('SOMETHING MISFIRED. TRY AGAIN.')
      else setOrder((await res.json()) as OrderView)
    } catch {
      setError('No signal. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="track">
      <form className="track__form" onSubmit={submit} noValidate>
        <TextField label="Order reference" placeholder="G27-O-XXXXXXXX" autoCapitalize="characters" autoComplete="off" value={ref} onChange={(e) => setRef(e.target.value)} error={error} />
        <GarageButton type="submit" variant="ignite" block busy={busy}>
          TRACK ORDER
        </GarageButton>
      </form>
      {order && (
        <div className="confirm plate" role="status">
          <CopyCode code={order.reference} label="TRACKING / ORDER CODE" />
          <p className="title">{STATUS[order.status] ?? order.status}</p>
          <ul className="summary__items">
            {order.items.map((i) => (
              <li key={i.name}>
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span>{formatINR(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="confirm__total">
            <span className="label">TOTAL</span> {formatINR(order.total)}
          </p>
        </div>
      )}
    </div>
  )
}
