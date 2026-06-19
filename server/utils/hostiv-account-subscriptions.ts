import type {
  HostivAccountPaymentRecord,
  HostivAccountSubscriptionsPayload
} from "../../app/types/hostiv-account-subscriptions"
import {
  listOwnerPropertySubscriptionsWithAccess
} from "./hostiv-property-subscription"
import { requireSupabaseAdmin } from "./supabase"

function mapPaymentRow(row: Record<string, unknown>): HostivAccountPaymentRecord {
  const checkoutType = String(row.checkout_type || "hostiv_subscription")

  return {
    id: String(row.id),
    paid_at: String(row.paid_at),
    checkout_type:
      checkoutType === "hostiv_signup" ||
      checkoutType === "hostiv_subscription" ||
      checkoutType === "hostiv_premium_tools"
        ? checkoutType
        : "hostiv_subscription",
    product_label: String(row.product_label || "Hostiv"),
    subscription_plan:
      row.subscription_plan === "starter" || row.subscription_plan === "pro"
        ? row.subscription_plan
        : null,
    property_slug:
      typeof row.property_slug === "string" && row.property_slug.trim()
        ? row.property_slug.trim().toLowerCase()
        : null,
    amount_eur: Math.round(Number(row.amount_cents || 0)) / 100,
    currency: String(row.currency || "eur").toLowerCase()
  }
}

export async function getHostivAccountSubscriptionsPayload(
  ownerUserId: string
): Promise<HostivAccountSubscriptionsPayload> {
  const { properties, is_platform_admin } =
    await listOwnerPropertySubscriptionsWithAccess(ownerUserId)

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_stripe_payments")
    .select(
      "id, paid_at, checkout_type, product_label, subscription_plan, property_slug, amount_cents, currency"
    )
    .eq("user_id", ownerUserId)
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[hostiv-account-subscriptions] payments:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger l’historique des paiements."
    })
  }

  return {
    properties,
    payments: (data ?? []).map((row) => mapPaymentRow(row as Record<string, unknown>)),
    is_platform_admin
  }
}
