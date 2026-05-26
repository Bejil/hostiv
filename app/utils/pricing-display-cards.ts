import type { PropertyBookingConfig } from "../types/property-site"
import { normalizeBookingConfig } from "./booking-config"

export type PricingDisplayCard = {
  icon: "night" | "week" | "month"
  title: string
  value: string
  text: string
}

export function buildPricingDisplayCards(config: PropertyBookingConfig): PricingDisplayCard[] {
  const normalizedConfig = normalizeBookingConfig(config)
  const cards: PricingDisplayCard[] = [
    {
      icon: "night",
      title: "Nuitée",
      value: `${normalizedConfig.base_night_price_eur}€`,
      text: "À partir d’une nuit"
    }
  ]

  if (normalizedConfig.week_discount_enabled) {
    cards.push({
      icon: "week",
      title: "Séjour d’une semaine",
      value: `-${Math.round(normalizedConfig.week_discount_rate * 100)}%`,
      text: `Dès ${normalizedConfig.week_min_nights} nuits`
    })
  }

  if (normalizedConfig.month_discount_enabled) {
    cards.push({
      icon: "month",
      title: "Séjour d’un mois",
      value: `-${Math.round(normalizedConfig.month_discount_rate * 100)}%`,
      text: `Dès ${normalizedConfig.month_min_nights} nuits`
    })
  }

  return cards
}
