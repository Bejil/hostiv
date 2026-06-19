import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import { addDayToIsoDate, enumerateStayNights } from "./stay-nights"

type ReservationsIcsOptions = {
  calendarName: string
  propertySlug: string
  manualBlocks?: string[]
}

type ManualBlockRange = {
  start: string
  end: string
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

function groupConsecutiveDates(dates: string[]) {
  const sorted = [...dates].sort((a, b) => a.localeCompare(b))
  const ranges: ManualBlockRange[] = []

  for (const date of sorted) {
    const last = ranges[ranges.length - 1]

    if (!last) {
      ranges.push({ start: date, end: date })
      continue
    }

    if (date === addDayToIsoDate(last.end)) {
      last.end = date
      continue
    }

    ranges.push({ start: date, end: date })
  }

  return ranges
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

function buildManualBlockEvent(range: ManualBlockRange, propertySlug: string, stamp: string) {
  const departureDate = addDayToIsoDate(range.end)
  const summary = escapeIcalText("Indisponible — blocage manuel")
  const description = escapeIcalText(
    range.start === range.end
      ? `Nuit bloquée manuellement le ${range.start}`
      : `Période bloquée manuellement du ${range.start} au ${range.end}`
  )

  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcalText(`manual-${range.start}-${range.end}@hostiv/${propertySlug}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${formatIcalDateValue(range.start)}`,
    `DTEND;VALUE=DATE:${formatIcalDateValue(departureDate)}`,
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
  const reservedNights = new Set<string>()

  for (const reservation of confirmed) {
    for (const night of enumerateStayNights(reservation.arrival_date, reservation.departure_date)) {
      reservedNights.add(night)
    }
  }

  const manualBlocks = [...new Set(options.manualBlocks ?? [])]
    .filter((date) => !reservedNights.has(date))
    .sort((a, b) => a.localeCompare(b))

  const reservationEvents = confirmed.map((reservation) =>
    buildReservationEvent(reservation, options.propertySlug, stamp)
  )
  const manualBlockEvents = groupConsecutiveDates(manualBlocks).map((range) =>
    buildManualBlockEvent(range, options.propertySlug, stamp)
  )

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hostiv//Site Reservations//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    ...reservationEvents,
    ...manualBlockEvents,
    "END:VCALENDAR",
    ""
  ].join("\r\n")
}
