import type { HostivLocale } from "../types/hostiv-locale"
import { adminUiFormat, getAdminUi } from "./admin-ui"
import { getHostivLanding } from "./hostivLanding"

export type AdminProFeatureId = "welcome-guide" | "invoice"

export type AdminProFeatureMeta = {
  id: AdminProFeatureId
  title: string
  lead: string
  starterPlusCta: string
}

export function getAdminProFeatures(
  locale: HostivLocale = "fr"
): Record<AdminProFeatureId, AdminProFeatureMeta> {
  const ui = getAdminUi(locale)
  const pricing = getHostivLanding(locale).pricing
  const price = String(pricing.premiumAddon.price)

  return {
    "welcome-guide": {
      id: "welcome-guide",
      title: ui.proFeatures["welcome-guide"].title,
      lead: ui.proFeatures["welcome-guide"].lead,
      starterPlusCta: adminUiFormat(ui.proFeatures["welcome-guide"].starterPlusCta, { price })
    },
    invoice: {
      id: "invoice",
      title: ui.proFeatures.invoice.title,
      lead: ui.proFeatures.invoice.lead,
      starterPlusCta: adminUiFormat(ui.proFeatures.invoice.starterPlusCta, { price })
    }
  }
}

/** @deprecated Utiliser getAdminProFeatures(locale) */
export const adminProFeatures = getAdminProFeatures("fr")

export function getStarterPlusFeatures(locale: HostivLocale = "fr") {
  return getHostivLanding(locale).pricing.premiumAddon.features
}

/** @deprecated Utiliser getStarterPlusFeatures(locale) */
export const starterPlusFeatures = getStarterPlusFeatures("fr")

export function getAdminProUpgradePrice(locale: HostivLocale = "fr") {
  return getHostivLanding(locale).pricing.plans.find((plan) => plan.id === "pro")?.price ?? 69
}

/** @deprecated Utiliser getAdminProUpgradePrice(locale) */
export const adminProUpgradePrice = getAdminProUpgradePrice("fr")
