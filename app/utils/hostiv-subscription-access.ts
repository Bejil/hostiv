import type { HostivSubscriptionPlan } from "./hostiv-subscription-plan"

export type HostivSubscriptionAccess = {
  plan: HostivSubscriptionPlan
  active: boolean
  paid_until: string | null
  requires_payment: boolean
}

export function isHostivSubscriptionActive(paidUntil: string | null | undefined, now = new Date()) {
  if (!paidUntil) {
    return false
  }

  const end = new Date(paidUntil)

  if (Number.isNaN(end.getTime())) {
    return false
  }

  return end.getTime() > now.getTime()
}

export function buildHostivSubscriptionAccess(input: {
  subscription_plan?: string | null
  paid_until?: string | null
}): HostivSubscriptionAccess {
  const plan = (input.subscription_plan === "starter" ? "starter" : "pro") as HostivSubscriptionPlan
  const paidUntil =
    typeof input.paid_until === "string" && input.paid_until.trim()
      ? input.paid_until.trim()
      : null
  const active = isHostivSubscriptionActive(paidUntil)

  return {
    plan,
    active,
    paid_until: paidUntil,
    requires_payment: !active
  }
}
