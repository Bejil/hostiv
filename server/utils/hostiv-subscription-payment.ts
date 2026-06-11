import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { normalizeHostivSubscriptionPlan, type HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { emptySubscriptionRemindersSent } from "./hostiv-subscription-reminders"
import { requireSupabaseAdmin } from "./supabase"

export function computePaidUntilAfterAnnualPayment(
  currentPaidUntil: string | null | undefined,
  now = new Date()
) {
  const active =
    typeof currentPaidUntil === "string" &&
    currentPaidUntil.trim() &&
    isHostivSubscriptionActive(currentPaidUntil, now)

  const base = active ? new Date(currentPaidUntil!) : now
  const end = new Date(base)

  end.setUTCFullYear(end.getUTCFullYear() + 1)

  return end.toISOString()
}

export async function applyHostivSubscriptionPaymentToAccount(
  userId: string,
  plan: HostivSubscriptionPlan,
  now = new Date()
) {
  const normalizedPlan = normalizeHostivSubscriptionPlan(plan)
  const supabase = requireSupabaseAdmin()

  const { data: account, error: readError } = await supabase
    .from("hostiv_accounts")
    .select("paid_until, subscription_started_at")
    .eq("id", userId)
    .maybeSingle()

  if (readError) {
    console.error("[hostiv-subscription-payment] read account:", readError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’activer votre forfait."
    })
  }

  const paidUntil = computePaidUntilAfterAnnualPayment(
    typeof account?.paid_until === "string" ? account.paid_until : null,
    now
  )

  const subscriptionStartedAt =
    typeof account?.subscription_started_at === "string" && account.subscription_started_at.trim()
      ? account.subscription_started_at
      : now.toISOString()

  const { error: updateError } = await supabase.from("hostiv_accounts").upsert(
    {
      id: userId,
      subscription_plan: normalizedPlan,
      paid_until: paidUntil,
      subscription_started_at: subscriptionStartedAt,
      subscription_reminders_sent: emptySubscriptionRemindersSent(paidUntil)
    },
    { onConflict: "id" }
  )

  if (updateError) {
    console.error("[hostiv-subscription-payment] upsert account:", updateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer votre forfait."
    })
  }

  return {
    paid_until: paidUntil,
    subscription_plan: normalizedPlan,
    subscription_started_at: subscriptionStartedAt
  }
}
