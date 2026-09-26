export type QualityTier = 'low' | 'high'

export interface QualityProfile {
  tier: QualityTier
  dpr: [number, number]
  shadows: boolean
  segments: number
  envResolution: number
}

/**
 * Device quality tier. Tuned for mid-range Android on Indian mobile networks:
 * phones default to "low" (capped DPR, baked contact shadow, fewer segments).
 */
export function detectQuality(): QualityProfile {
  if (typeof window === 'undefined') return profiles.low
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const small = window.matchMedia('(max-width: 900px)').matches
  const saveData = nav.connection?.saveData === true
  const low = saveData || small || cores <= 4 || memory <= 4
  return low ? profiles.low : profiles.high
}

const profiles: Record<QualityTier, QualityProfile> = {
  low: { tier: 'low', dpr: [1, 1.5], shadows: false, segments: 20, envResolution: 128 },
  high: { tier: 'high', dpr: [1, 2], shadows: true, segments: 40, envResolution: 256 },
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
