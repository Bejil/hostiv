import type { HostivPricingPlanId } from "../data/hostivLanding"
import { saveHostivSignupLoginCredentials } from "../utils/hostiv-signup-session"

export type HostivSignupCheckoutPayload = {
  full_name: string
  email: string
  password: string
  property_name: string
  property_slug: string
  subscription_plan: HostivPricingPlanId
}

export async function startHostivSignupCheckout(payload: HostivSignupCheckoutPayload) {
  saveHostivSignupLoginCredentials({
    email: payload.email,
    password: payload.password
  })

  const response = await $fetch<{ url: string }>("/api/hostiv/signup-checkout", {
    method: "POST",
    body: payload
  })

  if (!response.url) {
    throw new Error("Impossible d’ouvrir la page de paiement.")
  }

  window.location.assign(response.url)
}

export async function startHostivSubscriptionCheckout(
  accessToken: string,
  plan: HostivPricingPlanId,
  propertySlug: string
) {
  const response = await $fetch<{ url: string }>("/api/hostiv/subscription-checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: {
      subscription_plan: plan,
      property_slug: propertySlug
    }
  })

  if (!response.url) {
    throw new Error("Impossible d’ouvrir la page de paiement.")
  }

  window.location.assign(response.url)
}

export async function startHostivPremiumToolsCheckout(accessToken: string, propertySlug: string) {
  const response = await $fetch<{ url: string }>("/api/hostiv/premium-tools-checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: {
      property_slug: propertySlug
    }
  })

  if (!response.url) {
    throw new Error("Impossible d’ouvrir la page de paiement.")
  }

  window.location.assign(response.url)
}

export async function verifyHostivSubscriptionCheckout(
  accessToken: string,
  sessionId: string,
  propertySlug: string
) {
  return $fetch<{
    ok: boolean
    fulfilled: boolean
    paid_until?: string | null
    subscription_plan?: string | null
    premium_tools_until?: string | null
    subscription_access: { active: boolean; paid_until: string | null; has_premium_tools?: boolean } | null
  }>("/api/hostiv/subscription-checkout/verify", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    query: {
      session_id: sessionId,
      property_slug: propertySlug
    }
  })
}

export async function verifyHostivSignupCheckout(sessionId: string) {
  return $fetch<{
    ok: boolean
    fulfilled: boolean
    slug: string | null
    email: string | null
    already_completed?: boolean
  }>("/api/hostiv/signup-checkout/verify", {
    query: { session_id: sessionId }
  })
}
