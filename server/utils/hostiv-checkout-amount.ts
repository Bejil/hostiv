import { hostivPricing } from "../../app/data/hostivLanding"
import type { HostivPromoCodeValidateContext } from "../../app/types/hostiv-promo-code"
import type { HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { hostivPlanPriceCents } from "../../app/utils/hostiv-subscription-pricing"
import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"

export function resolveHostivCheckoutOriginalAmountCents(input: {
  context: HostivPromoCodeValidateContext
  plan?: string | null
}) {
  const context = input.context

  if (context === "hostiv_premium_tools") {
    return Math.round(hostivPricing.premiumAddon.price * 100)
  }

  const plan = normalizeHostivSubscriptionPlan(input.plan) as HostivSubscriptionPlan

  return hostivPlanPriceCents(plan)
}
