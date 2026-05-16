/** Repères tarifaires (cohérents avec la section Tarifs de la page). */

export const BOOKING_BASE_NIGHT_PRICE_EUR = 100

/** À partir de ce nombre de nuits : −10 % sur l’hébergement. */
export const BOOKING_WEEK_MIN_NIGHTS = 7
export const BOOKING_WEEK_DISCOUNT_RATE = 0.1

/** À partir de ce nombre de nuits : −20 % sur l’hébergement (remplace la remise semaine). */
export const BOOKING_MONTH_MIN_NIGHTS = 28
export const BOOKING_MONTH_DISCOUNT_RATE = 0.2

/**
 * Adultes + enfants inclus dans le tarif de base ; à partir du voyageur suivant : supplément par nuit et par voyageur.
 * Les bébés ne modulent pas ce calcul.
 */
export const BOOKING_INCLUDED_MAIN_GUESTS = 3
export const BOOKING_EXTRA_MAIN_GUEST_PER_NIGHT_EUR = 15

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
  mainGuests: number
): BookingPriceEstimate {
  const safeNights = Math.max(1, Math.round(nights))
  const safeGuests = Math.max(1, Math.round(mainGuests))

  const baseLodgingEur = BOOKING_BASE_NIGHT_PRICE_EUR * safeNights

  let discountRate = 0
  let discountLabel: string | null = null

  if (safeNights >= BOOKING_MONTH_MIN_NIGHTS) {
    discountRate = BOOKING_MONTH_DISCOUNT_RATE
    discountLabel = `Remise long séjour (−${Math.round(BOOKING_MONTH_DISCOUNT_RATE * 100)} %, ${BOOKING_MONTH_MIN_NIGHTS} nuits et +)`
  } else if (safeNights >= BOOKING_WEEK_MIN_NIGHTS) {
    discountRate = BOOKING_WEEK_DISCOUNT_RATE
    discountLabel = `Remise semaine (−${Math.round(BOOKING_WEEK_DISCOUNT_RATE * 100)} %, à partir de ${BOOKING_WEEK_MIN_NIGHTS} nuits)`
  }

  const lodgingAfterDiscountEur = Math.round(baseLodgingEur * (1 - discountRate))

  const extraGuests = Math.max(0, safeGuests - BOOKING_INCLUDED_MAIN_GUESTS)
  const guestSupplementEur = Math.round(
    extraGuests * BOOKING_EXTRA_MAIN_GUEST_PER_NIGHT_EUR * safeNights
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

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(amount)
}
