function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)

  return next
}

export function addDayToIsoDate(isoDate: string, days = 1) {
  const date = fromInputDate(isoDate)

  if (!date) {
    return isoDate
  }

  return toInputDate(addDays(date, days))
}

/** Nuits de séjour (arrivée incluse, départ exclu). */
export function enumerateStayNights(arrivalDate: string, departureDate: string) {
  const nights: string[] = []
  const departure = fromInputDate(departureDate)
  const arrival = fromInputDate(arrivalDate)

  if (!departure || !arrival) {
    return nights
  }

  for (let cursor = arrival; cursor < departure; cursor = addDays(cursor, 1)) {
    nights.push(toInputDate(cursor))
  }

  return nights
}
