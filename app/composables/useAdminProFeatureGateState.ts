import type { Ref } from "vue"
import type { AdminProFeatureId } from "../data/admin-pro-features"
import type { HostivSubscriptionAccess } from "../utils/hostiv-subscription-access"
import { hasHostivPremiumTools } from "../utils/hostiv-premium-tools"

export function canUseAdminPremiumTools(access: HostivSubscriptionAccess | null | undefined) {
  if (!access) {
    return false
  }

  if (typeof access.has_premium_tools === "boolean") {
    return access.has_premium_tools
  }

  return hasHostivPremiumTools({
    plan: access.plan,
    paid_until: access.paid_until,
    premium_tools_until: access.premium_tools_until
  })
}

/** Accès Starter + ou Pro (guide PDF + factures ; source : `subscription_access`). */
export function useAdminProFeatureGateState(
  subscriptionAccess: Ref<HostivSubscriptionAccess | null | undefined>
) {
  const modalOpen = ref(false)
  const activeFeature = ref<AdminProFeatureId | null>(null)

  const isProPlan = computed(() => canUseAdminPremiumTools(subscriptionAccess.value))

  function openProUpgrade(featureId: AdminProFeatureId) {
    activeFeature.value = featureId
    modalOpen.value = true
  }

  function closeProUpgrade() {
    modalOpen.value = false
    activeFeature.value = null
  }

  /** Retourne true si l’action peut continuer (forfait Pro). */
  function requireProFeature(featureId: AdminProFeatureId): boolean {
    if (isProPlan.value) {
      return true
    }

    openProUpgrade(featureId)
    return false
  }

  return {
    modalOpen,
    activeFeature,
    isProPlan,
    openProUpgrade,
    closeProUpgrade,
    requireProFeature
  }
}
