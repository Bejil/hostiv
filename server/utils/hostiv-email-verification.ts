import {
  resolveHostivSiteBaseUrl,
  resolveHostivSiteBaseUrlForSignupFulfillment
} from "./hostiv-site-base-url"
import { requireSupabaseAdmin } from "./supabase"

/** Lien de confirmation e-mail Supabase après création de compte (email_confirm: false). */
export async function generateHostivEmailVerificationLink(input: {
  email: string
  password: string
  propertySlug: string
  siteBaseUrl?: string
}) {
  const email = input.email.trim().toLowerCase()
  const slug = input.propertySlug.trim().toLowerCase()
  const siteBase = (input.siteBaseUrl || resolveHostivSiteBaseUrl()).replace(/\/$/, "")
  const redirectTo = `${siteBase}/${encodeURIComponent(slug)}/admin?onboarding=1`

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password: input.password,
    options: { redirectTo }
  })

  if (error) {
    console.error("[hostiv-email-verification] generateLink:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de générer le lien de confirmation e-mail."
    })
  }

  const actionLink = data.properties?.action_link?.trim()

  if (!actionLink) {
    throw createError({
      statusCode: 502,
      message: "Lien de confirmation e-mail indisponible."
    })
  }

  return actionLink
}

export function isSupabaseEmailNotConfirmedError(message: string) {
  const normalized = message.trim().toLowerCase()

  return (
    normalized.includes("email not confirmed") ||
    normalized.includes("email address not confirmed") ||
    normalized.includes("e-mail not confirmed")
  )
}
