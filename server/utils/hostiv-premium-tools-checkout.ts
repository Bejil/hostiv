import type Stripe from "stripe"
import { hostivPricing } from "../../app/data/hostivLanding"
import { applyHostivPremiumToolsPayment } from "./hostiv-premium-tools-payment"
import { recordHostivStripeCheckoutPayment } from "./hostiv-stripe-payment-record"
import { buildHostivCheckoutUnitAmount, mergeCheckoutMetadata } from "./hostiv-checkout-pricing"
import { createHostivFreeCheckoutResult, isHostivFreeCheckoutSessionId } from "./hostiv-free-checkout"
import { getPropertySubscriptionBySlug } from "./hostiv-property-subscription"
import { getHostivStripePaymentBySessionId } from "./hostiv-stripe-payment-record"
import { getStripeClient } from "./stripe-client"
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
  promoCode?: string | null
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
  const originalAmountCents = Math.round(premiumAddon.price * 100)
  const { unitAmountCents, promo } = await buildHostivCheckoutUnitAmount({
    promoCode: input.promoCode,
    email: input.email,
    originalAmountCents
  })

  const successUrl = `${siteBase}/${encodeURIComponent(slug)}/admin?subscription=success&session_id={CHECKOUT_SESSION_ID}`

  if (unitAmountCents === 0 && promo) {
    return createHostivFreeCheckoutResult({
      checkoutType: HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE,
      referenceId: `${input.userId}_${Date.now()}`,
      baseMetadata: {
        user_id: input.userId,
        property_slug: slug
      },
      promo,
      customerEmail: input.email,
      clientReferenceId: input.userId,
      successUrl,
      fulfill: async (session) => {
        await fulfillHostivPremiumToolsCheckoutFromSession(session, input.userId)
      }
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email.trim() || undefined,
    client_reference_id: input.userId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: unitAmountCents,
          product_data: {
            name: `Hostiv ${premiumAddon.name}`,
            description: `${premiumAddon.tagline} Paiement annuel unique, sans reconduction automatique.`
          }
        }
      }
    ],
    metadata: mergeCheckoutMetadata(
      {
        hostiv_checkout: HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE,
        user_id: input.userId,
        property_slug: slug
      },
      promo
    ),
    success_url: successUrl,
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

  return fulfillHostivPremiumToolsCheckoutFromSession(session, expectedUserId)
}

export async function fulfillHostivPremiumToolsCheckoutFromSession(
  session: Stripe.Checkout.Session,
  expectedUserId?: string
) {
  const sessionId = session.id?.trim()

  if (sessionId && isHostivFreeCheckoutSessionId(sessionId)) {
    const existing = await getHostivStripePaymentBySessionId(sessionId)

    if (existing) {
      const propertySubscription = existing.property_slug
        ? await getPropertySubscriptionBySlug(existing.property_slug)
        : null

      return {
        fulfilled: true as const,
        session,
        paid_until: propertySubscription?.paid_until ?? null,
        premium_tools_until: propertySubscription?.premium_tools_until ?? null,
        premium_tools_started_at: propertySubscription?.premium_tools_started_at ?? null
      }
    }
  }

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

  const propertySlug = String(session.metadata?.property_slug || "").trim().toLowerCase()

  if (!propertySlug) {
    throw createError({
      statusCode: 400,
      message: "Site introuvable pour ce paiement."
    })
  }

  const payment = await applyHostivPremiumToolsPayment(userId, propertySlug)
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

  await recordHostivStripeCheckoutPayment(session, "hostiv_premium_tools", {
    userId,
    memberEmail: ownerEmail,
    propertySlug
  })

  return {
    fulfilled: true as const,
    session,
    paid_until: payment.paid_until,
    premium_tools_until: payment.premium_tools_until,
    premium_tools_started_at: payment.premium_tools_started_at
  }
}
