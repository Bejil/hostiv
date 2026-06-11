import { getSiteUiLabels, siteUiFormat } from "../data/site-ui-labels"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyBookingConfig } from "../types/property-site"
import { normalizeBookingConfig } from "./booking-config"

export type PricingDisplayCard = {
  icon: "night" | "week" | "month"
  title: string
  value: string
  text: string
}

export function buildPricingDisplayCards(
  config: PropertyBookingConfig,
  locale: HostivLocale = "fr"
): PricingDisplayCard[] {
  const normalizedConfig = normalizeBookingConfig(config)
  const labels = getSiteUiLabels(locale).pricing
  const cards: PricingDisplayCard[] = [
    {
      icon: "night",
      title: labels.nightTitle,
      value: `${normalizedConfig.base_night_price_eur}€`,
      text: labels.nightText
    }
  ]

  if (normalizedConfig.week_discount_enabled) {
    cards.push({
      icon: "week",
      title: labels.weekTitle,
      value: `-${Math.round(normalizedConfig.week_discount_rate * 100)}%`,
      text: siteUiFormat(labels.weekText, { min: normalizedConfig.week_min_nights })
    })
  }

  if (normalizedConfig.month_discount_enabled) {
    cards.push({
      icon: "month",
      title: labels.monthTitle,
      value: `-${Math.round(normalizedConfig.month_discount_rate * 100)}%`,
      text: siteUiFormat(labels.monthText, { min: normalizedConfig.month_min_nights })
    })
  }

  return cards
}
