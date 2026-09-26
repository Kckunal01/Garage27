'use client'

import { useMemo, type ReactNode } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { MaterialConfig } from '@/types/catalogue'

export type V3 = [number, number, number]

/** A cylinder between two points — the rig's welding rod. */
export function Tube({ from, to, radius = 0.018, children, segments = 12 }: { from: V3; to: V3; radius?: number; children: ReactNode; segments?: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from)
    const b = new Vector3(...to)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize())
    return { position: a.add(b).multiplyScalar(0.5).toArray() as V3, quaternion: q, length: len }
  }, [from, to])
  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, segments]} />
      {children}
    </mesh>
  )
}

/** Polyline of tubes, mirrored across the bike's centre plane when `mirror`. */
export function TubePath({ points, radius, mirror, children }: { points: V3[]; radius?: number; mirror?: boolean; children: ReactNode }) {
  const sides = mirror ? [1, -1] : [1]
  return (
    <>
      {sides.map((s) =>
        points.slice(1).map((p, i) => {
          const a = points[i]!
          return (
            <Tube key={`${s}-${i}`} from={[a[0], a[1], a[2] * s]} to={[p[0], p[1], p[2] * s]} radius={radius}>
              {children}
            </Tube>
          )
        }),
      )}
    </>
  )
}

// ── Materials ────────────────────────────────────────────────────────────
export function Paint({ cfg }: { cfg: MaterialConfig }) {
  return <meshPhysicalMaterial color={cfg.color} metalness={cfg.metalness} roughness={cfg.roughness} clearcoat={cfg.clearcoat ?? 0.5} clearcoatRoughness={0.12} />
}
export function Chrome({ cfg }: { cfg?: Partial<MaterialConfig> }) {
  return <meshStandardMaterial color={cfg?.color ?? '#e2e2e2'} metalness={cfg?.metalness ?? 1} roughness={cfg?.roughness ?? 0.14} />
}
export function Rubber() {
  return <meshStandardMaterial color="#0d0d0d" metalness={0} roughness={0.92} />
}
export function BlackMetal() {
  return <meshStandardMaterial color="#141414" metalness={0.55} roughness={0.5} />
}
export function Leather({ cfg }: { cfg?: Partial<MaterialConfig> }) {
  return <meshStandardMaterial color={cfg?.color ?? '#1a1714'} metalness={0} roughness={cfg?.roughness ?? 0.78} />
}
export function Lamp({ color = '#fff4dc', intensity = 2.2 }: { color?: string; intensity?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
}
