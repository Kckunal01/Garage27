import { useId } from 'react'

const r2 = (n: number) => Math.round(n * 100) / 100

export type Silhouette = 'roadster' | 'bobber' | 'scrambler' | 'cafe'
export type Tone = 'amber' | 'red' | 'chrome' | 'olive'

const PAINT: Record<Tone, [string, string]> = {
  red: ['#7a1a1a', '#2a0707'],
  amber: ['#4a4d50', '#15171a'],
  chrome: ['#26262c', '#050507'],
  olive: ['#5b5b3d', '#1d1d12'],
}

interface Props {
  silhouette?: Silhouette
  tone?: Tone
  /** Paint override (e.g. the selected colour swatch). */
  paint?: string
  reflection?: boolean
  className?: string
  title?: string
}

/**
 * Procedural side-view motorcycle, lit like it's standing under a tungsten
 * lamp on wet concrete. A stand-in until photographed bikes are delivered —
 * every consumer also accepts a real image.
 */
export function BikeSilhouette({ silhouette = 'roadster', tone = 'amber', paint, reflection = true, className, title }: Props) {
  const uid = useId().replace(/:/g, '')
  const [p1, p2] = paint ? [paint, '#050505'] : PAINT[tone]
  const cafe = silhouette === 'cafe'
  const bobber = silhouette === 'bobber'
  const scrambler = silhouette === 'scrambler'
  const wheelR = scrambler ? 118 : 110
  const tyre = bobber ? 26 : scrambler ? 22 : 18
  const rear = { x: 190, y: 340 }
  const front = { x: 612, y: 340 }

  const spokes = (cx: number, cy: number, r: number) =>
    Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2
      // Rounded: server and browser must print identical coordinates (hydration).
      return <line key={i} x1={r2(cx + Math.cos(a) * 14)} y1={r2(cy + Math.sin(a) * 14)} x2={r2(cx + Math.cos(a + 0.35) * r)} y2={r2(cy + Math.sin(a + 0.35) * r)} />
    })

  const wheel = (cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={wheelR} fill="none" stroke="#0b0b0b" strokeWidth={tyre} />
      <circle cx={cx} cy={cy} r={wheelR + tyre / 2 - 2} fill="none" stroke={`url(#rim-light-${uid})`} strokeWidth="2" opacity="0.8" />
      {scrambler && (
        <circle cx={cx} cy={cy} r={wheelR} fill="none" stroke="#1d1d1d" strokeWidth={tyre - 4} strokeDasharray="4 7" />
      )}
      <circle cx={cx} cy={cy} r={wheelR - tyre / 2 - 3} fill="none" stroke={`url(#chrome-${uid})`} strokeWidth="5" />
      <g stroke="#8d8f91" strokeWidth="1.1" opacity="0.75">
        {spokes(cx, cy, wheelR - tyre / 2 - 5)}
      </g>
      <circle cx={cx} cy={cy} r="16" fill={`url(#chrome-${uid})`} />
      <circle cx={cx} cy={cy} r="5" fill="#111" />
    </g>
  )

  const bike = (
    <g>
      {wheel(rear.x, rear.y)}
      {wheel(front.x, front.y)}

      {/* rear fender */}
      {bobber ? (
        <path d={`M ${rear.x - 90} ${rear.y - 60} A ${wheelR + 22} ${wheelR + 22} 0 0 1 ${rear.x + 40} ${rear.y - wheelR - 20}`} fill="none" stroke={p1} strokeWidth="16" strokeLinecap="round" />
      ) : scrambler ? null : (
        <path d={`M ${rear.x - 128} ${rear.y + 10} A ${wheelR + 24} ${wheelR + 24} 0 0 1 ${rear.x + 60} ${rear.y - wheelR - 12}`} fill="none" stroke={`url(#paint-${uid})`} strokeWidth="20" strokeLinecap="round" />
      )}

      {/* swingarm + shocks */}
      <path d={`M ${rear.x} ${rear.y} L 350 330`} stroke="#1a1a1a" strokeWidth="12" strokeLinecap="round" />
      <path d={`M ${rear.x + 18} ${rear.y - 14} L 262 212`} stroke={`url(#chrome-${uid})`} strokeWidth="7" strokeLinecap="round" />
      <path d={`M ${rear.x + 18} ${rear.y - 14} L 262 212`} stroke="#b7442c" strokeWidth="3" strokeDasharray="3 4" strokeLinecap="round" opacity="0.8" />

      {/* frame */}
      <path d="M 262 206 L 520 176 L 470 330 L 350 330 Z" fill="none" stroke="#161616" strokeWidth="10" strokeLinejoin="round" />

      {/* engine */}
      <g>
        <path d="M 356 256 h 110 l 8 74 h -126 z" fill="#1b1b1b" stroke="#2c2c2c" />
        <rect x="378" y="214" width="62" height="54" rx="6" fill={`url(#engine-${uid})`} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x="372" y={218 + i * 8} width="74" height="3" rx="1.5" fill="#6f6f6f" opacity="0.7" />
        ))}
        <circle cx="404" cy="302" r="20" fill={`url(#chrome-${uid})`} opacity="0.9" />
      </g>

      {/* exhaust */}
      {scrambler ? (
        <path d="M 436 262 C 420 230, 360 214, 300 214 L 150 200" fill="none" stroke={`url(#chrome-${uid})`} strokeWidth="13" strokeLinecap="round" />
      ) : (
        <path d={`M 440 280 C 440 340, 400 372, 330 372 L ${cafe ? 140 : 118} ${cafe ? 352 : 364}`} fill="none" stroke={`url(#chrome-${uid})`} strokeWidth={cafe ? 11 : 13} strokeLinecap="round" />
      )}

      {/* tank */}
      <path d={cafe ? 'M 330 204 C 350 158, 470 150, 524 176 C 520 204, 470 214, 330 212 Z' : 'M 318 206 C 334 150, 470 142, 522 174 C 522 206, 470 218, 318 214 Z'} fill={`url(#paint-${uid})`} />
      <path d={cafe ? 'M 356 170 C 400 158, 470 156, 510 172' : 'M 346 164 C 400 150, 470 150, 508 168'} fill="none" stroke={`url(#rim-light-${uid})`} strokeWidth="3" opacity="0.9" />
      {tone !== 'olive' && !paint && <path d="M 350 196 C 400 188, 460 188, 500 190" stroke="#d6b36e" strokeWidth="1.4" fill="none" opacity="0.7" />}

      {/* seat */}
      {cafe ? (
        <path d="M 196 200 C 214 176, 250 184, 262 196 L 324 204 C 324 214, 250 216, 196 212 Z" fill="#3b2415" stroke="#1a0f08" />
      ) : bobber ? (
        <g>
          <path d="M 250 198 C 262 178, 318 180, 326 200 L 326 208 L 250 208 Z" fill="#5a3520" stroke="#1a0f08" />
          <path d="M 266 208 l -6 22 M 312 208 l 4 22" stroke={`url(#chrome-${uid})`} strokeWidth="4" />
        </g>
      ) : (
        <path d="M 150 206 C 170 188, 230 186, 262 196 L 326 204 C 326 214, 280 220, 150 216 Z" fill="#161412" stroke="#060505" />
      )}

      {/* forks */}
      <path d={`M 516 170 L ${front.x} ${front.y}`} stroke={`url(#chrome-${uid})`} strokeWidth="11" strokeLinecap="round" />
      <path d={`M 530 168 L ${front.x + 12} ${front.y - 2}`} stroke="#3a3a3a" strokeWidth="5" strokeLinecap="round" />
      {/* front fender */}
      {!bobber && (
        <path d={`M ${front.x - 70} ${front.y - wheelR + 10} A ${wheelR + 14} ${wheelR + 14} 0 0 1 ${front.x + 86} ${front.y - 70}`} fill="none" stroke={scrambler ? '#1a1a1a' : `url(#paint-${uid})`} strokeWidth="12" strokeLinecap="round" />
      )}

      {/* bars */}
      {cafe ? (
        <path d="M 522 178 l 30 6" stroke="#191919" strokeWidth="7" strokeLinecap="round" />
      ) : bobber ? (
        <path d="M 520 170 C 520 120, 500 104, 480 100 l -16 2" fill="none" stroke={`url(#chrome-${uid})`} strokeWidth="6" strokeLinecap="round" />
      ) : (
        <path d="M 520 168 C 518 142, 504 132, 484 130 l -18 4" fill="none" stroke="#1b1b1b" strokeWidth="6" strokeLinecap="round" />
      )}

      {/* headlight */}
      <g>
        <circle cx="556" cy="190" r={scrambler ? 24 : 30} fill={scrambler ? '#141414' : `url(#chrome-${uid})`} />
        <circle cx="560" cy="190" r={scrambler ? 17 : 22} fill={`url(#lamp-${uid})`} />
        {scrambler && (
          <g stroke="#555" strokeWidth="1.2">
            <line x1="548" y1="172" x2="548" y2="208" />
            <line x1="560" y1="170" x2="560" y2="210" />
            <line x1="572" y1="172" x2="572" y2="208" />
          </g>
        )}
      </g>
      {/* tail light */}
      <circle cx={bobber ? rear.x - 88 : rear.x - 120} cy={bobber ? rear.y - 56 : rear.y - 2} r="6" fill="#ff2a33" filter={`url(#glow-${uid})`} />
    </g>
  )

  return (
    <svg className={className} viewBox="0 0 800 560" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`paint-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p1} />
          <stop offset="0.55" stopColor={p1} stopOpacity="0.92" />
          <stop offset="1" stopColor={p2} />
        </linearGradient>
        <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f4f2" />
          <stop offset="0.35" stopColor="#8e9194" />
          <stop offset="0.55" stopColor="#e6e3dc" />
          <stop offset="1" stopColor="#3a3b3d" />
        </linearGradient>
        <linearGradient id={`engine-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9c9c9c" />
          <stop offset="1" stopColor="#2e2e2e" />
        </linearGradient>
        <linearGradient id={`rim-light-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffbf6b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffcf8a" />
          <stop offset="1" stopColor="#ffbf6b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`lamp-${uid}`}>
          <stop offset="0" stopColor="#fff8e6" />
          <stop offset="0.6" stopColor="#f3d9a0" />
          <stop offset="1" stopColor="#6b5a3a" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`fade-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`reflect-${uid}`}>
          <rect x="0" y="460" width="800" height="120" fill={`url(#fade-${uid})`} />
        </mask>
        <radialGradient id={`shadow-${uid}`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="400" cy="462" rx="360" ry="22" fill={`url(#shadow-${uid})`} />
      {bike}
      {reflection && (
        <g mask={`url(#reflect-${uid})`} opacity="0.55">
          <g transform="translate(0 924) scale(1 -1)" filter="blur(1.5px)">
            {bike}
          </g>
        </g>
      )}
    </svg>
  )
}
