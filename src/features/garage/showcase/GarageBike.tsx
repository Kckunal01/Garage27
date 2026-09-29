import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { GarageMachine } from '@/types/catalogue'

/**
 * The machine as photographed inside Garage 27, framed on the machine; the
 * edges of the photograph dissolve into the room around it. The supplied
 * file is used as-is.
 */
export function GarageBike({ image }: { image: GarageMachine['image'] }) {
  const { x, y, w, h } = image.frame
  const frame = { '--ratio': `${image.width * w} / ${image.height * h}` } as CSSProperties
  const place: CSSProperties = { width: `${100 / w}%`, left: `${(-x / w) * 100}%`, top: `${(-y / h) * 100}%` }
  return (
    <div className="gbike" style={frame}>
      <Image className="gbike__photo" src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(width < 768px) 150vw, min(94vw, 1250px)" quality={90} preload style={place} />
    </div>
  )
}
