import type { AdminBookingReservation } from "../../app/types/booking-reservation"

type ReservationsIcsOptions = {
  calendarName: string
  propertySlug: string
}

function escapeIcalText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
}

function formatIcalUtcTimestamp(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

function formatIcalDateValue(isoDate: string) {
  return isoDate.replace(/-/g, "")
}

function guestLabel(reservation: AdminBookingReservation) {
  const fullName = `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()

  if (fullName) {
    return fullName
  }

  if (reservation.guest_email.trim()) {
    return reservation.guest_email.trim()
  }

  return "Réservation Hostiv"
}

function buildReservationEvent(
  reservation: AdminBookingReservation,
  propertySlug: string,
  stamp: string
) {
  const guest = guestLabel(reservation)
  const summary = escapeIcalText(`Réservation — ${guest}`)
  const description = escapeIcalText(
    [
      `Séjour : ${reservation.arrival_date} → ${reservation.departure_date}`,
      `${reservation.stay_nights} nuit(s)`,
      reservation.guest_email.trim() ? `E-mail : ${reservation.guest_email.trim()}` : "",
      reservation.guest_phone.trim() ? `Téléphone : ${reservation.guest_phone.trim()}` : ""
    ]
      .filter(Boolean)
      .join("\\n")
  )

  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcalText(`${reservation.id}@hostiv/${propertySlug}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${formatIcalDateValue(reservation.arrival_date)}`,
    `DTEND;VALUE=DATE:${formatIcalDateValue(reservation.departure_date)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT"
  ].join("\r\n")
}

export function buildReservationsIcsCalendar(
  reservations: AdminBookingReservation[],
  options: ReservationsIcsOptions
) {
  const confirmed = reservations.filter((reservation) => reservation.status === "confirmed")
  const stamp = formatIcalUtcTimestamp(new Date())
  const calendarName = escapeIcalText(options.calendarName.trim() || options.propertySlug)
  const events = confirmed.map((reservation) =>
    buildReservationEvent(reservation, options.propertySlug, stamp)
  )

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hostiv//Site Reservations//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    ...events,
    "END:VCALENDAR",
    ""
  ].join("\r\n")
}
