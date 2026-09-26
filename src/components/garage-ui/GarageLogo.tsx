import Link from 'next/link'

/**
 * Garage 27 signature. Typeset stand-in for the official logo file — drop the
 * master into /public/assets/brand/ and swap the inner markup for an <img>/<svg>.
 */
export function GarageLogo({ size = 'md', asLink = true }: { size?: 'sm' | 'md' | 'lg'; asLink?: boolean }) {
  const inner = (
    <span className={`glogo glogo--${size}`}>
      <span className="glogo__script">Garage</span>
      <span className="glogo__num">27</span>
    </span>
  )
  if (!asLink) return inner
  return (
    <Link href="/" className="glogo-link" aria-label="Garage 27 — home">
      {inner}
    </Link>
  )
}
