import type { BookingRateTabId } from "../components/admin/AdminBookingConfigForm.vue"
import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"

export type BookingPricingSectionMeta = {
  id: BookingRateTabId
  title: string
  lead: string
}

export function getAdminBookingPricingSections(
  locale: HostivLocale = "fr"
): BookingPricingSectionMeta[] {
  return getAdminUi(locale).bookingPricing as BookingPricingSectionMeta[]
}

/** @deprecated Utiliser getAdminBookingPricingSections(locale) */
export const adminBookingPricingSections = getAdminBookingPricingSections("fr")

export function findAdminBookingPricingSection(
  id: BookingRateTabId,
  locale: HostivLocale = "fr"
): BookingPricingSectionMeta {
  return (
    getAdminBookingPricingSections(locale).find((section) => section.id === id) ??
    getAdminBookingPricingSections(locale)[0]
  )
}
