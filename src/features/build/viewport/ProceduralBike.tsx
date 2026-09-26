'use client'

import type { ReactElement } from 'react'
import type { BikeModelSource, BuildConfiguration, ComponentOption, MaterialConfig, ModelAsset } from '@/types/catalogue'
import { BlackMetal, Chrome, Lamp, Leather, Paint, Rubber, Tube, TubePath, type V3 } from './primitives'

/**
 * Procedural roadster rig ("rig-roadster-v1").
 *
 * The rig owns the base bike (frame, wheels, engine, forks) and one mount
 * point per component slot. What fills a slot is decided by data: the
 * selected option's `modelAsset` names a variant in VARIANTS below, or a node
 * in a GLB. Adding an option = adding data (+ a variant or GLB node), never
 * editing the editor.
 */

const FRONT: V3 = [0.72, 0.36, 0]
const REAR: V3 = [-0.7, 0.36, 0]
const WHEEL_R = 0.3

interface VariantProps {
  paint: MaterialConfig
  material?: Partial<MaterialConfig>
  segments: number
}
type Variant = (p: VariantProps) => ReactElement

// ── Base (non-configurable) ──────────────────────────────────────────────
function Wheel({ at, segments, name }: { at: V3; segments: number; name: string }) {
  return (
    <group position={at} name={name}>
      <mesh castShadow>
        <torusGeometry args={[WHEEL_R, 0.058, 14, segments * 2]} />
        <Rubber />
      </mesh>
      <mesh>
        <torusGeometry args={[WHEEL_R - 0.058, 0.012, 8, segments * 2]} />
        <Chrome />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        const r = WHEEL_R - 0.065
        const z = i % 2 ? 0.035 : -0.035
        return (
          <Tube key={i} from={[0, 0, z]} to={[Math.cos(a + 0.3) * r, Math.sin(a + 0.3) * r, 0]} radius={0.0028} segments={4}>
            <Chrome cfg={{ roughness: 0.3 }} />
          </Tube>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.12, 20]} />
        <Chrome />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, segments]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}

function BaseBike({ paint, segments }: { paint: MaterialConfig; segments: number }) {
  return (
    <group>
      <Wheel at={FRONT} segments={segments} name="bike.wheelFront" />
      <Wheel at={REAR} segments={segments} name="bike.wheelRear" />

      {/* frame */}
      <TubePath points={[[0.5, 1.02, 0], [-0.42, 0.9, 0]]} radius={0.022}>
        <BlackMetal />
      </TubePath>
      <TubePath points={[[0.5, 0.98, 0.0], [0.3, 0.4, 0.07], [-0.12, 0.28, 0.07], [-0.22, 0.52, 0.07], [-0.42, 0.9, 0.07]]} radius={0.018} mirror>
        <BlackMetal />
      </TubePath>
      {/* swingarm */}
      <TubePath points={[[-0.16, 0.42, 0.11], [REAR[0], REAR[1], 0.11]]} radius={0.02} mirror>
        <BlackMetal />
      </TubePath>
      {/* shocks */}
      <TubePath points={[[-0.62, 0.42, 0.13], [-0.42, 0.86, 0.13]]} radius={0.024} mirror>
        <Chrome />
      </TubePath>
      <TubePath points={[[-0.6, 0.46, 0.135], [-0.45, 0.8, 0.135]]} radius={0.032} mirror>
        <meshStandardMaterial color="#8a2a1c" metalness={0.4} roughness={0.5} wireframe />
      </TubePath>
      {/* forks + triple clamp */}
      <TubePath points={[[0.53, 1.06, 0.09], [FRONT[0], FRONT[1], 0.09]]} radius={0.022} mirror>
        <Chrome />
      </TubePath>
      <mesh position={[0.545, 1.04, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.08, 0.04, 0.24]} />
        <BlackMetal />
      </mesh>

      {/* engine: crankcase + finned barrel + covers */}
      <group position={[0.06, 0.5, 0]} name="bike.engine">
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.26, 0.24]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.6} roughness={0.45} />
        </mesh>
        <mesh position={[-0.02, -0.02, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.02, segments]} />
          <Chrome />
        </mesh>
        <group position={[0.08, 0.24, 0]} rotation={[0, 0, -0.18]}>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[0, i * 0.035 - 0.08, 0]}>
              <boxGeometry args={[0.2 - i * 0.006, 0.014, 0.2 - i * 0.006]} />
              <meshStandardMaterial color="#9a9a9a" metalness={0.85} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.12, 0.24, 0.12]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* side panel / battery box in paint */}
      <mesh position={[-0.2, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.16, 0.2]} />
        <Paint cfg={paint} />
      </mesh>

      {/* front fender */}
      <mesh position={FRONT} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[WHEEL_R + 0.09, WHEEL_R + 0.09, 0.12, segments, 1, true, Math.PI * 0.55, Math.PI * 0.6]} />
        <meshPhysicalMaterial color={paint.color} metalness={paint.metalness} roughness={paint.roughness} clearcoat={paint.clearcoat ?? 0.5} side={2} />
      </mesh>
    </group>
  )
}

// ── Slot variants ────────────────────────────────────────────────────────
const VARIANTS: Record<string, Variant> = {
  // LIGHTING
  'headlight-nacelle': ({ paint, segments }) => (
    <group position={[0.64, 1.0, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.095, 0.085, 0.14, segments]} />
        <Paint cfg={paint} />
      </mesh>
      <mesh position={[0.072, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, segments]} />
        <Lamp />
      </mesh>
    </group>
  ),
  'headlight-round-chrome': ({ material, segments }) => (
    <group position={[0.66, 1.0, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.11, 0.07, 0.16, segments]} />
        <Chrome cfg={material} />
      </mesh>
      <mesh position={[0.082, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.012, 8, segments]} />
        <Chrome />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.095, 0.095, 0.006, segments]} />
        <Lamp intensity={3} />
      </mesh>
    </group>
  ),
  'headlight-caged': ({ material, segments }) => (
    <group position={[0.66, 0.98, 0]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.078, 0.06, 0.12, segments]} />
        <BlackMetal />
      </mesh>
      <mesh position={[0.062, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.006, segments]} />
        <Lamp color="#fff0c8" intensity={2.6} />
      </mesh>
      {[-0.04, 0, 0.04].map((z) => (
        <mesh key={`v${z}`} position={[0.075, 0, z]}>
          <boxGeometry args={[0.006, 0.15, 0.006]} />
          <meshStandardMaterial color={material?.color ?? '#141414'} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {[-0.04, 0, 0.04].map((y) => (
        <mesh key={`h${y}`} position={[0.075, y, 0]}>
          <boxGeometry args={[0.006, 0.006, 0.15]} />
          <meshStandardMaterial color={material?.color ?? '#141414'} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  ),

  // COCKPIT
  'bar-touring': () => (
    <group>
      <TubePath points={[[0.53, 1.1, 0.02], [0.5, 1.2, 0.14], [0.4, 1.2, 0.34]]} radius={0.013} mirror>
        <Chrome />
      </TubePath>
      <Grips at={[0.4, 1.2, 0.34]} />
    </group>
  ),
  'bar-clipon': () => (
    <group>
      <TubePath points={[[0.55, 1.05, 0.1], [0.47, 1.0, 0.3]]} radius={0.013} mirror>
        <BlackMetal />
      </TubePath>
      <Grips at={[0.47, 1.0, 0.3]} />
    </group>
  ),
  'bar-ape': () => (
    <group>
      <TubePath points={[[0.53, 1.1, 0.08], [0.52, 1.4, 0.16], [0.42, 1.4, 0.34]]} radius={0.013} mirror>
        <Chrome />
      </TubePath>
      <Grips at={[0.42, 1.4, 0.34]} />
    </group>
  ),

  // BODY
  'tank-teardrop': ({ paint, segments }) => <Tank paint={paint} segments={segments} />,
  'tank-pinstripe': ({ paint, segments }) => (
    <group>
      <Tank paint={paint} segments={segments} />
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.22, 1.0, 0.148 * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <torusGeometry args={[0.2, 0.003, 4, segments * 2, Math.PI * 0.7]} />
          <meshStandardMaterial color={paint.accent ?? '#d6b36e'} metalness={0.6} roughness={0.3} emissive={paint.accent ?? '#d6b36e'} emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  ),

  // SEAT
  'seat-split': () => (
    <group>
      <RoundedSeat at={[-0.2, 0.94, 0]} size={[0.34, 0.07, 0.24]} />
      <RoundedSeat at={[-0.56, 0.92, 0]} size={[0.28, 0.06, 0.2]} />
    </group>
  ),
  'seat-solo': ({ material, segments }) => (
    <group>
      <mesh position={[-0.2, 0.97, 0]} scale={[0.2, 0.05, 0.14]} castShadow>
        <sphereGeometry args={[1, segments, 12]} />
        <Leather cfg={material} />
      </mesh>
      {[0.08, -0.08].map((z) => (
        <Tube key={z} from={[-0.32, 0.9, z]} to={[-0.32, 0.96, z]} radius={0.018}>
          <meshStandardMaterial color="#d6d6d6" metalness={1} roughness={0.2} wireframe />
        </Tube>
      ))}
    </group>
  ),
  'seat-bench': ({ material }) => (
    <group>
      <RoundedSeat at={[-0.36, 0.935, 0]} size={[0.7, 0.08, 0.25]} material={material} />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-0.64 + i * 0.08, 0.978, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
          <Leather cfg={{ ...material, roughness: 0.6 }} />
        </mesh>
      ))}
    </group>
  ),

  // DETAIL
  'exhaust-peashooter': ({ material }) => (
    <group>
      <TubePath points={[[0.22, 0.62, 0.1], [0.28, 0.4, 0.16], [0.1, 0.26, 0.19], [-0.4, 0.3, 0.2]]} radius={0.024}>
        <Chrome cfg={material} />
      </TubePath>
      <mesh position={[-0.62, 0.33, 0.2]} rotation={[0, 0, Math.PI / 2 - 0.08]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.46, 18]} />
        <Chrome cfg={material} />
      </mesh>
    </group>
  ),
  'exhaust-upswept': ({ material }) => (
    <group>
      <TubePath points={[[0.22, 0.64, 0.1], [0.16, 0.5, 0.2], [-0.1, 0.6, 0.22], [-0.46, 0.78, 0.22]]} radius={0.026}>
        <Chrome cfg={material} />
      </TubePath>
      <mesh position={[-0.62, 0.83, 0.22]} rotation={[0, 0, Math.PI / 2 + 0.28]}>
        <cylinderGeometry args={[0.04, 0.045, 0.34, 18]} />
        <Chrome cfg={material} />
      </mesh>
      <mesh position={[-0.12, 0.62, 0.26]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.26, 0.06, 0.01]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  ),

  // LUGGAGE
  'luggage-saddlebags': ({ material }) => (
    <group>
      {[1, -1].map((s) => (
        <group key={s} position={[-0.62, 0.72, 0.25 * s]}>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.24, 0.1]} />
            <Leather cfg={material} />
          </mesh>
          <mesh position={[0, 0.1, 0.01 * s]}>
            <boxGeometry args={[0.33, 0.07, 0.105]} />
            <Leather cfg={{ ...material, roughness: 0.7 }} />
          </mesh>
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.052 * s]}>
              <boxGeometry args={[0.02, 0.18, 0.004]} />
              <meshStandardMaterial color="#b58a3c" metalness={0.8} roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  ),
  'luggage-rack': ({ material }) => (
    <group>
      <TubePath points={[[-0.42, 0.99, 0.11], [-0.86, 0.99, 0.11], [-0.86, 0.99, -0.11], [-0.42, 0.99, -0.11]]} radius={0.011}>
        <meshStandardMaterial color={material?.color ?? '#161616'} metalness={0.6} roughness={0.4} />
      </TubePath>
      {[-0.56, -0.7].map((x) => (
        <Tube key={x} from={[x, 0.99, 0.11]} to={[x, 0.99, -0.11]} radius={0.008}>
          <meshStandardMaterial color={material?.color ?? '#161616'} metalness={0.6} roughness={0.4} />
        </Tube>
      ))}
    </group>
  ),

  // REAR WHEEL
  'fender-full': ({ paint, segments }) => (
    <group>
      <mesh position={REAR} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[WHEEL_R + 0.09, WHEEL_R + 0.09, 0.15, segments, 1, true, Math.PI * 0.8, Math.PI * 0.8]} />
        <meshPhysicalMaterial color={paint.color} metalness={paint.metalness} roughness={paint.roughness} clearcoat={paint.clearcoat ?? 0.5} side={2} />
      </mesh>
      <TailLight at={[-1.1, 0.42, 0]} />
    </group>
  ),
  'fender-bobbed': ({ paint, segments }) => (
    <group>
      <mesh position={REAR} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[WHEEL_R + 0.08, WHEEL_R + 0.08, 0.14, segments, 1, true, Math.PI * 0.8, Math.PI * 0.45]} />
        <meshPhysicalMaterial color={paint.color} metalness={paint.metalness} roughness={paint.roughness} clearcoat={paint.clearcoat ?? 0.5} side={2} />
      </mesh>
      <TailLight at={[-0.98, 0.64, 0]} small />
    </group>
  ),
}

function Grips({ at }: { at: V3 }) {
  return (
    <>
      {[1, -1].map((s) => (
        <mesh key={s} position={[at[0], at[1], (at[2] + 0.05) * s]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.11, 12]} />
          <Rubber />
        </mesh>
      ))}
    </>
  )
}

function Tank({ paint, segments }: { paint: MaterialConfig; segments: number }) {
  return (
    <group>
      <mesh position={[0.22, 1.0, 0]} scale={[0.34, 0.12, 0.145]} castShadow>
        <sphereGeometry args={[1, segments * 2, segments]} />
        <Paint cfg={paint} />
      </mesh>
      <mesh position={[0.34, 1.12, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
        <Chrome />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.24, 1.0, 0.142 * s]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.008, 20]} />
          <Chrome />
        </mesh>
      ))}
    </group>
  )
}

function RoundedSeat({ at, size, material }: { at: V3; size: V3; material?: Partial<MaterialConfig> }) {
  return (
    <group position={at}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <Leather cfg={material} />
      </mesh>
      <mesh position={[0, size[1] / 2, 0]} scale={[size[0] / 2, size[1] / 2.2, size[2] / 2]}>
        <sphereGeometry args={[1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Leather cfg={material} />
      </mesh>
    </group>
  )
}

function TailLight({ at, small }: { at: V3; small?: boolean }) {
  return (
    <mesh position={at}>
      <boxGeometry args={small ? [0.02, 0.03, 0.06] : [0.04, 0.05, 0.09]} />
      <Lamp color="#ff2430" intensity={2.4} />
    </mesh>
  )
}

function SlotRenderer({ asset, props }: { asset: ModelAsset | undefined; props: VariantProps }) {
  if (!asset || asset.kind === 'none') return null
  if (asset.kind === 'glb') {
    // A GLB option on a procedural vehicle is a catalogue error; the catalogue check flags it.
    if (process.env.NODE_ENV !== 'production') console.warn('[build] GLB option on a procedural vehicle')
    return null
  }
  const V = VARIANTS[asset.variant]
  if (!V) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[build] unknown procedural variant "${asset.variant}"`)
    return null
  }
  return <V {...props} />
}

/**
 * PROCEDURAL MODEL ADAPTER — the in-house TEST rig ("rig-roadster-v1").
 * Stands in until a vehicle's production GLB is supplied; the GLB adapter
 * (model/GlbVehicle) takes over by data alone. Every part is a named node
 * (`bike.frame`, `bike.wheelFront`, `bike.<slot>` …) matching the GLB naming.
 */
export function ProceduralBike({ model, config, options, paint, segments }: { model?: BikeModelSource; config: BuildConfiguration; options: ComponentOption[]; paint: MaterialConfig; segments: number }) {
  return (
    <group name="bike">
      <BaseBike paint={paint} segments={segments} />
      {/* Stock parts the vehicle has but does not expose for configuration. */}
      {Object.entries(model?.fixedNodes ?? {}).map(([node, variant]) => (
        <group key={node} name={node}>
          <SlotRenderer asset={{ kind: 'procedural', variant }} props={{ paint, segments }} />
        </group>
      ))}
      {Object.entries(config.components).map(([slot, optionId]) => {
        const option = optionId ? options.find((o) => o.id === optionId) : undefined
        return (
          <group key={slot} name={option?.affectedNodes[0] ?? `bike.${slot}`}>
            <SlotRenderer asset={option?.modelAsset} props={{ paint, material: option?.materialConfig, segments }} />
          </group>
        )
      })}
    </group>
  )
}

/** Variants the rig can render — used by the catalogue integrity check. */
export const PROCEDURAL_VARIANTS = Object.keys(VARIANTS)
