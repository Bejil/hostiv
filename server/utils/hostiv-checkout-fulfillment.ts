import type Stripe from "stripe"
import { fulfillHostivSignupCheckoutSession } from "./hostiv-signup-checkout"
import { fulfillHostivPremiumToolsCheckoutSession } from "./hostiv-premium-tools-checkout"
import { fulfillHostivSubscriptionCheckoutSession } from "./hostiv-subscription-checkout"
import { HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE } from "./hostiv-signup-checkout"
import { HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE } from "./hostiv-premium-tools-checkout"
import { HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE } from "./hostiv-subscription-checkout"
import { resolveHostivSignupEncryptionSecret } from "./hostiv-pending-signup-crypto"

export async function fulfillHostivStripeCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  options: {
    expectedUserId?: string
    encryptionSecret?: string
  } = {}
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const checkoutType = session.metadata?.hostiv_checkout

  if (checkoutType === HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE) {
    const secret =
      options.encryptionSecret ||
      resolveHostivSignupEncryptionSecret({
        hostivSignupEncryptionKey: process.env.HOSTIV_SIGNUP_ENCRYPTION_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      })

    return fulfillHostivSignupCheckoutSession(stripe, sessionId, secret)
  }

  if (checkoutType === HOSTIV_SUBSCRIPTION_CHECKOUT_METADATA_TYPE) {
    return fulfillHostivSubscriptionCheckoutSession(stripe, sessionId, options.expectedUserId)
  }

  if (checkoutType === HOSTIV_PREMIUM_TOOLS_CHECKOUT_METADATA_TYPE) {
    return fulfillHostivPremiumToolsCheckoutSession(stripe, sessionId, options.expectedUserId)
  }

  throw createError({
    statusCode: 400,
    message: "Session de paiement Hostiv non reconnue."
  })
}
