import { createClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"
import type { H3Event } from "h3"
import { getPropertyOwnerUserId } from "./property-admin-repository"
import { isPlatformAdminEmail } from "./platform-admin-auth"

export type PropertyAdminAccessContext = {
  user: User
  ownerUserId: string
  isPlatformAdmin: boolean
}

function getBearerToken(event: H3Event) {
  const header = getHeader(event, "authorization") || ""

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }

  return ""
}

async function getUserFromBearerToken(event: H3Event) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()
  const token = getBearerToken(event)

  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError({
      statusCode: 503,
      message: "Supabase non configuré."
    })
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Connexion requise."
    })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw createError({
      statusCode: 401,
      message: "Session invalide ou expirée."
    })
  }

  return data.user
}

export async function requirePropertyAdminAccess(
  event: H3Event,
  slug: string
): Promise<PropertyAdminAccessContext> {
  const user = await getUserFromBearerToken(event)
  const ownerUserId = await getPropertyOwnerUserId(slug)

  if (!ownerUserId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ce backoffice n’existe pas."
    })
  }

  if (ownerUserId === user.id) {
    return { user, ownerUserId, isPlatformAdmin: false }
  }

  if (isPlatformAdminEmail(user.email)) {
    return { user, ownerUserId, isPlatformAdmin: true }
  }

  throw createError({
    statusCode: 403,
    message: "Vous n’êtes pas autorisé à administrer ce site."
  })
}

export async function requirePropertyOwner(event: H3Event, slug: string) {
  const access = await requirePropertyAdminAccess(event, slug)

  return access.user
}

export async function getAuthenticatedUserFromEvent(event: H3Event) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim()
  const token = getBearerToken(event)

  if (!supabaseUrl || !supabaseAnonKey || !token) {
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  return data.user
}

/** true si l’utilisateur connecté peut administrer le site (propriétaire ou admin plateforme). */
export async function isPropertyOwnerUser(event: H3Event, slug: string): Promise<boolean> {
  const user = await getAuthenticatedUserFromEvent(event)

  if (!user) {
    return false
  }

  const ownerUserId = await getPropertyOwnerUserId(slug)

  if (!ownerUserId) {
    return false
  }

  if (ownerUserId === user.id) {
    return true
  }

  return isPlatformAdminEmail(user.email)
}
