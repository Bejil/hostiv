import { fulfillHostivStripeCheckoutSession } from "../../../utils/hostiv-checkout-fulfillment"
import { getStripeClient } from "../../../utils/stripe-client"
import { resolveHostivSignupEncryptionSecret } from "../../../utils/hostiv-pending-signup-crypto"

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

  const encryptionSecret = resolveHostivSignupEncryptionSecret({
    hostivSignupEncryptionKey: String(config.hostivSignupEncryptionKey || ""),
    supabaseServiceRoleKey: String(config.supabaseServiceRoleKey || "")
  })

  const stripe = getStripeClient(stripeSecretKey)
  const result = await fulfillHostivStripeCheckoutSession(stripe, sessionId, {
    encryptionSecret,
    requestOrigin: getRequestURL(event).origin
  })

  if (!("slug" in result) || !result.fulfilled) {
    return {
      ok: true,
      fulfilled: false,
      slug: null,
      email: null
    }
  }

  return {
    ok: true,
    fulfilled: true,
    slug: result.slug,
    email: result.email,
    email_verification_required:
      "email_verification_required" in result ? Boolean(result.email_verification_required) : true,
    already_completed: "already_completed" in result ? result.already_completed : false
  }
})
