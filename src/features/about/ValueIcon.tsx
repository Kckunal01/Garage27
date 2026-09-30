/** Red line icons for the four values (drawn to match the reference's neon line work). */
export function ValueIcon({ name }: { name: 'helmet' | 'wrenches' | 'plug' | 'peaks' }) {
  return (
    <svg className="abt-value__icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {name === 'helmet' && (
        <>
          <path d="M8 30c0-11 7.5-19 17-19 8.8 0 15 6.6 15 15v4c0 1.7-1.3 3-3 3H20l-2.5 5H11c-1.7 0-3-1.3-3-3z" />
          <path d="M24 22h16" />
          <path d="M24 22c-1.5 3-1.5 7 0 11" />
          <path d="M14 18c2.5-2.4 5.6-3.6 9-3.8" />
        </>
      )}
      {name === 'wrenches' && (
        <>
          <path d="M11 9a6 6 0 0 0 7.6 7.6L33 31l3-3-14.4-14.4A6 6 0 0 0 14 6l3.5 3.5-2 2L12 8z" />
          <path d="M37 9a6 6 0 0 1-7.6 7.6L15 31l-3-3 14.4-14.4A6 6 0 0 1 34 6l-3.5 3.5 2 2L36 8z" />
          <path d="M12 34l-2 2a2.8 2.8 0 0 0 4 4l2-2M36 34l2 2a2.8 2.8 0 0 1-4 4l-2-2" />
        </>
      )}
      {name === 'plug' && (
        <>
          <path d="M31 6l11 11" />
          <path d="M34 9l-7 7 5 5 7-7" />
          <path d="M27 16l-3 3 5 5 3-3" />
          <path d="M24 19L12 31l5 5 12-12" />
          <path d="M12 31l-3 3 5 5 3-3" />
          <path d="M9 34l-4 4" />
          <path d="M16 27l5 5M19 24l5 5" />
        </>
      )}
      {name === 'peaks' && (
        <>
          <path d="M4 38l12-18 7 10 6-8 15 16z" />
          <path d="M13 24.5l3 2.5 3-3 1.8 2.6M26.6 25.2l2.4 1.8 2.6-2.3" />
          <path d="M4 42h40" />
        </>
      )}
    </svg>
  )
}
