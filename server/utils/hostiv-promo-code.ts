import type { HostivPromoCode, HostivPromoCodeUpsertBody } from "../../app/types/hostiv-promo-code"
import {
  isEmailAllowedByTags,
  joinEmailTags,
  parseEmailTags
} from "../../app/utils/email-tags"
import { requireSupabaseAdmin } from "./supabase"

const PROMO_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const PROMO_CODE_LENGTH = 8
const STRIPE_MIN_AMOUNT_CENTS = 50

export type HostivPromoCodeRow = HostivPromoCode

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "")
}

export function computePromoPricing(originalCents: number, discountPercent: number) {
  const boundedPercent = Math.min(100, Math.max(1, Math.round(discountPercent)))
  const rawDiscountCents = Math.round((originalCents * boundedPercent) / 100)
  let finalCents = Math.max(0, originalCents - rawDiscountCents)

  if (finalCents > 0 && finalCents < STRIPE_MIN_AMOUNT_CENTS) {
    finalCents = STRIPE_MIN_AMOUNT_CENTS
  }

  const discountCents = originalCents - finalCents

  return {
    originalCents,
    discountCents,
    finalCents,
    discountPercent: boundedPercent,
    isFreeCheckout: finalCents === 0
  }
}

export function isPromoCodeActive(
  row: Pick<HostivPromoCodeRow, "valid_from" | "valid_until">,
  now = new Date()
) {
  const start = new Date(row.valid_from).getTime()
  const end = new Date(row.valid_until).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return false
  }

  const nowMs = now.getTime()

  return nowMs >= start && nowMs <= end
}

function mapPromoCodeRow(row: Record<string, unknown>): HostivPromoCodeRow {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    code: String(row.code || ""),
    valid_from: String(row.valid_from),
    valid_until: String(row.valid_until),
    discount_percent: Number(row.discount_percent || 0),
    allowed_emails: String(row.allowed_emails || "*"),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  }
}

function parsePromoUpsertBody(body: HostivPromoCodeUpsertBody) {
  const title = body.title?.trim()

  if (!title) {
    throw createError({ statusCode: 400, message: "Indiquez un titre." })
  }

  const validFrom = body.valid_from?.trim()
  const validUntil = body.valid_until?.trim()

  if (!validFrom || !validUntil) {
    throw createError({ statusCode: 400, message: "Indiquez les dates de validité." })
  }

  const start = new Date(validFrom)
  const end = new Date(validUntil)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw createError({ statusCode: 400, message: "Dates de validité invalides." })
  }

  if (end.getTime() <= start.getTime()) {
    throw createError({
      statusCode: 400,
      message: "La date de fin doit être postérieure au début de validité."
    })
  }

  const discountPercent = Number(body.discount_percent)

  if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    throw createError({
      statusCode: 400,
      message: "Le pourcentage de réduction doit être entre 1 et 100."
    })
  }

  const allowedEmails = joinEmailTags(parseEmailTags(body.allowed_emails))

  return {
    title,
    description: body.description?.trim() || "",
    valid_from: start.toISOString(),
    valid_until: end.toISOString(),
    discount_percent: Math.round(discountPercent),
    allowed_emails: allowedEmails
  }
}

export function generatePromoCodeCandidate(length = PROMO_CODE_LENGTH) {
  let code = ""

  for (let index = 0; index < length; index += 1) {
    const charIndex = Math.floor(Math.random() * PROMO_CODE_CHARS.length)

    code += PROMO_CODE_CHARS[charIndex]
  }

  return code
}

export async function isPromoCodeTaken(code: string, excludeId?: string | null) {
  const normalizedCode = normalizePromoCode(code)

  if (!normalizedCode) {
    return false
  }

  const supabase = requireSupabaseAdmin()

  let query = supabase.from("hostiv_promo_codes").select("id").eq("code", normalizedCode)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error("[hostiv-promo-code] exists:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier le code promo."
    })
  }

  return Boolean(data)
}

export async function generateUniquePromoCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generatePromoCodeCandidate()

    if (!(await isPromoCodeTaken(candidate))) {
      return candidate
    }
  }

  throw createError({
    statusCode: 502,
    message: "Impossible de générer un code promo unique."
  })
}

export async function listHostivPromoCodes(): Promise<HostivPromoCodeRow[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[hostiv-promo-code] list:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les codes promo."
    })
  }

  return (data ?? []).map((row) => mapPromoCodeRow(row as Record<string, unknown>))
}

export async function getHostivPromoCodeById(id: string): Promise<HostivPromoCodeRow | null> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_promo_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-promo-code] read:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger le code promo."
    })
  }

  if (!data) {
    return null
  }

  return mapPromoCodeRow(data as Record<string, unknown>)
}

async function resolvePromoCodeInput(body: HostivPromoCodeUpsertBody, excludeId?: string | null) {
  const parsed = parsePromoUpsertBody(body)

  let code = ""

  if (body.generate_code) {
    code = await generateUniquePromoCode()
  } else {
    code = normalizePromoCode(body.code || "")

    if (!code || code.length < 4) {
      throw createError({
        statusCode: 400,
        message: "Le code doit contenir au moins 4 caractères."
      })
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      throw createError({
        statusCode: 400,
        message: "Le code ne peut contenir que lettres, chiffres, tirets et underscores."
      })
    }

    if (await isPromoCodeTaken(code, excludeId)) {
      throw createError({
        statusCode: 409,
        message: "Ce code promo existe déjà."
      })
    }
  }

  return {
    ...parsed,
    code
  }
}

export async function createHostivPromoCode(body: HostivPromoCodeUpsertBody) {
  const payload = await resolvePromoCodeInput(body)
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_promo_codes")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    console.error("[hostiv-promo-code] create:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de créer le code promo."
    })
  }

  return mapPromoCodeRow(data as Record<string, unknown>)
}

export async function updateHostivPromoCode(id: string, body: HostivPromoCodeUpsertBody) {
  const existing = await getHostivPromoCodeById(id)

  if (!existing) {
    throw createError({ statusCode: 404, message: "Code promo introuvable." })
  }

  const payload = await resolvePromoCodeInput(body, id)
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_promo_codes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    console.error("[hostiv-promo-code] update:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de mettre à jour le code promo."
    })
  }

  return mapPromoCodeRow(data as Record<string, unknown>)
}

export async function deleteHostivPromoCode(id: string) {
  const supabase = requireSupabaseAdmin()

  const { error } = await supabase.from("hostiv_promo_codes").delete().eq("id", id)

  if (error) {
    console.error("[hostiv-promo-code] delete:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de supprimer le code promo."
    })
  }
}

export async function getHostivPromoCodeByCode(code: string) {
  const normalizedCode = normalizePromoCode(code)

  if (!normalizedCode) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_promo_codes")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-promo-code] lookup:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier le code promo."
    })
  }

  if (!data) {
    return null
  }

  return mapPromoCodeRow(data as Record<string, unknown>)
}

export async function validateHostivPromoCode(input: {
  code: string
  email: string
  originalAmountCents: number
}) {
  const normalizedEmail = input.email.trim().toLowerCase()

  if (!normalizedEmail.includes("@")) {
    throw createError({ statusCode: 400, message: "Indiquez un e-mail valide." })
  }

  const row = await getHostivPromoCodeByCode(input.code)

  if (!row) {
    throw createError({ statusCode: 404, message: "Code promo invalide." })
  }

  if (!isPromoCodeActive(row)) {
    throw createError({ statusCode: 400, message: "Ce code promo n’est pas valide à cette date." })
  }

  if (!isEmailAllowedByTags(row.allowed_emails, normalizedEmail)) {
    throw createError({
      statusCode: 403,
      message: "Ce code promo n’est pas disponible pour cette adresse e-mail."
    })
  }

  const pricing = computePromoPricing(input.originalAmountCents, row.discount_percent)

  return {
    valid: true as const,
    promo_code_id: row.id,
    code: row.code,
    title: row.title,
    discount_percent: pricing.discountPercent,
    original_amount_cents: pricing.originalCents,
    discount_cents: pricing.discountCents,
    final_amount_cents: pricing.finalCents,
    is_free_checkout: pricing.isFreeCheckout
  }
}

export async function resolveCheckoutPromo(input: {
  promoCode?: string | null
  email: string
  originalAmountCents: number
}) {
  const code = input.promoCode?.trim()

  if (!code) {
    return null
  }

  return validateHostivPromoCode({
    code,
    email: input.email,
    originalAmountCents: input.originalAmountCents
  })
}

export function promoCodeSessionMetadata(
  promo: Awaited<ReturnType<typeof validateHostivPromoCode>>
) {
  return {
    promo_code: promo.code,
    promo_code_id: promo.promo_code_id,
    promo_discount_percent: String(promo.discount_percent),
    amount_subtotal_cents: String(promo.original_amount_cents),
    discount_cents: String(promo.discount_cents)
  }
}
