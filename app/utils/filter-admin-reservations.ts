import type {
  AdminBookingReservation,
  AdminBookingReservationStatus
} from "../types/booking-reservation"
import { compareInputDates } from "./input-date"

export const ADMIN_RESERVATION_FILTER_STATUSES: AdminBookingReservationStatus[] = [
  "upcoming",
  "past",
  "cancelled"
]

export type AdminReservationStatusFilter = "all" | AdminBookingReservationStatus

/** Chevauchement entre la période filtrée et le séjour (nuits avant le jour de départ). */
export function reservationMatchesDateFilter(
  reservation: AdminBookingReservation,
  from: string,
  to: string
) {
  const fromTrim = from.trim()
  const toTrim = to.trim()

  if (!fromTrim && !toTrim) {
    return true
  }

  if (fromTrim && toTrim && compareInputDates(fromTrim, toTrim) > 0) {
    return false
  }

  if (fromTrim && compareInputDates(reservation.departure_date, fromTrim) <= 0) {
    return false
  }

  if (toTrim && compareInputDates(reservation.arrival_date, toTrim) > 0) {
    return false
  }

  return true
}

export function reservationMatchesStatusFilter(
  reservation: AdminBookingReservation,
  status: AdminReservationStatusFilter
) {
  if (status === "all") {
    return true
  }

  return reservation.display_status === status
}

export function filterAdminReservations(
  reservations: AdminBookingReservation[],
  options: {
    dateFrom: string
    dateTo: string
    status: AdminReservationStatusFilter
  }
) {
  return reservations.filter(
    (item) =>
      reservationMatchesDateFilter(item, options.dateFrom, options.dateTo) &&
      reservationMatchesStatusFilter(item, options.status)
  )
}

export function hasActiveAdminReservationFilters(
  dateFrom: string,
  dateTo: string,
  status: AdminReservationStatusFilter
) {
  return Boolean(dateFrom.trim() || dateTo.trim()) || status !== "all"
}
