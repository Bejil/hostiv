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
  const isFreeCheckout = session.metadata?.hostiv_free_checkout === "true"

  if (amountCents <= 0 && !isFreeCheckout) {
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

  const promoCode =
    typeof session.metadata?.promo_code === "string" && session.metadata.promo_code.trim()
      ? session.metadata.promo_code.trim().toUpperCase()
      : null
  const promoCodeId =
    typeof session.metadata?.promo_code_id === "string" && session.metadata.promo_code_id.trim()
      ? session.metadata.promo_code_id.trim()
      : null
  const amountSubtotalCents = Number(session.metadata?.amount_subtotal_cents || 0) || null
  const discountCents = Number(session.metadata?.discount_cents || 0) || null

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
      amount_subtotal_cents: amountSubtotalCents,
      discount_cents: discountCents,
      promo_code: promoCode,
      promo_code_id: promoCodeId,
      currency: (session.currency || "eur").toLowerCase(),
      payment_status: "paid",
      paid_at: paidAt
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true }
  )

  if (error) {
    console.error(
      "[hostiv-stripe-payment] record:",
      error.message,
      isFreeCheckout ? "(free checkout)" : ""
    )
    return { recorded: false as const }
  }

  return { recorded: true as const }
}

export async function getHostivStripePaymentBySessionId(sessionId: string) {
  const normalizedSessionId = sessionId.trim()

  if (!normalizedSessionId) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_stripe_payments")
    .select(
      "stripe_checkout_session_id, user_id, member_email, property_slug, checkout_type, subscription_plan, amount_cents, paid_at"
    )
    .eq("stripe_checkout_session_id", normalizedSessionId)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-stripe-payment] read:", error.message)

    return null
  }

  if (!data) {
    return null
  }

  return data
}
