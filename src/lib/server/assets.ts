import 'server-only'
import { existsSync } from 'node:fs'
import path from 'node:path'

const seen = new Map<string, boolean>()

/**
 * True if a /public asset has actually been delivered. Lets pages reference
 * the agreed asset paths today and fall back to procedural art until the
 * optimised photography lands — without shipping 404s to the browser.
 */
export function assetExists(publicPath?: string): publicPath is string {
  if (!publicPath || !publicPath.startsWith('/')) return false
  const cached = seen.get(publicPath)
  if (cached !== undefined) return cached
  const found = existsSync(path.join(process.cwd(), 'public', publicPath))
  seen.set(publicPath, found)
  return found
}
