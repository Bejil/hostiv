import type Stripe from "stripe"
import { fulfillHostivPremiumToolsCheckoutSession } from "./hostiv-premium-tools-checkout"
import { fulfillHostivSignupCheckoutSession } from "./hostiv-signup-checkout"
import { fulfillHostivSubscriptionCheckoutSession } from "./hostiv-subscription-checkout"
import { HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE } from "./hostiv-signup-checkout"
import { HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE } from "./hostiv-premium-tools-checkout"
import { HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE } from "./hostiv-subscription-checkout"
import { resolveHostivSignupEncryptionSecret } from "./hostiv-pending-signup-crypto"

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

export async function fulfillHostivStripeCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  options?: { expectedUserId?: string; encryptionSecret?: string; requestOrigin?: string }
) {
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

  throw createError({
    statusCode: 400,
    message: "Session de paiement Hostiv non reconnue."
  })
}
