import type Stripe from "stripe"
import { hostivPricing } from "../../app/data/hostivLanding"
import type { HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { hostivPlanCheckoutLabel } from "../../app/utils/hostiv-subscription-pricing"
import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { requireSupabaseAdmin } from "./supabase"

export type HostivStripePaymentCheckoutType =
  | "hostiv_signup"
  | "hostiv_subscription"
  | "hostiv_premium_tools"

type RecordHostivStripeCheckoutPaymentContext = {
  userId?: string | null
  memberEmail?: string | null
  propertySlug?: string | null
  subscriptionPlan?: string | null
}

function resolveProductLabel(
  checkoutType: HostivStripePaymentCheckoutType,
  subscriptionPlan: HostivSubscriptionPlan | null
) {
  if (checkoutType === "hostiv_premium_tools") {
    return `Hostiv ${hostivPricing.premiumAddon.name}`
  }

  if (subscriptionPlan) {
    return hostivPlanCheckoutLabel(subscriptionPlan)
  }

  return "Hostiv"
}

export async function recordHostivStripeCheckoutPayment(
  session: Stripe.Checkout.Session,
  checkoutType: HostivStripePaymentCheckoutType,
  context: RecordHostivStripeCheckoutPaymentContext = {}
) {
  if (session.payment_status !== "paid") {
    return { recorded: false as const }
  }

  const sessionId = session.id?.trim()

  if (!sessionId) {
    return { recorded: false as const }
  }

  const amountCents = session.amount_total ?? 0

  if (amountCents <= 0) {
    return { recorded: false as const }
  }

  const userId =
    context.userId?.trim() ||
    String(session.metadata?.user_id || session.client_reference_id || "").trim() ||
    null

  const memberEmail =
    context.memberEmail?.trim().toLowerCase() ||
    String(session.customer_email || session.customer_details?.email || "")
      .trim()
      .toLowerCase() ||
    null

  const propertySlug =
    context.propertySlug?.trim().toLowerCase() ||
    String(session.metadata?.property_slug || "").trim().toLowerCase() ||
    null

  const subscriptionPlan =
    checkoutType === "hostiv_premium_tools"
      ? null
      : normalizeHostivSubscriptionPlan(
          context.subscriptionPlan || session.metadata?.subscription_plan
        )

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const paidAt = session.created
    ? new Date(session.created * 1000).toISOString()
    : new Date().toISOString()

  const supabase = requireSupabaseAdmin()

  const { error } = await supabase.from("hostiv_stripe_payments").upsert(
    {
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      user_id: userId,
      member_email: memberEmail,
      property_slug: propertySlug || null,
      checkout_type: checkoutType,
      subscription_plan: subscriptionPlan,
      product_label: resolveProductLabel(checkoutType, subscriptionPlan),
      amount_cents: amountCents,
      currency: (session.currency || "eur").toLowerCase(),
      payment_status: "paid",
      paid_at: paidAt
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true }
  )

  if (error) {
    console.error("[hostiv-stripe-payment] record:", error.message)
    return { recorded: false as const }
  }

  return { recorded: true as const }
}
