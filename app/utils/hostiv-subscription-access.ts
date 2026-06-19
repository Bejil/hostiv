import type { HostivSubscriptionPlan } from "./hostiv-subscription-plan"
import { hasHostivPremiumTools } from "./hostiv-premium-tools"

export type HostivSubscriptionAccess = {
  plan: HostivSubscriptionPlan
  active: boolean
  paid_until: string | null
  subscription_started_at: string | null
  premium_tools_until: string | null
  premium_tools_started_at: string | null
  has_premium_tools: boolean
  has_starter_plus: boolean
  requires_payment: boolean
  /** Compte administrateur plateforme Hostiv (forfait Pro offert, sans échéance). */
  is_platform_admin?: boolean
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

/** Début de période affichable (DB ou dérivé de la fin − 12 mois). */
export function resolveHostivSubscriptionStartedAt(input: {
  subscription_started_at?: string | null
  paid_until?: string | null
}) {
  const startedAt =
    typeof input.subscription_started_at === "string" && input.subscription_started_at.trim()
      ? input.subscription_started_at.trim()
      : null

  if (startedAt) {
    return startedAt
  }

  const paidUntil =
    typeof input.paid_until === "string" && input.paid_until.trim() ? input.paid_until.trim() : null

  if (!paidUntil) {
    return null
  }

  const end = new Date(paidUntil)

  if (Number.isNaN(end.getTime())) {
    return null
  }

  const start = new Date(end)

  start.setUTCFullYear(start.getUTCFullYear() - 1)

  return start.toISOString()
}

export function resolvePremiumToolsStartedAt(input: {
  premium_tools_started_at?: string | null
  premium_tools_until?: string | null
}) {
  const startedAt =
    typeof input.premium_tools_started_at === "string" && input.premium_tools_started_at.trim()
      ? input.premium_tools_started_at.trim()
      : null

  if (startedAt) {
    return startedAt
  }

  const until =
    typeof input.premium_tools_until === "string" && input.premium_tools_until.trim()
      ? input.premium_tools_until.trim()
      : null

  if (!until || !isHostivSubscriptionActive(until)) {
    return null
  }

  const end = new Date(until)

  if (Number.isNaN(end.getTime())) {
    return null
  }

  const start = new Date(end)

  start.setUTCFullYear(start.getUTCFullYear() - 1)

  return start.toISOString()
}

/** Date de fin symbolique pour les comptes admin plateforme (forfait Pro sans limite). */
export const HOSTIV_PLATFORM_ADMIN_PAID_UNTIL = "2099-12-31T23:59:59.999Z"

export function isHostivPlatformAdminSubscriptionAccess(
  access: Pick<HostivSubscriptionAccess, "is_platform_admin" | "paid_until"> | null | undefined
) {
  if (!access) {
    return false
  }

  if (access.is_platform_admin === true) {
    return true
  }

  const paidUntil =
    typeof access.paid_until === "string" && access.paid_until.trim()
      ? access.paid_until.trim()
      : null

  if (!paidUntil) {
    return false
  }

  const end = new Date(paidUntil).getTime()
  const platformEnd = new Date(HOSTIV_PLATFORM_ADMIN_PAID_UNTIL).getTime()

  return !Number.isNaN(end) && !Number.isNaN(platformEnd) && end >= platformEnd
}

export function buildHostivPlatformAdminSubscriptionAccess(
  subscriptionStartedAt?: string | null
): HostivSubscriptionAccess {
  const access = buildHostivSubscriptionAccess({
    subscription_plan: "pro",
    paid_until: HOSTIV_PLATFORM_ADMIN_PAID_UNTIL,
    subscription_started_at:
      typeof subscriptionStartedAt === "string" && subscriptionStartedAt.trim()
        ? subscriptionStartedAt.trim()
        : new Date().toISOString(),
    premium_tools_until: null,
    premium_tools_started_at: null
  })

  return {
    ...access,
    is_platform_admin: true
  }
}

export function buildHostivSubscriptionAccess(input: {
  subscription_plan?: string | null
  paid_until?: string | null
  subscription_started_at?: string | null
  premium_tools_until?: string | null
  premium_tools_started_at?: string | null
}): HostivSubscriptionAccess {
  const plan = (input.subscription_plan === "starter" ? "starter" : "pro") as HostivSubscriptionPlan
  const paidUntil =
    typeof input.paid_until === "string" && input.paid_until.trim()
      ? input.paid_until.trim()
      : null
  const startedAt = resolveHostivSubscriptionStartedAt({
    subscription_started_at: input.subscription_started_at,
    paid_until: paidUntil
  })
  const premiumToolsUntil =
    typeof input.premium_tools_until === "string" && input.premium_tools_until.trim()
      ? input.premium_tools_until.trim()
      : null
  const active = isHostivSubscriptionActive(paidUntil)
  const premiumToolsStartedAt = resolvePremiumToolsStartedAt({
    premium_tools_started_at: input.premium_tools_started_at,
    premium_tools_until: premiumToolsUntil
  })
  const hasPremiumTools = hasHostivPremiumTools({
    plan,
    paid_until: paidUntil,
    premium_tools_until: premiumToolsUntil
  })
  const hasStarterPlus =
    plan === "starter" && isHostivSubscriptionActive(premiumToolsUntil)

  return {
    plan,
    active,
    paid_until: paidUntil,
    subscription_started_at: startedAt,
    premium_tools_until: premiumToolsUntil,
    premium_tools_started_at: premiumToolsStartedAt,
    has_premium_tools: hasPremiumTools,
    has_starter_plus: hasStarterPlus,
    requires_payment: !active
  }
}

export function formatHostivSubscriptionDate(iso: string | null | undefined) {
  if (!iso?.trim()) {
    return "—"
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}
