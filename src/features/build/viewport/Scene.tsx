'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, Lightformer, OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { Vector3, type PointLight } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Bike, BuildCategory, BuildConfiguration, ComponentOption, MaterialConfig } from '@/types/catalogue'
import { VehicleModel } from '../model/VehicleModel'
import type { QualityProfile } from './quality'

export interface SceneHandle {
  resetCamera(): void
}

interface SceneProps {
  bike: Bike
  config: BuildConfiguration
  options: ComponentOption[]
  paint: MaterialConfig
  quality: QualityProfile
  activeCategory: BuildCategory | null
  litSlot: string | null
  pulse: number
  conflictSlots: string[]
  showHotspots: boolean
  onHotspot(category: BuildCategory): void
  onReady(): void
  handle?: Ref<SceneHandle>
}

/** "Selection lights the chosen part": a warm work-lamp that flares on the slot, then settles. */
function SlotLamp({ position, pulse }: { position: [number, number, number] | null; pulse: number }) {
  const light = useRef<PointLight>(null)
  const started = useRef(0)
  useEffect(() => {
    started.current = performance.now()
  }, [pulse, position])
  useFrame(() => {
    if (!light.current) return
    const t = (performance.now() - started.current) / 1000
    light.current.intensity = position ? 0.6 + Math.max(0, 2.4 - t * 2.4) : 0
  })
  return <pointLight ref={light} position={position ? [position[0], position[1] + 0.12, position[2] + 0.35] : [0, -10, 0]} color="#ffb45e" distance={1.2} decay={2} />
}

/**
 * Frames the vehicle for the CANVAS's real aspect (not the window's): the
 * distance that fits the bike's length and height, along the vehicle's
 * catalogue camera direction. Re-fits when the canvas resizes; reset re-fits.
 */
const FIT = { halfLength: 1.2, halfHeight: 0.72 }
function FitCamera({ bike, controls, fitRef }: { bike: Bike; controls: React.RefObject<OrbitControlsImpl | null>; fitRef: React.RefObject<(() => void) | null> }) {
  const { camera, size, invalidate } = useThree()
  useEffect(() => {
    const fit = () => {
      const fov = ((camera as { fov?: number }).fov ?? 34) * (Math.PI / 180)
      const t = Math.tan(fov / 2)
      const aspect = size.width / Math.max(1, size.height)
      const dist = Math.max(FIT.halfLength / (t * aspect), FIT.halfHeight / t)
      const clamped = Math.min(Math.max(dist, bike.camera.minDistance * 0.9), bike.camera.maxDistance * 1.35)
      const target = new Vector3(...bike.camera.target)
      const dir = new Vector3(...bike.camera.position).sub(target).normalize()
      camera.position.copy(target.clone().add(dir.multiplyScalar(clamped)))
      controls.current?.target.copy(target)
      controls.current?.update()
      invalidate()
    }
    fitRef.current = fit
    fit()
  }, [camera, size.width, size.height, bike.camera, controls, fitRef, invalidate])
  return null
}

/** Eases the orbit target toward the active slot without taking control away. */
function FocusRig({ controls, target }: { controls: React.RefObject<OrbitControlsImpl | null>; target: Vector3 }) {
  const invalidate = useThree((s) => s.invalidate)
  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    if (c.target.distanceTo(target) > 0.002) {
      c.target.lerp(target, Math.min(1, dt * 3))
      c.update()
      invalidate()
    }
  })
  return null
}

function Hotspots({ bike, active, conflicts, onPick }: { bike: Bike; active: BuildCategory | null; conflicts: string[]; onPick(c: BuildCategory): void }) {
  return (
    <>
      {bike.hotspots.map((h) => {
        const state = conflicts.includes(h.slot) ? 'conflict' : active === h.category ? 'active' : 'idle'
        return (
          <Html key={h.slot} position={h.position} center zIndexRange={[20, 0]}>
            <button type="button" className={`hotspot hotspot--${state}`} onClick={() => onPick(h.category)} aria-label={`Customise ${h.label.toLowerCase()}`} aria-pressed={active === h.category}>
              <span className="hotspot__ring" aria-hidden="true">
                +
              </span>
              <span className="hotspot__line" aria-hidden="true" />
              <span className="hotspot__label">{h.label}</span>
            </button>
          </Html>
        )
      })}
    </>
  )
}

function ReadySignal({ onReady }: { onReady(): void }) {
  const fired = useRef(false)
  useFrame(() => {
    if (!fired.current) {
      fired.current = true
      onReady()
    }
  })
  return null
}

export function BuildScene(props: SceneProps) {
  const { bike, config, options, paint, quality, activeCategory, litSlot, pulse, conflictSlots, showHotspots, onHotspot, onReady, handle } = props
  const controls = useRef<OrbitControlsImpl | null>(null)
  const fitRef = useRef<(() => void) | null>(null)
  const baseTarget = useMemo(() => new Vector3(...bike.camera.target), [bike.camera.target])
  const focus = useMemo(() => {
    const h = bike.hotspots.find((x) => x.category === activeCategory)
    if (!h) return baseTarget.clone()
    // Drift 35% toward the part — enough to "look at it", not enough to lose the bike.
    return baseTarget.clone().lerp(new Vector3(...h.position), 0.35)
  }, [bike.hotspots, activeCategory, baseTarget])
  const lampAt = useMemo(() => bike.hotspots.find((h) => h.slot === litSlot)?.position ?? null, [bike.hotspots, litSlot])

  useImperativeHandle(handle, () => ({
    resetCamera() {
      fitRef.current?.()
    },
  }))

  return (
    <Canvas
      className="bay-canvas"
      dpr={quality.dpr}
      shadows={quality.shadows}
      camera={{ position: bike.camera.position, fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: quality.tier === 'high', powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      aria-label={`3D view of your ${bike.brand} ${bike.model} build. Drag to rotate, pinch or scroll to zoom.`}
    >
      <color attach="background" args={['#0b0a09']} />
      <fog attach="fog" args={['#0b0a09', 5, 12]} />

      {/* Tungsten key, red neon rim, cool fill — the garage's three lights. */}
      <spotLight position={[1.2, 3.4, 1.6]} angle={0.6} penumbra={0.8} intensity={38} color="#ffc27a" castShadow={quality.shadows} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-1.8, 1.6, -1.6]} intensity={2.4} color="#ff2a33" distance={4.5} />
      <directionalLight position={[-2, 2, 3]} intensity={0.35} color="#a9b6c8" />
      <ambientLight intensity={0.12} />

      <Environment resolution={quality.envResolution} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffd6a0" position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[4, 1, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ff3a40" position={[-4, 1, -2]} rotation-y={Math.PI / 2.5} scale={[2, 1.2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#e8e0d0" position={[4, 1.5, 2]} rotation-y={-Math.PI / 2.5} scale={[3, 1, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffb060" position={[2, 2, 4]} scale={0.8} />
      </Environment>

      {/* The vehicle suspends while its model loads; "ready" fires only once it has rendered. */}
      <Suspense fallback={null}>
        <VehicleModel bike={bike} config={config} options={options} paint={paint} segments={quality.segments} />
        <ReadySignal onReady={onReady} />
      </Suspense>

      {/* Wet concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#141210" metalness={0.35} roughness={0.42} />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} opacity={0.75} scale={4} blur={2.4} far={1.4} resolution={quality.tier === 'high' ? 512 : 256} frames={1} color="#000" />

      <SlotLamp position={lampAt} pulse={pulse} />
      {showHotspots && <Hotspots bike={bike} active={activeCategory} conflicts={conflictSlots} onPick={onHotspot} />}

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={bike.camera.minDistance}
        maxDistance={bike.camera.maxDistance * 1.35}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.49}
        target={bike.camera.target}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
      />
      <FitCamera bike={bike} controls={controls} fitRef={fitRef} />
      <FocusRig controls={controls} target={focus} />
    </Canvas>
  )
}
