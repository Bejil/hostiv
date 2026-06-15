import type { H3Event } from "h3"

type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitRule = {
  prefix: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, RateLimitBucket>()

const RULES: RateLimitRule[] = [
  { prefix: "/api/hostiv/password-reset/request", limit: 5, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/hostiv/password-reset/confirm", limit: 10, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/hostiv/contact", limit: 5, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/hostiv/signup-checkout", limit: 10, windowMs: 60 * 60 * 1000 },
  { prefix: "/api/booking/create-payment-intent", limit: 30, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/booking/complete", limit: 30, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/booking/request", limit: 10, windowMs: 15 * 60 * 1000 },
  { prefix: "/api/guest-review/submit", limit: 10, windowMs: 60 * 60 * 1000 }
]

function pruneExpiredBuckets(now: number) {
  if (buckets.size < 5000) {
    return
  }

  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(event: H3Event) {
  const forwarded = getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim()

  if (forwarded) {
    return forwarded
  }

  return getRequestIP(event, { xForwardedFor: true }) || "unknown"
}

function matchRule(path: string) {
  return RULES.find((rule) => path === rule.prefix || path.startsWith(`${rule.prefix}/`))
}

export function enforceRateLimit(event: H3Event) {
  const path = getRequestURL(event).pathname
  const rule = matchRule(path)

  if (!rule) {
    return
  }

  const now = Date.now()
  pruneExpiredBuckets(now)

  const key = `${rule.prefix}:${getClientIp(event)}`
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return
  }

  if (bucket.count >= rule.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))

    setResponseHeader(event, "Retry-After", String(retryAfterSec))

    throw createError({
      statusCode: 429,
      message: "Trop de requêtes. Réessayez dans quelques minutes."
    })
  }

  bucket.count += 1
}
