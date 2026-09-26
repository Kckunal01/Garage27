import type { ReactNode } from 'react'

/** Re-mounts per navigation: each route arrives like walking into the next bay. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="bay-enter">{children}</div>
}
