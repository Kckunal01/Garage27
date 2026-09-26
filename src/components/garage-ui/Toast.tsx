'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Tone = 'info' | 'error' | 'success'
interface ToastItem {
  id: number
  tone: Tone
  title: string
  body?: string
}

const ToastContext = createContext<((t: Omit<ToastItem, 'id'>) => void) | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)
  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = ++seq.current
    setItems((prev) => [...prev.slice(-2), { ...t, id }])
    window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), t.tone === 'error' ? 6000 : 3800)
  }, [])
  const api = useMemo(() => push, [push])
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-relevant="additions">
        {items.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
            <p className="toast__title">{t.title}</p>
            {t.body && <p className="toast__body">{t.body}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
