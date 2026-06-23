import type { H3Event } from "h3"

function readSupabaseHost() {
  const raw = process.env.SUPABASE_URL?.trim()

  if (!raw) {
    return ""
  }

  try {
    return new URL(raw).host
  } catch {
    return ""
  }
}

function buildContentSecurityPolicy() {
  const supabaseHost = readSupabaseHost()
  const connectSrc = [
    "'self'",
    "https://api.stripe.com",
    "https://tiles.openfreemap.org"
  ]

  if (supabaseHost) {
    connectSrc.push(`https://${supabaseHost}`, `wss://${supabaseHost}`)
  } else {
    connectSrc.push("https://*.supabase.co", "wss://*.supabase.co")
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://tiles.openfreemap.org",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.openstreetmap.org"
  ].join("; ")
}

/** En-têtes HTTP de durcissement (CSP, HSTS, etc.). */
export function applySecurityHeaders(event: H3Event) {
  setHeaders(event, {
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": buildContentSecurityPolicy()
  })

  if (process.env.NODE_ENV !== "production") {
    return
  }

  const requestUrl = getRequestURL(event)

  if (requestUrl.protocol === "https:") {
    setHeader(event, "Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
}
