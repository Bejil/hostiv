import { fromInputDate, toInputDate } from "./input-date"

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)

  return next
}

/** Nuits de séjour (arrivée incluse, départ exclu). */
export function enumerateStayNights(arrivalDate: string, departureDate: string) {
  const nights: string[] = []
  const departure = fromInputDate(departureDate)

  for (let cursor = fromInputDate(arrivalDate); cursor < departure; cursor = addDays(cursor, 1)) {
    nights.push(toInputDate(cursor))
  }

  return nights
}

/** Vrai si une nuit du séjour chevauche une date indisponible (pas le jour de départ seul). */
export function stayOverlapsBlockedNights(
  arrivalDate: string,
  departureDate: string,
  blockedNights: ReadonlySet<string>
) {
  return enumerateStayNights(arrivalDate, departureDate).some((night) => blockedNights.has(night))
}
