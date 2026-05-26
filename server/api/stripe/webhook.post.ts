import { getStripeClient } from "../../utils/stripe-client"
import { syncStripeAccountById } from "../../utils/stripe-connect"

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

  return { received: true }
})
