import type { HostivPricingPlanId } from "../data/hostivLanding"

export type HostivSubscriptionPlan = HostivPricingPlanId

export function normalizeHostivSubscriptionPlan(value: unknown): HostivSubscriptionPlan {
  return value === "starter" ? "starter" : "pro"
}
