import { isHostivSubscriptionActive } from "./hostiv-subscription-access"
import { isHostivProPlan, type HostivSubscriptionPlan } from "./hostiv-subscription-plan"

export function hasHostivPremiumTools(input: {
  plan?: unknown
  premium_tools_until?: string | null
  now?: Date
}) {
  if (isHostivProPlan(input.plan)) {
    return true
  }

  return isHostivSubscriptionActive(input.premium_tools_until, input.now)
}

export function resolveHostivEffectivePlan(
  plan: unknown,
  premiumToolsUntil?: string | null
): HostivSubscriptionPlan {
  if (isHostivProPlan(plan)) {
    return "pro"
  }

  if (isHostivSubscriptionActive(premiumToolsUntil)) {
    return "pro"
  }

  return "starter"
}
