import { getBearerUser } from "../../../utils/hostiv-auth"
import { fulfillHostivStripeCheckoutSession } from "../../../utils/hostiv-checkout-fulfillment"
import { getSubscriptionAccessForOwner } from "../../../utils/hostiv-subscription"
import { getStripeClient } from "../../../utils/stripe-client"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()
  const sessionId = String(getQuery(event).session_id || "").trim()

  if (!stripeSecretKey) {
    throw createError({
      statusCode: 503,
      message: "Paiement non configuré."
    })
  }

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: "Session de paiement manquante."
    })
  }

  const user = await getBearerUser(event)
  const stripe = getStripeClient(stripeSecretKey)
  const result = await fulfillHostivStripeCheckoutSession(stripe, sessionId, {
    expectedUserId: user.id
  })
  const propertySlug = String(getQuery(event).property_slug || result.session.metadata?.property_slug || "")
    .trim()
    .toLowerCase()

  const subscription_access = propertySlug
    ? await getSubscriptionAccessForOwner(user.id, propertySlug)
    : null

  return {
    ok: true,
    fulfilled: result.fulfilled,
    paid_until:
      result.fulfilled && "paid_until" in result ? result.paid_until : null,
    subscription_plan:
      result.fulfilled && "subscription_plan" in result ? result.subscription_plan : null,
    premium_tools_until:
      result.fulfilled && "premium_tools_until" in result ? result.premium_tools_until : null,
    premium_tools_started_at:
      result.fulfilled && "premium_tools_started_at" in result
        ? result.premium_tools_started_at
        : null,
    subscription_access
  }
})
