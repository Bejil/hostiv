import { randomBytes } from "node:crypto"
import type { User } from "@supabase/supabase-js"
import { getHostivPasswordResetPath } from "../../app/data/hostiv-routes"
import type { HostivLocale } from "../../app/types/hostiv-locale"
import { isHostivPasswordValid } from "../../app/utils/hostiv-password-rules"
import { getHostivMarketingUrl } from "./hostiv-email-theme"
import { sendHostivPasswordChangedEmail, sendHostivPasswordResetEmail } from "./transactional-email"
import { requireSupabaseAdmin } from "./supabase"

export const HOSTIV_PASSWORD_RESET_TTL_MS = 24 * 60 * 60 * 1000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type PasswordResetTokenRow = {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  used_at: string | null
}

export function normalizeHostivAccountEmail(value: string) {
  return value.trim().toLowerCase()
}

export function isHostivAccountEmailValid(value: string) {
  return EMAIL_RE.test(normalizeHostivAccountEmail(value))
}

export function buildHostivPasswordResetUrl(locale: HostivLocale, token: string) {
  const base = getHostivMarketingUrl().replace(/\/$/, "")
  const path = getHostivPasswordResetPath(locale)

  return `${base}${path}?token=${encodeURIComponent(token)}`
}

function createPasswordResetTokenValue() {
  return randomBytes(32).toString("base64url")
}

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = requireSupabaseAdmin()
  const normalizedEmail = normalizeHostivAccountEmail(email)
  let page = 1

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })

    if (error) {
      console.error("[hostiv-password-reset] list users:", error.message)

      throw createError({
        statusCode: 502,
        message: "Impossible de vérifier ce compte pour le moment."
      })
    }

    const match = data.users.find(
      (user) => normalizeHostivAccountEmail(user.email || "") === normalizedEmail
    )

    if (match) {
      return match
    }

    if (data.users.length < 200) {
      return null
    }

    page += 1
  }

  return null
}

async function invalidateActiveResetTokens(userId: string) {
  const supabase = requireSupabaseAdmin()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from("hostiv_password_reset_tokens")
    .update({ used_at: now })
    .eq("user_id", userId)
    .is("used_at", null)

  if (error) {
    console.error("[hostiv-password-reset] invalidate:", error.message)
  }
}

async function loadActiveResetToken(token: string) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_password_reset_tokens")
    .select("id, user_id, email, token, expires_at, used_at")
    .eq("token", normalizedToken)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-password-reset] load token:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier ce lien pour le moment."
    })
  }

  if (!data) {
    return null
  }

  return data as PasswordResetTokenRow
}

export async function requestHostivPasswordReset(input: {
  email: string
  locale: HostivLocale
}) {
  const email = normalizeHostivAccountEmail(input.email)

  if (!isHostivAccountEmailValid(email)) {
    throw createError({ statusCode: 400, message: "Adresse e-mail invalide." })
  }

  const user = await findAuthUserByEmail(email)

  if (!user?.id) {
    return { ok: true as const, sent: false as const }
  }

  const token = createPasswordResetTokenValue()
  const expiresAt = new Date(Date.now() + HOSTIV_PASSWORD_RESET_TTL_MS).toISOString()

  await invalidateActiveResetTokens(user.id)

  const supabase = requireSupabaseAdmin()

  const { error } = await supabase.from("hostiv_password_reset_tokens").insert({
    user_id: user.id,
    email,
    token,
    expires_at: expiresAt
  })

  if (error) {
    console.error("[hostiv-password-reset] insert:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’envoyer l’e-mail pour le moment."
    })
  }

  const resetUrl = buildHostivPasswordResetUrl(input.locale, token)

  await sendHostivPasswordResetEmail({
    to: email,
    resetUrl,
    locale: input.locale
  })

  return { ok: true as const, sent: true as const }
}

export async function validateHostivPasswordResetToken(token: string) {
  const row = await loadActiveResetToken(token)

  if (!row || row.used_at) {
    return { valid: false as const, expired: false as const }
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return { valid: false as const, expired: true as const }
  }

  return { valid: true as const, expired: false as const }
}

export async function confirmHostivPasswordReset(input: { token: string; password: string }) {
  const password = input.password
  const row = await loadActiveResetToken(input.token)

  if (!row || row.used_at) {
    throw createError({ statusCode: 404, message: "Lien de réinitialisation invalide." })
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    throw createError({
      statusCode: 410,
      message: "Ce lien a expiré. Demandez un nouveau lien depuis la page de connexion."
    })
  }

  if (!isHostivPasswordValid(password)) {
    throw createError({
      statusCode: 400,
      message: "Choisissez un mot de passe qui respecte tous les critères de sécurité."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { error: updateError } = await supabase.auth.admin.updateUserById(row.user_id, {
    password
  })

  if (updateError) {
    console.error("[hostiv-password-reset] update user:", updateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de mettre à jour le mot de passe."
    })
  }

  const now = new Date().toISOString()

  const { error: markError } = await supabase
    .from("hostiv_password_reset_tokens")
    .update({ used_at: now })
    .eq("id", row.id)

  if (markError) {
    console.error("[hostiv-password-reset] mark used:", markError.message)
  }

  void sendHostivPasswordChangedEmail({ to: row.email })

  return { ok: true as const }
}
