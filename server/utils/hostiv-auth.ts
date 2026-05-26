import { createClient } from "@supabase/supabase-js"
import type { H3Event } from "h3"
import type { User } from "@supabase/supabase-js"

function getBearerToken(event: H3Event) {
  const header = getHeader(event, "authorization") || ""

  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }

  return ""
}

export async function getBearerUser(event: H3Event): Promise<User> {
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
