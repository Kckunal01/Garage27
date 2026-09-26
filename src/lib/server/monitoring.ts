/**
 * Safe structured error reporting. Logs a scope + message + non-sensitive
 * context only. Never pass secrets, card data, or customer PII in `context`.
 * Swap the console sink for Sentry/Logtail etc. without touching call sites.
 */
const REDACT = /(key|secret|token|password|signature|authorization|email|phone|name|address)/i

export function reportError(scope: string, err: unknown, context: Record<string, unknown> = {}) {
  const safe: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(context)) safe[k] = REDACT.test(k) ? '[redacted]' : v
  const message = err instanceof Error ? err.message : String(err)
  console.error(JSON.stringify({ level: 'error', scope, message, ...safe, at: new Date().toISOString() }))
}
