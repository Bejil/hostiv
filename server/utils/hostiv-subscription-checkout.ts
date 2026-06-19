import type Stripe from "stripe"
import { normalizeHostivSubscriptionPlan, type HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import {
  hostivPlanCheckoutDescription,
  hostivPlanCheckoutLabel,
  hostivPlanPriceCents
} from "../../app/utils/hostiv-subscription-pricing"
import { applyHostivSubscriptionPaymentToAccount } from "./hostiv-subscription-payment"
import { applyHostivSubscriptionPaymentToProperty } from "./hostiv-property-subscription"
import { recordHostivStripeCheckoutPayment } from "./hostiv-stripe-payment-record"
import { buildHostivCheckoutUnitAmount, mergeCheckoutMetadata } from "./hostiv-checkout-pricing"
import { createHostivFreeCheckoutResult, isHostivFreeCheckoutSessionId } from "./hostiv-free-checkout"
import { getPropertySubscriptionBySlug } from "./hostiv-property-subscription"
import { getHostivStripePaymentBySessionId } from "./hostiv-stripe-payment-record"
import { getStripeClient } from "./stripe-client"
import {
  getUserEmailById,
  sendHostivPlanPurchasedEmail,
  sendPlatformPlanPaymentAlert
} from "./transactional-email"

export const HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE = "hostiv_subscription"

type CreateHostivSubscriptionCheckoutInput = {
  stripeSecretKey: string
  userId: string
  email: string
  plan: HostivSubscriptionPlan
  propertySlug: string
  siteBaseUrl: string
  promoCode?: string | null
}

export async function createHostivSubscriptionCheckoutSession(input: CreateHostivSubscriptionCheckoutInput) {
  const siteBase = input.siteBaseUrl.trim()

  if (!siteBase) {
    throw createError({
      statusCode: 503,
      message: "URL du site non configurée (NUXT_PUBLIC_SITE_URL)."
    })
  }

  const slug = input.propertySlug.trim().toLowerCase()
  const plan = normalizeHostivSubscriptionPlan(input.plan)
  const stripe = getStripeClient(input.stripeSecretKey)
  const originalAmountCents = hostivPlanPriceCents(plan)
  const { unitAmountCents, promo } = await buildHostivCheckoutUnitAmount({
    promoCode: input.promoCode,
    email: input.email,
    originalAmountCents
  })

  const successUrl = `${siteBase}/${encodeURIComponent(slug)}/admin?subscription=success&session_id={CHECKOUT_SESSION_ID}`

  if (unitAmountCents === 0 && promo) {
    return createHostivFreeCheckoutResult({
      checkoutType: HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE,
      referenceId: `${input.userId}_${Date.now()}`,
      baseMetadata: {
        user_id: input.userId,
        subscription_plan: plan,
        property_slug: slug
      },
      promo,
      customerEmail: input.email,
      clientReferenceId: input.userId,
      successUrl,
      fulfill: async (session) => {
        await fulfillHostivSubscriptionCheckoutFromSession(session, input.userId)
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
            name: hostivPlanCheckoutLabel(plan),
            description: hostivPlanCheckoutDescription(plan)
          }
        }
      }
    ],
    metadata: mergeCheckoutMetadata(
      {
        hostiv_checkout: HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE,
        user_id: input.userId,
        subscription_plan: plan,
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

function isHostivSubscriptionCheckoutSession(session: Stripe.Checkout.Session) {
  return session.metadata?.hostiv_checkout === HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE
}

export async function fulfillHostivSubscriptionCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  expectedUserId?: string
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return fulfillHostivSubscriptionCheckoutFromSession(session, expectedUserId)
}

export async function fulfillHostivSubscriptionCheckoutFromSession(
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
        subscription_plan: existing.subscription_plan
      }
    }
  }

  if (!isHostivSubscriptionCheckoutSession(session)) {
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

  const plan = normalizeHostivSubscriptionPlan(session.metadata?.subscription_plan)
  const propertySlug = String(session.metadata?.property_slug || "").trim().toLowerCase()

  if (!propertySlug) {
    throw createError({
      statusCode: 400,
      message: "Logement introuvable pour ce paiement."
    })
  }

  const payment = await applyHostivSubscriptionPaymentToProperty(propertySlug, plan, userId)
  await applyHostivSubscriptionPaymentToAccount(userId, plan)

  const ownerEmail =
    String(session.customer_email || "").trim() || (await getUserEmailById(userId))

  if (ownerEmail && propertySlug) {
    void sendHostivPlanPurchasedEmail({
      to: ownerEmail,
      slug: propertySlug,
      plan: payment.subscription_plan
    })

    void sendPlatformPlanPaymentAlert({
      email: ownerEmail,
      slug: propertySlug,
      planLabel: hostivPlanCheckoutLabel(payment.subscription_plan),
      paidUntil: payment.paid_until
    })
  }

  await recordHostivStripeCheckoutPayment(session, "hostiv_subscription", {
    userId,
    memberEmail: ownerEmail,
    propertySlug,
    subscriptionPlan: payment.subscription_plan
  })

  return {
    fulfilled: true as const,
    session,
    paid_until: payment.paid_until,
    subscription_plan: payment.subscription_plan
  }
}
