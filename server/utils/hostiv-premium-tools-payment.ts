import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { hasHostivPremiumTools } from "../../app/utils/hostiv-premium-tools"
import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { getPropertySubscriptionBySlug } from "./hostiv-property-subscription"
import { getHostivAccountByUserId } from "./hostiv-subscription"
import { requireSupabaseAdmin } from "./supabase"

export function computePremiumToolsUntilAfterAnnualPayment(
  currentUntil: string | null | undefined,
  now = new Date()
) {
  const active =
    typeof currentUntil === "string" &&
    currentUntil.trim() &&
    isHostivSubscriptionActive(currentUntil, now)

  const base = active ? new Date(currentUntil!) : now
  const end = new Date(base)

  end.setUTCFullYear(end.getUTCFullYear() + 1)

  return end.toISOString()
}

type PremiumToolsSubscriptionSource = {
  subscription_plan: string
  paid_until: string | null
  premium_tools_until: string | null
  premium_tools_started_at: string | null
}

function resolvePremiumToolsPaymentDates(
  source: PremiumToolsSubscriptionSource,
  now = new Date()
) {
  const paidUntil = typeof source.paid_until === "string" ? source.paid_until : null
  const existingStartedAt =
    typeof source.premium_tools_started_at === "string" ? source.premium_tools_started_at : null
  const existingUntil =
    typeof source.premium_tools_until === "string" ? source.premium_tools_until : null

  const premiumToolsUntil = computePremiumToolsUntilAfterAnnualPayment(existingUntil, now)
  const premiumToolsStartedAt =
    existingStartedAt && isHostivSubscriptionActive(existingUntil, now)
      ? existingStartedAt
      : now.toISOString()

  const premiumToolsEnd = new Date(premiumToolsUntil)
  const starterPaidUntilEnd = paidUntil ? new Date(paidUntil) : null
  const alignedPaidUntil =
    starterPaidUntilEnd && starterPaidUntilEnd > premiumToolsEnd
      ? paidUntil!
      : premiumToolsUntil

  return {
    paid_until: alignedPaidUntil,
    premium_tools_until: premiumToolsUntil,
    premium_tools_started_at: premiumToolsStartedAt
  }
}

export async function applyHostivPremiumToolsPayment(
  userId: string,
  propertySlug: string,
  now = new Date()
) {
  const normalizedSlug = propertySlug.trim().toLowerCase()

  if (!normalizedSlug) {
    throw createError({
      statusCode: 400,
      message: "Site introuvable pour ce paiement."
    })
  }

  const [account, property] = await Promise.all([
    getHostivAccountByUserId(userId),
    getPropertySubscriptionBySlug(normalizedSlug)
  ])

  if (!account) {
    throw createError({
      statusCode: 404,
      message: "Compte Hostiv introuvable."
    })
  }

  if (!property || property.owner_user_id !== userId) {
    throw createError({
      statusCode: 404,
      message: "Site introuvable."
    })
  }

  const source: PremiumToolsSubscriptionSource =
    property.paid_until != null
      ? {
          subscription_plan: property.subscription_plan,
          paid_until: property.paid_until,
          premium_tools_until: property.premium_tools_until,
          premium_tools_started_at: property.premium_tools_started_at
        }
      : {
          subscription_plan: account.subscription_plan,
          paid_until: account.paid_until,
          premium_tools_until: account.premium_tools_until,
          premium_tools_started_at: account.premium_tools_started_at
        }

  if (normalizeHostivSubscriptionPlan(source.subscription_plan) !== "starter") {
    throw createError({
      statusCode: 400,
      message: "Starter + est réservé au forfait Starter."
    })
  }

  if (
    hasHostivPremiumTools({
      plan: source.subscription_plan,
      paid_until: source.paid_until,
      premium_tools_until: source.premium_tools_until,
      now
    })
  ) {
    throw createError({
      statusCode: 400,
      message: "Starter + est déjà actif sur ce logement."
    })
  }

  if (!isHostivSubscriptionActive(source.paid_until, now)) {
    throw createError({
      statusCode: 400,
      message: "Renouvelez d’abord votre forfait Starter pour activer Starter +."
    })
  }

  const payment = resolvePremiumToolsPaymentDates(source, now)
  const supabase = requireSupabaseAdmin()

  const { error: propertyUpdateError } = await supabase
    .from("properties")
    .update({
      paid_until: payment.paid_until,
      premium_tools_until: payment.premium_tools_until,
      premium_tools_started_at: payment.premium_tools_started_at
    })
    .eq("id", property.id)

  if (propertyUpdateError) {
    console.error("[hostiv-premium-tools-payment] update property:", propertyUpdateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer Starter +."
    })
  }

  const { error: accountUpdateError } = await supabase
    .from("hostiv_accounts")
    .update({
      paid_until: payment.paid_until,
      premium_tools_until: payment.premium_tools_until,
      premium_tools_started_at: payment.premium_tools_started_at
    })
    .eq("id", userId)

  if (accountUpdateError) {
    console.error("[hostiv-premium-tools-payment] update account:", accountUpdateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer Starter +."
    })
  }

  return payment
}

/** @deprecated Utiliser applyHostivPremiumToolsPayment(userId, propertySlug) */
export async function applyHostivPremiumToolsPaymentToAccount(userId: string, now = new Date()) {
  const account = await getHostivAccountByUserId(userId)

  if (!account) {
    throw createError({
      statusCode: 404,
      message: "Compte Hostiv introuvable."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error } = await supabase
    .from("properties")
    .select("slug")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-premium-tools-payment] resolve property:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’activer Starter +."
    })
  }

  const slug = typeof property?.slug === "string" ? property.slug : ""

  if (!slug) {
    throw createError({
      statusCode: 404,
      message: "Aucun logement associé à ce compte."
    })
  }

  return applyHostivPremiumToolsPayment(userId, slug, now)
}
