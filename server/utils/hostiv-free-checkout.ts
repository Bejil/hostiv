import type Stripe from "stripe"
import type { validateHostivPromoCode } from "./hostiv-promo-code"
import { promoCodeSessionMetadata } from "./hostiv-promo-code"

export const HOSTIV_FREE_CHECKOUT_SESSION_PREFIX = "hostiv_free_"

export function isHostivFreeCheckoutSessionId(sessionId: string) {
  return sessionId.trim().startsWith(HOSTIV_FREE_CHECKOUT_SESSION_PREFIX)
}

export function parseHostivFreeCheckoutTypeFromSessionId(sessionId: string) {
  if (!isHostivFreeCheckoutSessionId(sessionId)) {
    return null
  }

  const remainder = sessionId.slice(HOSTIV_FREE_CHECKOUT_SESSION_PREFIX.length)
  const knownTypes = [
    "hostiv_property_add",
    "hostiv_premium_tools",
    "hostiv_subscription",
    "hostiv_signup"
  ]

  for (const checkoutType of knownTypes) {
    if (remainder.startsWith(`${checkoutType}_`)) {
      return checkoutType
    }
  }

  return null
}

export function buildHostivFreeCheckoutSessionId(checkoutType: string, referenceId: string) {
  const safeType = checkoutType.trim().replace(/[^a-z0-9_]/gi, "_")
  const safeReference = referenceId.trim().replace(/[^a-z0-9_-]/gi, "_")

  return `${HOSTIV_FREE_CHECKOUT_SESSION_PREFIX}${safeType}_${safeReference}`
}

type HostivPromoValidation = Awaited<ReturnType<typeof validateHostivPromoCode>>

export function buildHostivFreeCheckoutSession(input: {
  sessionId: string
  checkoutType: string
  baseMetadata: Record<string, string>
  promo: HostivPromoValidation
  customerEmail?: string | null
  clientReferenceId?: string | null
  successUrl?: string | null
}): Stripe.Checkout.Session {
  const created = Math.floor(Date.now() / 1000)

  return {
    id: input.sessionId,
    object: "checkout.session",
    payment_status: "paid",
    amount_total: 0,
    currency: "eur",
    created,
    customer_email: input.customerEmail?.trim() || null,
    client_reference_id: input.clientReferenceId?.trim() || null,
    success_url: input.successUrl?.trim() || null,
    metadata: {
      hostiv_checkout: input.checkoutType,
      hostiv_free_checkout: "true",
      ...input.baseMetadata,
      ...promoCodeSessionMetadata(input.promo)
    }
  } as Stripe.Checkout.Session
}

export async function createHostivFreeCheckoutResult(input: {
  checkoutType: string
  referenceId: string
  baseMetadata: Record<string, string>
  promo: HostivPromoValidation
  customerEmail?: string | null
  clientReferenceId?: string | null
  successUrl: string
  fulfill: (session: Stripe.Checkout.Session) => Promise<unknown>
}) {
  const sessionId = buildHostivFreeCheckoutSessionId(input.checkoutType, input.referenceId)
  const session = buildHostivFreeCheckoutSession({
    sessionId,
    checkoutType: input.checkoutType,
    baseMetadata: input.baseMetadata,
    promo: input.promo,
    customerEmail: input.customerEmail,
    clientReferenceId: input.clientReferenceId,
    successUrl: input.successUrl
  })

  await input.fulfill(session)

  const url = input.successUrl.includes("{CHECKOUT_SESSION_ID}")
    ? input.successUrl.replace("{CHECKOUT_SESSION_ID}", encodeURIComponent(sessionId))
    : input.successUrl

  return { url, sessionId, free: true as const }
}
