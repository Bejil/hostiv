function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

export function computeStayNights(arrivalDate: string, departureDate: string): number {
  const arrival = fromInputDate(arrivalDate)
  const departure = fromInputDate(departureDate)

  if (!arrival || !departure || departure <= arrival) {
    return 0
  }

  const msPerDay = 24 * 60 * 60 * 1000

  return Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
}
