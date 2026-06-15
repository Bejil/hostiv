import type { User } from "@supabase/supabase-js"
import type { H3Event } from "h3"
import { getAuthenticatedUserFromEvent } from "./admin-auth"

export function readPlatformAdminEmails() {
  const raw = process.env.HOSTIV_PLATFORM_ADMIN_EMAILS?.trim() || ""

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isPlatformAdminEmail(email: string | null | undefined) {
  if (!email?.trim()) {
    return false
  }

  const allowed = readPlatformAdminEmails()

  if (!allowed.size) {
    return false
  }

  return allowed.has(email.trim().toLowerCase())
}

export async function requirePlatformAdmin(event: H3Event): Promise<User> {
  const allowed = readPlatformAdminEmails()

  if (!allowed.size) {
    throw createError({
      statusCode: 503,
      message: "Admin plateforme non configuré (HOSTIV_PLATFORM_ADMIN_EMAILS)."
    })
  }

  const user = await getAuthenticatedUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Connexion requise."
    })
  }

  if (!isPlatformAdminEmail(user.email)) {
    throw createError({
      statusCode: 403,
      message: "Accès réservé aux administrateurs Hostiv."
    })
  }

  return user
}
