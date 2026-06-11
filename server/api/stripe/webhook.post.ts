import { fulfillHostivStripeCheckoutSession } from "../../utils/hostiv-checkout-fulfillment"
import { resolveHostivSignupEncryptionSecret } from "../../utils/hostiv-pending-signup-crypto"
import { getStripeClient } from "../../utils/stripe-client"
import { syncStripeAccountById } from "../../utils/stripe-connect"
import { handleStripeDisputeCreated } from "../../utils/stripe-dispute-email"
import {
  sendGuestPaymentFailedEmailFromStripeMetadata,
  sendPlatformCheckoutFulfillmentAlert
} from "../../utils/transactional-email"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripeSecretKey = String(config.stripeSecretKey || "").trim()
  const webhookSecret = String(config.stripeWebhookSecret || "").trim()

  if (!stripeSecretKey || !webhookSecret) {
    throw createError({
      statusCode: 503,
      message: "Webhook Stripe non configuré."
    })
  }

  const signature = getHeader(event, "stripe-signature")

  if (!signature) {
    throw createError({ statusCode: 400, message: "Signature Stripe manquante." })
  }

  const rawBody = await readRawBody(event)

  if (!rawBody) {
    throw createError({ statusCode: 400, message: "Corps de requête vide." })
  }

  const stripe = getStripeClient(stripeSecretKey)
  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Signature invalide."

    throw createError({ statusCode: 400, message: detail })
  }

  if (stripeEvent.type === "account.updated") {
    const account = stripeEvent.data.object

    if (account.object === "account" && typeof account.id === "string") {
      await syncStripeAccountById(stripe, account.id)
    }
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object

    if (session.object === "checkout.session" && typeof session.id === "string") {
      try {
        const config = useRuntimeConfig()

        await fulfillHostivStripeCheckoutSession(stripe, session.id, {
          encryptionSecret: resolveHostivSignupEncryptionSecret({
            hostivSignupEncryptionKey: String(config.hostivSignupEncryptionKey || ""),
            supabaseServiceRoleKey: String(config.supabaseServiceRoleKey || "")
          })
        })
      } catch (error) {
        console.error("[stripe-webhook] hostiv checkout:", error)

        void sendPlatformCheckoutFulfillmentAlert({
          sessionId: session.id,
          checkoutType: session.metadata?.hostiv_checkout,
          errorMessage: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  if (stripeEvent.type === "charge.dispute.created") {
    const dispute = stripeEvent.data.object

    if (dispute.object === "dispute") {
      void handleStripeDisputeCreated(stripe, dispute)
    }
  }

  if (stripeEvent.type === "payment_intent.payment_failed") {
    const paymentIntent = stripeEvent.data.object

    if (paymentIntent.object === "payment_intent" && paymentIntent.metadata) {
      const metadata = Object.fromEntries(
        Object.entries(paymentIntent.metadata).map(([key, value]) => [key, String(value)])
      )

      void sendGuestPaymentFailedEmailFromStripeMetadata(metadata)
    }
  }

  return { received: true }
})
