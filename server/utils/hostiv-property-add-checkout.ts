import type Stripe from "stripe"
import { validatePropertySlugFormat } from "../../app/utils/property-slug"
import { normalizeHostivSubscriptionPlan, type HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import {
  hostivPlanCheckoutDescription,
  hostivPlanCheckoutLabel,
  hostivPlanPriceCents
} from "../../app/utils/hostiv-subscription-pricing"
import { provisionPropertyForUser } from "./hostiv-provision-property"
import { applyHostivSubscriptionPaymentToProperty } from "./hostiv-property-subscription"
import { applyHostivSubscriptionPaymentToAccount } from "./hostiv-subscription-payment"
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

export const HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE = "hostiv_property_add"

type CreateHostivPropertyAddCheckoutInput = {
  stripeSecretKey: string
  userId: string
  email: string
  propertyName: string
  propertySlug: string
  plan: HostivSubscriptionPlan
  siteBaseUrl: string
  returnSlug?: string
  promoCode?: string | null
}

export async function createHostivPropertyAddCheckoutSession(
  input: CreateHostivPropertyAddCheckoutInput
) {
  const validity = validatePropertySlugFormat(input.propertySlug)

  if (!validity.valid) {
    throw createError({ statusCode: 400, message: "Adresse du site invalide." })
  }

  const slug = validity.slug
  const siteBase = input.siteBaseUrl.trim()

  if (!siteBase) {
    throw createError({
      statusCode: 503,
      message: "URL du site non configurée (NUXT_PUBLIC_SITE_URL)."
    })
  }

  const plan = normalizeHostivSubscriptionPlan(input.plan)
  const stripe = getStripeClient(input.stripeSecretKey)
  const returnSlug = (input.returnSlug || "").trim().toLowerCase()
  const originalAmountCents = hostivPlanPriceCents(plan)
  const { unitAmountCents, promo } = await buildHostivCheckoutUnitAmount({
    promoCode: input.promoCode,
    email: input.email,
    originalAmountCents
  })

  if (!returnSlug) {
    throw createError({
      statusCode: 400,
      message: "Slug de retour manquant."
    })
  }

  const successUrl = `${siteBase}/${encodeURIComponent(returnSlug)}/admin?property_add=success&session_id={CHECKOUT_SESSION_ID}`

  if (unitAmountCents === 0 && promo) {
    const result = await createHostivFreeCheckoutResult({
      checkoutType: HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE,
      referenceId: `${input.userId}_${Date.now()}`,
      baseMetadata: {
        user_id: input.userId,
        subscription_plan: plan,
        property_slug: slug,
        property_name: input.propertyName.trim()
      },
      promo,
      customerEmail: input.email,
      clientReferenceId: input.userId,
      successUrl,
      fulfill: async (session) => {
        await fulfillHostivPropertyAddCheckoutFromSession(session, input.userId)
      }
    })

    return { ...result, slug }
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
            name: `${hostivPlanCheckoutLabel(plan)} — nouveau logement`,
            description: hostivPlanCheckoutDescription(plan)
          }
        }
      }
    ],
    metadata: mergeCheckoutMetadata(
      {
        hostiv_checkout: HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE,
        user_id: input.userId,
        subscription_plan: plan,
        property_slug: slug,
        property_name: input.propertyName.trim()
      },
      promo
    ),
    success_url: successUrl,
    cancel_url: `${siteBase}/${encodeURIComponent(returnSlug)}/admin?property_add=cancelled`
  })

  if (!session.url) {
    throw createError({
      statusCode: 502,
      message: "Impossible d’ouvrir la page de paiement Stripe."
    })
  }

  return { url: session.url, sessionId: session.id, slug }
}

function isHostivPropertyAddCheckoutSession(session: Stripe.Checkout.Session) {
  return session.metadata?.hostiv_checkout === HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE
}

export async function fulfillHostivPropertyAddCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  expectedUserId?: string
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return fulfillHostivPropertyAddCheckoutFromSession(session, expectedUserId)
}

export async function fulfillHostivPropertyAddCheckoutFromSession(
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
        slug: existing.property_slug,
        paid_until: propertySubscription?.paid_until ?? null,
        subscription_plan: existing.subscription_plan
      }
    }
  }

  if (!isHostivPropertyAddCheckoutSession(session)) {
    throw createError({
      statusCode: 400,
      message: "Session de paiement invalide."
    })
  }

  if (session.payment_status !== "paid") {
    return { fulfilled: false as const, session, slug: null as string | null }
  }

  const userId = String(session.metadata?.user_id || session.client_reference_id || "").trim()
  const propertySlug = String(session.metadata?.property_slug || "").trim().toLowerCase()
  const propertyName = String(session.metadata?.property_name || "").trim()

  if (!userId || !propertySlug || !propertyName) {
    throw createError({
      statusCode: 400,
      message: "Données de paiement incomplètes."
    })
  }

  if (expectedUserId && userId !== expectedUserId) {
    throw createError({
      statusCode: 403,
      message: "Ce paiement ne correspond pas à votre compte."
    })
  }

  const plan = normalizeHostivSubscriptionPlan(session.metadata?.subscription_plan)

  await provisionPropertyForUser({
    userId,
    propertyName,
    propertySlug,
    subscriptionPlan: plan,
    notifyEmail: session.customer_email ?? null
  })

  const payment = await applyHostivSubscriptionPaymentToProperty(propertySlug, plan, userId)
  await applyHostivSubscriptionPaymentToAccount(userId, plan)

  const ownerEmail =
    String(session.customer_email || "").trim() || (await getUserEmailById(userId))

  if (ownerEmail) {
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
    slug: propertySlug,
    paid_until: payment.paid_until,
    subscription_plan: payment.subscription_plan
  }
}
