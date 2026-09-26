/** Mirrors src/styles/breakpoints.css — keep the two in sync. */
export const BREAKPOINTS = { desktop: 768, wide: 1200 } as const

export const MEDIA = {
  mobile: `(width < ${BREAKPOINTS.desktop}px)`,
  desktop: `(width >= ${BREAKPOINTS.desktop}px)`,
  wide: `(width >= ${BREAKPOINTS.wide}px)`,
} as const
