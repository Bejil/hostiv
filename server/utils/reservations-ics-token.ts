import { randomBytes, timingSafeEqual } from "node:crypto"
import type { H3Event } from "h3"
import { requireSupabaseAdmin } from "./supabase"

export function createPropertyReservationsIcsTokenValue() {
  return randomBytes(32).toString("base64url")
}

function tokensMatch(expected: string, provided: string) {
  if (expected.length !== provided.length) {
    return false
  }

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  } catch {
    return false
  }
}

async function readPropertyReservationsIcsToken(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("reservations_ics_token")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-ics-token] read:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de lire le jeton ICS."
    })
  }

  const token =
    typeof data?.reservations_ics_token === "string" ? data.reservations_ics_token.trim() : ""

  return token.length ? token : null
}

async function writePropertyReservationsIcsToken(slug: string, token: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { error } = await supabase
    .from("properties")
    .update({ reservations_ics_token: token })
    .eq("slug", normalizedSlug)

  if (error) {
    console.error("[property-ics-token] write:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer le jeton ICS."
    })
  }
}

/** Retourne le jeton existant ou en crée un nouveau (idempotent). */
export async function ensurePropertyReservationsIcsToken(slug: string) {
  const existing = await readPropertyReservationsIcsToken(slug)

  if (existing) {
    return existing
  }

  const token = createPropertyReservationsIcsTokenValue()
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .update({ reservations_ics_token: token })
    .eq("slug", normalizedSlug)
    .is("reservations_ics_token", null)
    .select("reservations_ics_token")
    .maybeSingle()

  if (error) {
    console.error("[property-ics-token] ensure:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de générer le jeton ICS."
    })
  }

  const stored =
    typeof data?.reservations_ics_token === "string" ? data.reservations_ics_token.trim() : ""

  if (stored) {
    return stored
  }

  const reread = await readPropertyReservationsIcsToken(slug)

  if (reread) {
    return reread
  }

  throw createError({
    statusCode: 502,
    message: "Impossible de générer le jeton ICS."
  })
}

/** Invalide l’ancien lien et en génère un nouveau. */
export async function rotatePropertyReservationsIcsToken(slug: string) {
  const token = createPropertyReservationsIcsTokenValue()

  await writePropertyReservationsIcsToken(slug, token)

  return token
}

export async function verifyPropertyReservationsIcsToken(slug: string, token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return false
  }

  const stored = await readPropertyReservationsIcsToken(slug)

  if (!stored) {
    return false
  }

  return tokensMatch(stored, normalizedToken)
}

/** @deprecated Alias historique — préférer verifyPropertyReservationsIcsToken. */
export const verifyReservationsIcsToken = verifyPropertyReservationsIcsToken

function getPublicApiOrigin(event: H3Event) {
  const config = useRuntimeConfig()
  const configured = config.public.siteUrl?.trim().replace(/\/$/, "")

  if (configured) {
    return configured
  }

  const requestUrl = getRequestURL(event)

  return `${requestUrl.protocol}//${requestUrl.host}`
}

export function buildReservationsIcsFeedUrl(event: H3Event, slug: string, token: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const origin = getPublicApiOrigin(event)

  return `${origin}/api/calendar/${encodeURIComponent(normalizedSlug)}/reservations.ics?token=${encodeURIComponent(token)}`
}
