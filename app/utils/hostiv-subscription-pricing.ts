import { hostivPricing, type HostivPricingPlanId } from "../data/hostivLanding"
import type { HostivSubscriptionPlan } from "./hostiv-subscription-plan"

export type HostivPricingPlan = (typeof hostivPricing.plans)[number]

export function getHostivPricingPlan(planId: string | null | undefined): HostivPricingPlan {
  const match = hostivPricing.plans.find((plan) => plan.id === planId)

  return match ?? hostivPricing.plans[1]
}

export function hostivPlanPriceCents(planId: HostivSubscriptionPlan | HostivPricingPlanId) {
  const plan = getHostivPricingPlan(planId)

  return Math.round(plan.price * 100)
}

export function hostivPlanCheckoutLabel(planId: HostivSubscriptionPlan | HostivPricingPlanId) {
  const plan = getHostivPricingPlan(planId)

  return `Hostiv ${plan.name} — forfait 12 mois`
}

export function hostivPlanCheckoutDescription(planId: HostivSubscriptionPlan | HostivPricingPlanId) {
  const plan = getHostivPricingPlan(planId)

  return `${plan.tagline} Paiement unique, sans reconduction automatique.`
}
