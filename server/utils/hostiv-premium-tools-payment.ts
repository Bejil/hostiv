import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { hasHostivPremiumTools } from "../../app/utils/hostiv-premium-tools"
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

export async function applyHostivPremiumToolsPaymentToAccount(userId: string, now = new Date()) {
  const supabase = requireSupabaseAdmin()

  const { data: account, error: readError } = await supabase
    .from("hostiv_accounts")
    .select("subscription_plan, paid_until, premium_tools_until, premium_tools_started_at")
    .eq("id", userId)
    .maybeSingle()

  if (readError) {
    console.error("[hostiv-premium-tools-payment] read account:", readError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’activer Starter +."
    })
  }

  if (!account) {
    throw createError({
      statusCode: 404,
      message: "Compte Hostiv introuvable."
    })
  }

  if (
    hasHostivPremiumTools({
      plan: account.subscription_plan,
      premium_tools_until: account.premium_tools_until,
      now
    })
  ) {
    throw createError({
      statusCode: 400,
      message: "Starter + est déjà actif sur votre compte."
    })
  }

  const paidUntil = typeof account.paid_until === "string" ? account.paid_until : null

  if (!isHostivSubscriptionActive(paidUntil, now)) {
    throw createError({
      statusCode: 400,
      message: "Renouvelez d’abord votre forfait Starter pour activer Starter +."
    })
  }

  const existingStartedAt =
    typeof account.premium_tools_started_at === "string" ? account.premium_tools_started_at : null
  const existingUntil =
    typeof account.premium_tools_until === "string" ? account.premium_tools_until : null

  const premiumToolsUntil = computePremiumToolsUntilAfterAnnualPayment(existingUntil, now)
  const premiumToolsStartedAt =
    existingStartedAt &&
    isHostivSubscriptionActive(existingUntil, now)
      ? existingStartedAt
      : now.toISOString()

  const premiumToolsEnd = new Date(premiumToolsUntil)
  const starterPaidUntilEnd = paidUntil ? new Date(paidUntil) : null
  const alignedPaidUntil =
    starterPaidUntilEnd && starterPaidUntilEnd > premiumToolsEnd
      ? paidUntil!
      : premiumToolsUntil

  const { error: updateError } = await supabase
    .from("hostiv_accounts")
    .update({
      paid_until: alignedPaidUntil,
      premium_tools_until: premiumToolsUntil,
      premium_tools_started_at: premiumToolsStartedAt
    })
    .eq("id", userId)

  if (updateError) {
    console.error("[hostiv-premium-tools-payment] update account:", updateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer Starter +."
    })
  }

  return {
    paid_until: alignedPaidUntil,
    premium_tools_until: premiumToolsUntil,
    premium_tools_started_at: premiumToolsStartedAt
  }
}
