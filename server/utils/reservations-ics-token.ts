import { createHmac, timingSafeEqual } from "node:crypto"

function reservationsIcsSecret() {
  const config = useRuntimeConfig()

  return (
    config.supabaseServiceRoleKey ||
    config.stripeSecretKey ||
    "dev-reservations-ics-secret"
  )
}

export function createReservationsIcsToken(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()

  return createHmac("sha256", reservationsIcsSecret())
    .update(`hostiv:reservations-ics:${normalizedSlug}`)
    .digest("hex")
}

export function verifyReservationsIcsToken(slug: string, token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return false
  }

  const expected = createReservationsIcsToken(slug)

  if (expected.length !== normalizedToken.length) {
    return false
  }

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedToken))
  } catch {
    return false
  }
}

export function buildReservationsIcsFeedUrl(event: H3Event, slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const token = createReservationsIcsToken(normalizedSlug)
  const origin = getPublicApiOrigin(event)

  return `${origin}/api/calendar/${encodeURIComponent(normalizedSlug)}/reservations.ics?token=${token}`
}

function getPublicApiOrigin(event: H3Event) {
  const config = useRuntimeConfig()
  const configured = config.public.siteUrl?.trim().replace(/\/$/, "")

  if (configured) {
    return configured
  }

  const requestUrl = getRequestURL(event)

  return `${requestUrl.protocol}//${requestUrl.host}`
}
