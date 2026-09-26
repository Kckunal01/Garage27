import Image from 'next/image'
import Link from 'next/link'

/** Official Garage 27 logo (public/assets/brand/garage27-logo.png, 2172×724). */
export const LOGO_SRC = '/assets/brand/garage27-logo.png'
const HEIGHT = { sm: 28, md: 44, lg: 96 } as const

export function GarageLogo({ size = 'md', asLink = true }: { size?: 'sm' | 'md' | 'lg'; asLink?: boolean }) {
  const h = HEIGHT[size]
  const img = <Image className={`glogo glogo--${size}`} src={LOGO_SRC} alt="Garage 27" width={Math.round((h * 2172) / 724)} height={h} sizes={`${Math.round((h * 2172) / 724)}px`} />
  if (!asLink) return img
  return (
    <Link href="/" className="glogo-link" title="Garage 27 — home">
      {img}
    </Link>
  )
}
