import { createClient } from "@supabase/supabase-js"
import type { H3Event } from "h3"
import { getPropertyOwnerUserId } from "./property-admin-repository"

function getBearerToken(event: H3Event) {
  const header = getHeader(event, "authorization") || ""

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }

  return ""
}

export async function requirePropertyOwner(event: H3Event, slug: string) {
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

  const ownerUserId = await getPropertyOwnerUserId(slug)

  if (!ownerUserId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ce backoffice n’existe pas."
    })
  }

  if (ownerUserId !== data.user.id) {
    throw createError({
      statusCode: 403,
      message: "Vous n’êtes pas autorisé à administrer ce site."
    })
  }

  return data.user
}
