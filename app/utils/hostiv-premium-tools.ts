import { isHostivSubscriptionActive } from "./hostiv-subscription-access"
import { isHostivProPlan, type HostivSubscriptionPlan } from "./hostiv-subscription-plan"

export function hasHostivPremiumTools(input: {
  plan?: unknown
  paid_until?: string | null
  premium_tools_until?: string | null
  now?: Date
}) {
  if (isHostivProPlan(input.plan) && isHostivSubscriptionActive(input.paid_until, input.now)) {
    return true
  }

  return isHostivSubscriptionActive(input.premium_tools_until, input.now)
}

export function resolveHostivEffectivePlan(
  plan: unknown,
  premiumToolsUntil?: string | null,
  paidUntil?: string | null
): HostivSubscriptionPlan {
  if (isHostivProPlan(plan) && isHostivSubscriptionActive(paidUntil)) {
    return "pro"
  }

  if (isHostivSubscriptionActive(premiumToolsUntil)) {
    return "pro"
  }

  return "starter"
}
