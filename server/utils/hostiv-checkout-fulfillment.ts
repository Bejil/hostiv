import type Stripe from "stripe"
import { fulfillHostivPremiumToolsCheckoutSession } from "./hostiv-premium-tools-checkout"
import { fulfillHostivSignupCheckoutSession } from "./hostiv-signup-checkout"
import { fulfillHostivSubscriptionCheckoutSession } from "./hostiv-subscription-checkout"
import { HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE } from "./hostiv-signup-checkout"
import { HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE } from "./hostiv-subscription-checkout"
import { HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE } from "./hostiv-premium-tools-checkout"
import { fulfillHostivPropertyAddCheckoutSession } from "./hostiv-property-add-checkout"
import { HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE } from "./hostiv-property-add-checkout"
import { isHostivFreeCheckoutSessionId, parseHostivFreeCheckoutTypeFromSessionId } from "./hostiv-free-checkout"
import { getHostivStripePaymentBySessionId } from "./hostiv-stripe-payment-record"
import { getPropertySubscriptionBySlug } from "./hostiv-property-subscription"
import { resolveHostivSignupEncryptionSecret } from "./hostiv-pending-signup-crypto"
import { requireSupabaseAdmin } from "./supabase"

async function retrieveHostivCheckoutSession(stripe: Stripe, sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "StripeInvalidRequestError" &&
      "code" in error &&
      error.code === "resource_missing"
    ) {
      throw createError({
        statusCode: 400,
        message:
          "Session de paiement introuvable sur Stripe. Le paiement a peut-être été effectué sur un autre environnement (local vs production)."
      })
    }

    throw error
  }
}

async function resolveHostivFreeCheckoutSession(
  sessionId: string,
  options?: { expectedUserId?: string; encryptionSecret?: string; requestOrigin?: string }
) {
  const payment = await getHostivStripePaymentBySessionId(sessionId)

  if (payment?.user_id && options?.expectedUserId && payment.user_id !== options.expectedUserId) {
    throw createError({
      statusCode: 403,
      message: "Ce paiement ne correspond pas à votre compte."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: pendingSignup } = await supabase
    .from("hostiv_pending_signups")
    .select("status, user_id, property_slug, email, subscription_plan")
    .eq("stripe_session_id", sessionId)
    .maybeSingle()

  if (pendingSignup?.status === "completed" && pendingSignup.user_id) {
    const secret =
      options?.encryptionSecret ||
      resolveHostivSignupEncryptionSecret({
        hostivSignupEncryptionKey: process.env.HOSTIV_SIGNUP_ENCRYPTION_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      })

    const mockSession = {
      id: sessionId,
      object: "checkout.session",
      payment_status: "paid",
      metadata: {
        hostiv_checkout: HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE,
        hostiv_free_checkout: "true",
        property_slug: String(pendingSignup.property_slug || ""),
        subscription_plan: String(pendingSignup.subscription_plan || "pro")
      }
    } as Stripe.Checkout.Session

    return fulfillHostivSignupCheckoutSession(null as unknown as Stripe, mockSession, secret, {
      requestOrigin: options?.requestOrigin
    })
  }

  if (!payment) {
    throw createError({
      statusCode: 404,
      message: "Session de paiement introuvable."
    })
  }

  const checkoutType =
    parseHostivFreeCheckoutTypeFromSessionId(sessionId) ||
    String(payment.checkout_type || "")
  const mockSession = {
    id: sessionId,
    object: "checkout.session",
    payment_status: "paid",
    amount_total: Number(payment.amount_cents || 0),
    metadata: {
      hostiv_checkout: checkoutType,
      hostiv_free_checkout: "true",
      user_id: payment.user_id || "",
      property_slug: payment.property_slug || "",
      subscription_plan: payment.subscription_plan || ""
    },
    customer_email: payment.member_email || null,
    client_reference_id: payment.user_id || null
  } as Stripe.Checkout.Session

  if (checkoutType === HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE) {
    const propertySubscription = payment.property_slug
      ? await getPropertySubscriptionBySlug(payment.property_slug)
      : null

    return {
      fulfilled: true as const,
      session: mockSession,
      paid_until: propertySubscription?.paid_until ?? null,
      subscription_plan: payment.subscription_plan
    }
  }

  if (checkoutType === HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE) {
    const propertySubscription = payment.property_slug
      ? await getPropertySubscriptionBySlug(payment.property_slug)
      : null

    return {
      fulfilled: true as const,
      session: mockSession,
      paid_until: propertySubscription?.paid_until ?? null,
      premium_tools_until: propertySubscription?.premium_tools_until ?? null,
      premium_tools_started_at: propertySubscription?.premium_tools_started_at ?? null
    }
  }

  if (checkoutType === HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE) {
    const propertySubscription = payment.property_slug
      ? await getPropertySubscriptionBySlug(payment.property_slug)
      : null

    return {
      fulfilled: true as const,
      session: mockSession,
      slug: payment.property_slug,
      paid_until: propertySubscription?.paid_until ?? null,
      subscription_plan: payment.subscription_plan
    }
  }

  throw createError({
    statusCode: 400,
    message: "Session de paiement Hostiv non reconnue."
  })
}

export async function fulfillHostivStripeCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  options?: { expectedUserId?: string; encryptionSecret?: string; requestOrigin?: string }
) {
  if (isHostivFreeCheckoutSessionId(sessionId)) {
    return resolveHostivFreeCheckoutSession(sessionId, options)
  }

  const session = await retrieveHostivCheckoutSession(stripe, sessionId)
  const checkoutType = session.metadata?.hostiv_checkout

  if (checkoutType === HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE) {
    const secret =
      options?.encryptionSecret ||
      resolveHostivSignupEncryptionSecret({
        hostivSignupEncryptionKey: process.env.HOSTIV_SIGNUP_ENCRYPTION_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      })

    return fulfillHostivSignupCheckoutSession(stripe, session, secret, {
      requestOrigin: options?.requestOrigin
    })
  }

  if (checkoutType === HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE) {
    return fulfillHostivSubscriptionCheckoutSession(stripe, sessionId, options?.expectedUserId)
  }

  if (checkoutType === HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE) {
    return fulfillHostivPremiumToolsCheckoutSession(stripe, sessionId, options?.expectedUserId)
  }

  if (checkoutType === HOSTIV_PROPERTY_ADD_CHECKOUT_METADATA_TYPE) {
    return fulfillHostivPropertyAddCheckoutSession(stripe, sessionId, options?.expectedUserId)
  }

  throw createError({
    statusCode: 400,
    message: "Session de paiement Hostiv non reconnue."
  })
}
