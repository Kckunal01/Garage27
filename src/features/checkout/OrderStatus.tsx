'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from './cart-store'
import { cancelAdding, clearSelection } from './selection'
import { ErrorState, LoadingState } from '@/components/garage-ui/States'
import { formatINR } from '@/lib/pricing/money'

interface OrderView {
  reference: string
  status: string
  paymentMethod?: 'online' | 'cod'
  codFee?: number
  total: number
  items: { name: string; quantity: number; unitPrice: number }[]
}

const FINAL = new Set(['placed', 'paid', 'failed', 'cancelled', 'refunded', 'fulfilled'])

/** Polls the server's view of the order. The page never trusts the client callback. */
export function OrderStatus() {
  const search = useSearchParams()
  const ref = search.get('ref') ?? ''
  // A BUY NOW order came from the checkout selection, never the cart: on
  // success the selection is emptied and the cart stays exactly as it is.
  const keepCart = search.get('direct') === '1'
  const { clear } = useCart()
  const [order, setOrder] = useState<OrderView | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const cleared = useRef(false)

  useEffect(() => {
    if (!ref) return
    let stop = false
    let tries = 0
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as OrderView
        if (stop) return
        setOrder(data)
        setError(false)
        if ((data.status === 'paid' || data.status === 'placed') && !cleared.current) {
          cleared.current = true
          if (keepCart) {
            clearSelection()
            cancelAdding()
          } else clear()
        }
        if (!FINAL.has(data.status) && ++tries < 20) window.setTimeout(poll, 2500)
      } catch {
        if (!stop) setError(true)
      }
    }
    poll()
    return () => {
      stop = true
    }
  }, [ref, clear, attempt, keepCart])

  if (!ref) return <ErrorState title="NO ORDER REFERENCE.">Check the link in your confirmation email.</ErrorState>
  if (error && !order) return <ErrorState onRetry={() => setAttempt((a) => a + 1)} />
  if (!order) return <LoadingState message="CONFIRMING WITH THE GATEWAY…" />

  const cod = order.paymentMethod === 'cod'
  const placed = order.status === 'placed'
  const paid = order.status === 'paid' || order.status === 'fulfilled'
  const failed = order.status === 'failed' || order.status === 'cancelled'
  return (
    <div className="confirm plate">
      <p className={`label ${paid || placed ? 'label--amber' : failed ? 'label--red' : ''}`}>{placed ? 'ORDER PLACED · CASH ON DELIVERY' : paid ? 'PAYMENT CONFIRMED' : failed ? 'PAYMENT FAILED' : 'AWAITING CONFIRMATION'}</p>
      <h1 className="headline">{paid || placed ? 'It’s on the bench.' : failed ? 'That didn’t go through.' : 'Hang tight.'}</h1>
      <p className="lede">
        {placed
          ? `We’re packing your parts. Pay ${formatINR(order.total)} in cash when they arrive — tracking details follow by email.`
          : paid
            ? 'We’re packing your parts. You’ll get tracking details by email.'
            : failed
              ? 'You have not been charged. Your cart is still saved.'
              : 'Your bank is still confirming. This page updates by itself — no need to pay again.'}
      </p>
      <p className="confirm__ref">
        <span className="label">REFERENCE</span> <strong>{order.reference}</strong>
      </p>
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
      {cod && !!order.codFee && (
        <p className="confirm__total">
          <span className="label">COD FEE</span> {formatINR(order.codFee)}
        </p>
      )}
      <p className="confirm__total">
        <span className="label">{cod ? 'PAY ON DELIVERY' : 'TOTAL'}</span> {formatINR(order.total)}
      </p>
      <div className="confirm__ctas">
        {failed ? (
          <Link href="/checkout" className="btn btn--ignite">
            TRY AGAIN
          </Link>
        ) : (
          <Link href="/build" className="btn btn--ignite">
            BUILD YOUR BIKE
          </Link>
        )}
        <Link href="/parts" className="btn">
          KEEP BROWSING
        </Link>
      </div>
    </div>
  )
}
