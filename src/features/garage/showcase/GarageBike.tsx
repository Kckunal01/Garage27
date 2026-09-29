'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { GarageMachine } from '@/types/catalogue'
import { keyPaintedBackdrop } from './cutout'

/** The canvas is taller than the machine: the rest is its reflection in the wet floor. */
const REFLECTION = 0.55

/**
 * The machine standing on the Garage floor: the supplied photograph (its
 * painted backdrop keyed out when it has one), graded to the Garage's warm
 * light, a contact shadow under each tyre and a soft reflection in the wet
 * floor, mirrored about the line where the tyres meet it.
 */
export function GarageBike({ image }: { image: GarageMachine['image'] }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const { width: w, height: h, contact } = image
  const [rx, ry] = contact.rear
  const [fx, fy] = contact.front
  // Floor line through the two contact points, in image pixels.
  const slope = ((fy - ry) * h) / ((fx - rx) * w)
  const tilt = `${(Math.atan(slope) * 180) / Math.PI}deg`

  useEffect(() => {
    let live = true
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      const out = canvas.current
      if (!live || !out) return
      const bike = document.createElement('canvas')
      bike.width = w
      bike.height = h
      const b = bike.getContext('2d', { willReadFrequently: true })!
      b.drawImage(img, 0, 0, w, h)
      if (image.paintedBackdrop) {
        const px = b.getImageData(0, 0, w, h)
        keyPaintedBackdrop(px.data, w, h)
        b.putImageData(px, 0, 0)
      }
      // Grade to the room: warm spill from the door, darker toward the floor.
      b.globalCompositeOperation = 'source-atop'
      const warm = b.createLinearGradient(0, h, w, 0)
      warm.addColorStop(0, 'rgba(255, 64, 32, 0.16)')
      warm.addColorStop(0.6, 'rgba(255, 64, 32, 0)')
      b.fillStyle = warm
      b.fillRect(0, 0, w, h)
      const floor = b.createLinearGradient(0, h * 0.7, 0, h)
      floor.addColorStop(0, 'rgba(8, 4, 3, 0)')
      floor.addColorStop(1, 'rgba(8, 4, 3, 0.3)')
      b.fillStyle = floor
      b.fillRect(0, 0, w, h)

      // Reflection: mirror about the floor line y = y0 + m·x, faded downwards.
      const H = Math.round(h * (1 + REFLECTION))
      const refl = document.createElement('canvas')
      refl.width = w
      refl.height = H
      const r = refl.getContext('2d')!
      const y0 = ry * h - slope * rx * w
      r.filter = 'blur(1.2px)'
      r.setTransform(1, 2 * slope, 0, -1, 0, 2 * y0)
      r.drawImage(bike, 0, 0)
      r.setTransform(1, 0, 0, 1, 0, 0)
      r.filter = 'none'
      r.globalCompositeOperation = 'destination-in'
      const fade = r.createLinearGradient(0, ry * h, 0, H)
      fade.addColorStop(0, 'rgba(0, 0, 0, 0.36)')
      fade.addColorStop(0.45, 'rgba(0, 0, 0, 0.1)')
      fade.addColorStop(1, 'rgba(0, 0, 0, 0)')
      r.fillStyle = fade
      r.fillRect(0, 0, w, H)

      out.width = w
      out.height = H
      const o = out.getContext('2d')!
      o.clearRect(0, 0, w, H)
      o.drawImage(refl, 0, 0)
      o.drawImage(bike, 0, 0)
      setReady(true)
    }
    img.src = image.src
    return () => {
      live = false
    }
  }, [image, w, h, rx, ry, slope])

  const vars = {
    '--ratio': `${w} / ${h}`,
    '--reflect': `${(1 + REFLECTION) * 100}%`,
    '--rx': `${rx * 100}%`,
    '--ry': `${ry * 100}%`,
    '--fx': `${fx * 100}%`,
    '--fy': `${fy * 100}%`,
    '--tilt': tilt,
  } as CSSProperties
  return (
    <div className={`gbike${ready ? ' is-ready' : ''}`} style={vars}>
      <span className="gbike__shadow gbike__shadow--body" aria-hidden="true" />
      <span className="gbike__shadow gbike__shadow--rear" aria-hidden="true" />
      <span className="gbike__shadow gbike__shadow--front" aria-hidden="true" />
      <canvas ref={canvas} className="gbike__canvas" width={w} height={Math.round(h * (1 + REFLECTION))} role="img" aria-label={image.alt} />
    </div>
  )
}
