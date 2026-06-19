import type { HostivLocale } from "../types/hostiv-locale"
import { adminUiFormat, getAdminUi } from "./admin-ui"
import { getHostivLanding } from "./hostivLanding"

export type AdminProFeatureId = "welcome-guide" | "invoice" | "cohosts"

export type AdminProFeatureMeta = {
  id: AdminProFeatureId
  title: string
  lead: string
  starterPlusCta: string
  optionsIntro?: string
  starterPlusOption?: string
  proOption?: string
  proCta?: string
}

export function getAdminProFeatures(
  locale: HostivLocale = "fr"
): Record<AdminProFeatureId, AdminProFeatureMeta> {
  const ui = getAdminUi(locale)
  const pricing = getHostivLanding(locale).pricing
  const price = String(pricing.premiumAddon.price)
  const proPrice = String(pricing.plans.find((plan) => plan.id === "pro")?.price ?? 99)

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
    },
    cohosts: {
      id: "cohosts",
      title: ui.proFeatures.cohosts.title,
      lead: ui.proFeatures.cohosts.lead,
      optionsIntro: ui.proFeatures.cohosts.optionsIntro,
      starterPlusOption: adminUiFormat(ui.proFeatures.cohosts.starterPlusOption, { price }),
      proOption: adminUiFormat(ui.proFeatures.cohosts.proOption, { proPrice }),
      starterPlusCta: adminUiFormat(ui.proFeatures.cohosts.starterPlusCta, { price }),
      proCta: adminUiFormat(ui.proFeatures.cohosts.proCta, { proPrice })
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
  return getHostivLanding(locale).pricing.plans.find((plan) => plan.id === "pro")?.price ?? 99
}

/** @deprecated Utiliser getAdminProUpgradePrice(locale) */
export const adminProUpgradePrice = getAdminProUpgradePrice("fr")
