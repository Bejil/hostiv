import type { HostivSubscriptionPlan } from "../utils/hostiv-subscription-plan"
import type { HostivSubscriptionAccess } from "../utils/hostiv-subscription-access"

export type HostivAccountPropertySubscription = {
  slug: string
  brand_name: string
  published: boolean
  access: HostivSubscriptionAccess
}

export type HostivAccountPaymentCheckoutType =
  | "hostiv_signup"
  | "hostiv_subscription"
  | "hostiv_premium_tools"

export type HostivAccountPaymentRecord = {
  id: string
  paid_at: string
  checkout_type: HostivAccountPaymentCheckoutType
  product_label: string
  subscription_plan: HostivSubscriptionPlan | null
  property_slug: string | null
  amount_eur: number
  currency: string
}

export type HostivAccountSubscriptionsPayload = {
  properties: HostivAccountPropertySubscription[]
  payments: HostivAccountPaymentRecord[]
  is_platform_admin: boolean
}
