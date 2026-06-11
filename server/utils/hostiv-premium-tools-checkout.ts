import type Stripe from "stripe"
import { hostivPricing } from "../../app/data/hostivLanding"
import { applyHostivPremiumToolsPaymentToAccount } from "./hostiv-premium-tools-payment"
import { getStripeClient } from "./stripe-client"
import { hostivPricing } from "../../app/data/hostivLanding"
import {
  getUserEmailById,
  sendHostivPremiumToolsPurchasedEmail,
  sendPlatformPlanPaymentAlert
} from "./transactional-email"

export const HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE = "hostiv_premium_tools"

const premiumAddon = hostivPricing.premiumAddon

type CreateHostivPremiumToolsCheckoutInput = {
  stripeSecretKey: string
  userId: string
  email: string
  propertySlug: string
  siteBaseUrl: string
}

export async function createHostivPremiumToolsCheckoutSession(
  input: CreateHostivPremiumToolsCheckoutInput
) {
  const siteBase = input.siteBaseUrl.trim()

  if (!siteBase) {
    throw createError({
      statusCode: 503,
      message: "URL du site non configurée (NUXT_PUBLIC_SITE_URL)."
    })
  }

  const slug = input.propertySlug.trim().toLowerCase()
  const stripe = getStripeClient(input.stripeSecretKey)
  const amountCents = Math.round(premiumAddon.price * 100)

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email.trim() || undefined,
    client_reference_id: input.userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: `Hostiv ${premiumAddon.name}`,
            description: `${premiumAddon.tagline} Paiement annuel unique, sans reconduction automatique.`
          }
        }
      }
    ],
    metadata: {
      hostiv_checkout: HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE,
      user_id: input.userId,
      property_slug: slug
    },
    success_url: `${siteBase}/${encodeURIComponent(slug)}/admin?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteBase}/${encodeURIComponent(slug)}/admin?subscription=cancelled`
  })

  if (!session.url) {
    throw createError({
      statusCode: 502,
      message: "Impossible d’ouvrir la page de paiement Stripe."
    })
  }

  return { url: session.url, sessionId: session.id }
}

function isHostivPremiumToolsCheckoutSession(session: Stripe.Checkout.Session) {
  return session.metadata?.hostiv_checkout === HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE
}

export async function fulfillHostivPremiumToolsCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  expectedUserId?: string
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (!isHostivPremiumToolsCheckoutSession(session)) {
    throw createError({
      statusCode: 400,
      message: "Session de paiement invalide."
    })
  }

  if (session.payment_status !== "paid") {
    return { fulfilled: false as const, session }
  }

  const userId = String(session.metadata?.user_id || session.client_reference_id || "").trim()

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "Compte Hostiv introuvable pour ce paiement."
    })
  }

  if (expectedUserId && userId !== expectedUserId) {
    throw createError({
      statusCode: 403,
      message: "Ce paiement ne correspond pas à votre compte."
    })
  }

  const payment = await applyHostivPremiumToolsPaymentToAccount(userId)
  const propertySlug = String(session.metadata?.property_slug || "").trim().toLowerCase()
  const ownerEmail =
    String(session.customer_email || "").trim() || (await getUserEmailById(userId))

  if (ownerEmail && propertySlug) {
    void sendHostivPremiumToolsPurchasedEmail({
      to: ownerEmail,
      slug: propertySlug
    })

    const premiumUntil = payment.premium_tools_until ?? payment.paid_until

    if (premiumUntil) {
      void sendPlatformPlanPaymentAlert({
        email: ownerEmail,
        slug: propertySlug,
        planLabel: `Hostiv ${hostivPricing.premiumAddon.name}`,
        paidUntil: premiumUntil
      })
    }
  }

  return {
    fulfilled: true as const,
    session,
    paid_until: payment.paid_until,
    premium_tools_until: payment.premium_tools_until,
    premium_tools_started_at: payment.premium_tools_started_at
  }
}
