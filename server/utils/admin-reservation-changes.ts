import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import { formatEuro } from "../../app/utils/booking-price"
import { formatReservationDatesSummary } from "./transactional-email-templates"

export function reservationMeaningfulFieldsChanged(
  before: AdminBookingReservation,
  after: AdminBookingReservation
): boolean {
  if (before.status !== "confirmed" || after.status !== "confirmed") {
    return false
  }

  return (
    before.arrival_date !== after.arrival_date ||
    before.departure_date !== after.departure_date ||
    before.adults !== after.adults ||
    before.children !== after.children ||
    before.babies !== after.babies ||
    before.guest_first_name !== after.guest_first_name ||
    before.guest_last_name !== after.guest_last_name ||
    before.guest_email !== after.guest_email ||
    before.guest_phone !== after.guest_phone ||
    before.total_eur !== after.total_eur
  )
}

function guestLabel(reservation: AdminBookingReservation) {
  return `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()
}

function guestCountLabel(reservation: AdminBookingReservation) {
  const parts = [`${reservation.adults} adulte(s)`]

  if (reservation.children > 0) {
    parts.push(`${reservation.children} enfant(s)`)
  }

  if (reservation.babies > 0) {
    parts.push(`${reservation.babies} bébé(s)`)
  }

  return parts.join(", ")
}

export function describeReservationChanges(
  before: AdminBookingReservation,
  after: AdminBookingReservation
): string[] {
  const changes: string[] = []

  const beforeDates = formatReservationDatesSummary(before.arrival_date, before.departure_date)
  const afterDates = formatReservationDatesSummary(after.arrival_date, after.departure_date)

  if (beforeDates !== afterDates || before.stay_nights !== after.stay_nights) {
    changes.push(`Dates : ${beforeDates} → ${afterDates}`)
  }

  const beforeGuests = guestCountLabel(before)
  const afterGuests = guestCountLabel(after)

  if (beforeGuests !== afterGuests) {
    changes.push(`Voyageurs : ${beforeGuests} → ${afterGuests}`)
  }

  const beforeName = guestLabel(before)
  const afterName = guestLabel(after)

  if (beforeName !== afterName) {
    changes.push(`Nom : ${beforeName} → ${afterName}`)
  }

  if (before.guest_email !== after.guest_email) {
    changes.push(`E-mail : ${before.guest_email} → ${after.guest_email}`)
  }

  if (before.guest_phone !== after.guest_phone) {
    changes.push(`Téléphone : ${before.guest_phone} → ${after.guest_phone}`)
  }

  if (before.total_eur !== after.total_eur) {
    changes.push(`Montant : ${formatEuro(before.total_eur)} → ${formatEuro(after.total_eur)}`)
  }

  return changes
}
