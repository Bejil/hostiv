import { enumerateStayNights } from "./stay-nights"

export type BookingStayKind = "reservation" | "block" | "closure"

export type BookingStayRange = {
  arrival_date: string
  departure_date: string
  kind?: BookingStayKind
}

function shouldBlockNight(range: BookingStayRange) {
  return range.kind !== "block"
}

function isGuestReservationRange(range: BookingStayRange) {
  return range.kind === "reservation" || range.kind === undefined
}

export function buildBlockedNightsFromBookingRanges(ranges: BookingStayRange[]) {
  const dates = new Set<string>()

  for (const range of ranges) {
    if (!shouldBlockNight(range)) {
      continue
    }

    for (const night of enumerateStayNights(range.arrival_date, range.departure_date)) {
      dates.add(night)
    }
  }

  return dates
}

function sortBookingRanges(ranges: BookingStayRange[]) {
  return [...ranges].sort((left, right) => {
    const byArrival = left.arrival_date.localeCompare(right.arrival_date)

    if (byArrival !== 0) {
      return byArrival
    }

    return left.departure_date.localeCompare(right.departure_date)
  })
}

/**
 * Réouvre les nuits entre le checkout d’une réservation et l’arrivée de la suivante.
 * N’affecte pas les fermetures OTA (ex. Booking CLOSED).
 */
export function unblockTurnoverGapNights(blocked: Set<string>, ranges: BookingStayRange[]) {
  const reservations = sortBookingRanges(ranges.filter(isGuestReservationRange))

  for (let index = 0; index < reservations.length; index += 1) {
    const current = reservations[index]

    for (let nextIndex = index + 1; nextIndex < reservations.length; nextIndex += 1) {
      const next = reservations[nextIndex]

      if (next.arrival_date.localeCompare(current.departure_date) < 0) {
        continue
      }

      if (current.departure_date.localeCompare(next.arrival_date) < 0) {
        for (const night of enumerateStayNights(current.departure_date, next.arrival_date)) {
          blocked.delete(night)
        }
      }

      break
    }
  }
}

export function applyBookingRangeAvailability(
  ranges: BookingStayRange[],
  manualBlocks: Iterable<string> = []
) {
  const blocked = buildBlockedNightsFromBookingRanges(ranges)

  for (const night of manualBlocks) {
    blocked.add(night)
  }

  return blocked
}
