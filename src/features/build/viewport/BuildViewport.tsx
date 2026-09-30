'use client'

import dynamic from 'next/dynamic'
import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { BikeSilhouette } from '@/components/media/BikeSilhouette'
import { track } from '@/lib/analytics'
import type { Bike, BuildConfiguration, ComponentOption, MaterialConfig } from '@/types/catalogue'
import { detectQuality, hasWebGL, type QualityProfile } from './quality'
import type { SceneHandle } from './Scene'

// three.js + R3F only download when a bike actually enters the bay.
const BuildScene = dynamic(() => import('./Scene').then((m) => m.BuildScene), { ssr: false })

class SceneBoundary extends Component<{ fallback: ReactNode; onError(e: unknown): void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

interface Props {
  bike: Bike
  config: BuildConfiguration
  options: ComponentOption[]
  paint: MaterialConfig
  activeSlots: string[]
  litSlot: string | null
  pulse: number
  /** Rendered over the static fallback (e.g. quote CTA). */
  fallbackAction?: ReactNode
}

/**
 * Owns loading / failure for the 3D bay. The bike is never shown as
 * interactive until the scene has rendered a frame; any failure (no WebGL,
 * context loss, asset error) drops to a strong static preview + quote path.
 */
export function BuildViewport(props: Props) {
  const { bike, paint, fallbackAction, activeSlots, ...sceneProps } = props
  const [quality, setQuality] = useState<QualityProfile | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const sceneRef = useRef<SceneHandle>(null)

  useEffect(() => {
    // Capability probes need the DOM, so they run after mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!hasWebGL()) {
      setStatus('failed')
      track('build_3d_failed', { bike: bike.id, reason: 'no_webgl' })
      return
    }
    setQuality(detectQuality())
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [bike.id])

  const fallback = (
    <div className="bay-fallback">
      <BikeSilhouette className="bay-fallback__bike" silhouette={bike.silhouette} paint={paint.color} title={`${bike.brand} ${bike.model} preview`} />
      <div className="bay-fallback__msg">
        <p className="title">THIS BIKE IS STILL IN THE WORKSHOP.</p>
        <p className="muted">Interactive 3D couldn’t start on this device. Your choices still count — review and request a quote.</p>
        {fallbackAction}
      </div>
    </div>
  )

  if (status === 'failed') return <div className="bay-viewport">{fallback}</div>

  return (
    <div className="bay-viewport" data-status={status}>
      {quality && (
        <SceneBoundary
          fallback={fallback}
          onError={(e) => {
            setStatus('failed')
            track('build_3d_failed', { bike: bike.id, reason: e instanceof Error ? e.message.slice(0, 80) : 'unknown' })
          }}
        >
          <BuildScene {...sceneProps} bike={bike} paint={paint} activeSlots={activeSlots} handle={sceneRef} quality={quality} onReady={() => setStatus('ready')} />
        </SceneBoundary>
      )}
      {status === 'loading' && (
        <div className="bay-loading" role="status">
          <BikeSilhouette className="bay-loading__ghost" silhouette={bike.silhouette} paint={paint.color} reflection={false} />
          <p className="label label--amber">BUILDING YOUR BIKE…</p>
        </div>
      )}
    </div>
  )
}
