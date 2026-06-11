import type { PropertyBookingConfig } from "../types/property-site"
import { adminUiFormat, getAdminUi } from "../data/admin-ui"
import type { HostivLocale } from "../types/hostiv-locale"
import { normalizeBookingConfig } from "./booking-config"

export function hasCancellationRefundPolicy(config: PropertyBookingConfig) {
  const normalized = normalizeBookingConfig(config)

  return (
    normalized.cancellation_refund_percent > 0 && normalized.cancellation_days_before_checkin > 0
  )
}

function pluralDaysLabel(count: number, locale: HostivLocale) {
  const labels = getAdminUi(locale).extended.cancellation

  if (count <= 1) {
    return labels.dayOne
  }

  return adminUiFormat(labels.dayMany, { count })
}

/** Texte affiché sur le site et dans la modal de réservation. */
export function formatCancellationRefundPolicy(
  config: PropertyBookingConfig,
  locale: HostivLocale = "fr"
) {
  const normalized = normalizeBookingConfig(config)

  if (!hasCancellationRefundPolicy(normalized)) {
    return ""
  }

  const labels = getAdminUi(locale).extended.cancellation
  const percent = Math.round(normalized.cancellation_refund_percent)
  const days = Math.round(normalized.cancellation_days_before_checkin)
  const daysLabel = pluralDaysLabel(days, locale)

  if (percent >= 100) {
    return adminUiFormat(labels.policyFull, { days: daysLabel })
  }

  return adminUiFormat(labels.policyPartial, { percent, days: daysLabel })
}
