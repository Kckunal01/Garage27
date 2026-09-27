/** Stencil-style line glyphs for part / build categories. */
const PATHS: Record<string, string> = {
  lighting: 'M20 32a12 12 0 1 0 0-.01M20 26v12M32 32h14M32 26l12-6M32 38l12 6',
  cockpit: 'M6 30c6-10 14-12 20-12h12c6 0 14 2 20 12M26 18v10M38 18v10M22 30h20',
  body: 'M8 36c4-14 20-20 36-18 6 1 10 5 12 10-4 6-14 10-28 10H8z',
  seat: 'M6 34c4-8 12-10 18-8l14 2c8 1 16 3 20 6v4H6z',
  detail: 'M32 10l6 12 14 2-10 9 3 14-13-7-13 7 3-14-10-9 14-2z',
  luggage: 'M14 22h36v24H14zM24 22v-6h16v6M14 32h36',
  rear: 'M8 44a24 24 0 0 1 48 0M20 20l12 4M44 36h8',
  wheel: 'M32 32m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0M32 32m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M32 12v15M32 37v15M12 32h15M37 32h15',
  midBody: 'M14 22h36v22H14zM20 22v-6h24v6M22 44v6M42 44v6M14 33h36M26 28h12',
  finish: 'M18 44l20-20 6 6-20 20H18zM38 24l6-6 6 6-6 6M12 54h14',
  rearWheel: 'M32 36m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M10 30a24 22 0 0 1 44-6M32 36m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
}

export function CategoryGlyph({ category, className }: { category: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[category] ?? PATHS.detail} />
    </svg>
  )
}
