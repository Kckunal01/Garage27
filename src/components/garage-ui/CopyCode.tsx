'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * An order / tracking code with a COPY action. The code is plain selectable
 * mono text (so it can always be copied by hand); COPY writes the exact code
 * to the clipboard and reads COPIED for a moment. Without a clipboard API it
 * selects the code instead, ready for the system copy.
 */
export function CopyCode({ code, label = 'ORDER CODE' }: { code: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'selected'>('idle')
  const text = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const select = () => {
    const el = text.current
    const sel = window.getSelection()
    if (!el || !sel) return
    const range = document.createRange()
    range.selectNodeContents(el)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  const copy = async () => {
    let next: 'copied' | 'selected' = 'selected'
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code)
        next = 'copied'
      } else select()
    } catch {
      select()
    }
    setState(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 1800)
  }

  return (
    <div className="ccode">
      <span className="ccode__label">{label}</span>
      <div className="ccode__row">
        <code className="ccode__code" ref={text}>
          {code}
        </code>
        <button type="button" className={`ccode__copy${state !== 'idle' ? ' is-done' : ''}`} onClick={copy} aria-label={`Copy ${label.toLowerCase()} ${code}`}>
          {state === 'copied' ? 'COPIED' : state === 'selected' ? 'SELECTED' : 'COPY'}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {state === 'copied' ? 'Copied to clipboard.' : state === 'selected' ? 'Code selected. Use your device’s copy.' : ''}
      </span>
    </div>
  )
}
