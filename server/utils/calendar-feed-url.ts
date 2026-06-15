import { isIP } from "node:net"

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog"
])

function isPrivateOrReservedIpv4(hostname: string) {
  const parts = hostname.split(".").map(Number)

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true
  }

  const [a, b] = parts

  if (a === 10) {
    return true
  }

  if (a === 127) {
    return true
  }

  if (a === 0) {
    return true
  }

  if (a === 169 && b === 254) {
    return true
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true
  }

  if (a === 192 && b === 168) {
    return true
  }

  if (a === 100 && b >= 64 && b <= 127) {
    return true
  }

  return false
}

function isPrivateOrReservedIpv6(hostname: string) {
  const normalized = hostname.toLowerCase()

  if (normalized === "::1" || normalized === "::") {
    return true
  }

  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return true
  }

  if (normalized.startsWith("fe80:")) {
    return true
  }

  return false
}

function isBlockedHost(hostname: string) {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "")

  if (!normalized) {
    return true
  }

  if (BLOCKED_HOSTNAMES.has(normalized)) {
    return true
  }

  if (normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
    return true
  }

  const ipVersion = isIP(normalized)

  if (ipVersion === 4) {
    return isPrivateOrReservedIpv4(normalized)
  }

  if (ipVersion === 6) {
    return isPrivateOrReservedIpv6(normalized)
  }

  return false
}

/** Valide une URL de flux ICS externe (HTTPS public, pas d’IP privée / localhost). */
export function assertAllowedCalendarFeedUrl(raw: string) {
  const trimmed = raw.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      message: "URL de calendrier invalide."
    })
  }

  let parsed: URL

  try {
    parsed = new URL(trimmed)
  } catch {
    throw createError({
      statusCode: 400,
      message: "URL de calendrier invalide."
    })
  }

  if (parsed.protocol !== "https:") {
    throw createError({
      statusCode: 400,
      message: "Seules les URLs HTTPS sont autorisées pour les calendriers externes."
    })
  }

  if (parsed.username || parsed.password) {
    throw createError({
      statusCode: 400,
      message: "Les identifiants dans l’URL du calendrier ne sont pas autorisés."
    })
  }

  if (isBlockedHost(parsed.hostname)) {
    throw createError({
      statusCode: 400,
      message: "Cette URL de calendrier n’est pas autorisée."
    })
  }

  return trimmed
}

export function assertAllowedCalendarFeedUrls(urls: string[]) {
  for (const url of urls) {
    assertAllowedCalendarFeedUrl(url)
  }
}
