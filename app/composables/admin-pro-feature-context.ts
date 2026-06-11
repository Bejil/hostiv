import type { ComputedRef, InjectionKey } from "vue"
import type { AdminProFeatureId } from "../data/admin-pro-features"

export type AdminProFeatureGate = {
  isProPlan: ComputedRef<boolean>
  requireProFeature: (featureId: AdminProFeatureId) => boolean
  openProUpgrade: (featureId: AdminProFeatureId) => void
  closeProUpgrade: () => void
}

export const adminProFeatureKey: InjectionKey<AdminProFeatureGate> = Symbol("adminProFeature")

export function useAdminProFeatureGate() {
  const gate = inject(adminProFeatureKey)

  if (!gate) {
    throw new Error("AdminProFeatureGate manquant — utilisez ce composant dans le backoffice.")
  }

  return gate
}
