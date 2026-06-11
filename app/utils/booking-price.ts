import { getSiteBookingModalLabels } from "../data/site-booking-modal-labels"
import { siteUiFormat } from "../data/site-ui-labels"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyBookingConfig } from "../types/property-site"
import { normalizeBookingConfig } from "./booking-config"

export type BookingPriceEstimate = {
  nights: number
  mainGuests: number
  baseLodgingEur: number
  discountRate: number
  discountLabel: string | null
  lodgingAfterDiscountEur: number
  guestSupplementEur: number
  totalEur: number
}

export function computeBookingPriceEstimate(
  nights: number,
  mainGuests: number,
  config: PropertyBookingConfig,
  locale: HostivLocale = "fr"
): BookingPriceEstimate {
  const normalizedConfig = normalizeBookingConfig(config)
  const safeNights = Math.max(1, Math.round(nights))
  const safeGuests = Math.max(1, Math.round(mainGuests))

  const baseLodgingEur = normalizedConfig.base_night_price_eur * safeNights

  let discountRate = 0
  let discountLabel: string | null = null

  const modalLabels = getSiteBookingModalLabels(locale)

  if (normalizedConfig.month_discount_enabled && safeNights >= normalizedConfig.month_min_nights) {
    discountRate = normalizedConfig.month_discount_rate
    discountLabel = siteUiFormat(modalLabels.monthDiscount, {
      percent: Math.round(normalizedConfig.month_discount_rate * 100),
      min: normalizedConfig.month_min_nights
    })
  } else if (normalizedConfig.week_discount_enabled && safeNights >= normalizedConfig.week_min_nights) {
    discountRate = normalizedConfig.week_discount_rate
    discountLabel = siteUiFormat(modalLabels.weekDiscount, {
      percent: Math.round(normalizedConfig.week_discount_rate * 100),
      min: normalizedConfig.week_min_nights
    })
  }

  const lodgingAfterDiscountEur = Math.round(baseLodgingEur * (1 - discountRate))

  const extraGuests = Math.max(0, safeGuests - normalizedConfig.included_main_guests)
  const guestSupplementEur = Math.round(
    extraGuests * normalizedConfig.extra_main_guest_per_night_eur * safeNights
  )

  const totalEur = lodgingAfterDiscountEur + guestSupplementEur

  return {
    nights: safeNights,
    mainGuests: safeGuests,
    baseLodgingEur,
    discountRate,
    discountLabel,
    lodgingAfterDiscountEur,
    guestSupplementEur,
    totalEur
  }
}

export function formatEuro(amount: number, locale: HostivLocale = "fr") {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount)
}
