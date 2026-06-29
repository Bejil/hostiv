import { addDaysToInputDate, compareInputDates } from "./input-date"
import { enumerateStayNights, stayOverlapsBlockedNights } from "./stay-nights"

/** Nuit libre pour une arrivée (on dort la nuit qui commence ce jour-là). */
export function isCheckInNightFree(isoDate: string, blockedNights: ReadonlySet<string>) {
  return !blockedNights.has(isoDate)
}

/** Nuits consécutives libres à partir de la date d’arrivée (nuits occupées, pas jours de départ). */
export function countConsecutiveFreeNightsFrom(
  arrivalDate: string,
  blockedNights: ReadonlySet<string>,
  maxNights = 366
) {
  let count = 0
  let cursor = arrivalDate

  while (count < maxNights && !blockedNights.has(cursor)) {
    count += 1
    cursor = addDaysToInputDate(cursor, 1)
  }

  return count
}

/** Durée minimale effective : réduite si la fenêtre libre entre deux réservations est plus courte. */
export function effectiveMinStayNightsForArrival(
  arrivalDate: string,
  configuredMinStay: number,
  blockedNights: ReadonlySet<string>,
  configuredMaxStay = configuredMinStay
) {
  if (!isCheckInNightFree(arrivalDate, blockedNights)) {
    return Number.POSITIVE_INFINITY
  }

  const freeNights = countConsecutiveFreeNightsFrom(
    arrivalDate,
    blockedNights,
    configuredMaxStay
  )

  if (freeNights <= 0) {
    return Number.POSITIVE_INFINITY
  }

  return Math.min(configuredMinStay, freeNights)
}

export function minimumDepartureDateForArrival(
  arrivalDate: string,
  configuredMinStay: number,
  blockedNights: ReadonlySet<string>,
  configuredMaxStay = configuredMinStay
) {
  const effectiveMin = effectiveMinStayNightsForArrival(
    arrivalDate,
    configuredMinStay,
    blockedNights,
    configuredMaxStay
  )

  if (!Number.isFinite(effectiveMin)) {
    return addDaysToInputDate(arrivalDate, configuredMinStay)
  }

  return addDaysToInputDate(arrivalDate, effectiveMin)
}

/** Dernière date de départ autorisée sans chevaucher une nuit bloquée (dans la limite max configurée). */
export function maximumDepartureDateForArrival(
  arrivalDate: string,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>
) {
  const configuredMaxDeparture = addDaysToInputDate(arrivalDate, configuredMaxStay)
  let lastValid: string | null = null

  for (
    let departure = addDaysToInputDate(arrivalDate, 1);
    compareInputDates(departure, configuredMaxDeparture) <= 0;
    departure = addDaysToInputDate(departure, 1)
  ) {
    if (stayOverlapsBlockedNights(arrivalDate, departure, blockedNights)) {
      break
    }

    lastValid = departure
  }

  return lastValid ?? addDaysToInputDate(arrivalDate, 1)
}

export function isValidBookingDepartureDate(
  arrivalDate: string,
  departureDate: string,
  configuredMinStay: number,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>
) {
  if (compareInputDates(departureDate, arrivalDate) <= 0) {
    return false
  }

  const stayNights = enumerateStayNights(arrivalDate, departureDate).length

  if (stayNights < 1) {
    return false
  }

  const effectiveMin = effectiveMinStayNightsForArrival(
    arrivalDate,
    configuredMinStay,
    blockedNights,
    configuredMaxStay
  )

  if (!Number.isFinite(effectiveMin) || stayNights < effectiveMin || stayNights > configuredMaxStay) {
    return false
  }

  return !stayOverlapsBlockedNights(arrivalDate, departureDate, blockedNights)
}

export function canArriveOnBlockedCalendar(
  arrivalDate: string,
  configuredMinStay: number,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>
) {
  if (!isCheckInNightFree(arrivalDate, blockedNights)) {
    return false
  }

  const minimumDeparture = minimumDepartureDateForArrival(
    arrivalDate,
    configuredMinStay,
    blockedNights,
    configuredMaxStay
  )
  const maximumDeparture = maximumDepartureDateForArrival(
    arrivalDate,
    configuredMaxStay,
    blockedNights
  )

  if (compareInputDates(minimumDeparture, maximumDeparture) > 0) {
    return false
  }

  for (
    let departure = minimumDeparture;
    compareInputDates(departure, maximumDeparture) <= 0;
    departure = addDaysToInputDate(departure, 1)
  ) {
    if (
      isValidBookingDepartureDate(
        arrivalDate,
        departure,
        configuredMinStay,
        configuredMaxStay,
        blockedNights
      )
    ) {
      return true
    }
  }

  return false
}

export function isCalendarDayDisabled(
  isoDate: string,
  step: "arrival" | "departure",
  arrivalDate: string,
  configuredMinStay: number,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>,
  minimumArrivalDate: string
) {
  if (compareInputDates(isoDate, minimumArrivalDate) < 0) {
    return true
  }

  if (step === "arrival") {
    return !canArriveOnBlockedCalendar(
      isoDate,
      configuredMinStay,
      configuredMaxStay,
      blockedNights
    )
  }

  if (compareInputDates(isoDate, arrivalDate) < 0) {
    return !canArriveOnBlockedCalendar(
      isoDate,
      configuredMinStay,
      configuredMaxStay,
      blockedNights
    )
  }

  if (compareInputDates(isoDate, arrivalDate) === 0) {
    return true
  }

  return !isValidBookingDepartureDate(
    arrivalDate,
    isoDate,
    configuredMinStay,
    configuredMaxStay,
    blockedNights
  )
}

/** Indisponible visuellement (nuits occupées) — en sélection du départ, le jour de checkout d’une autre résa reste cliquable. */
export function isCalendarDayMarkedReserved(
  isoDate: string,
  step: "arrival" | "departure",
  arrivalDate: string,
  blockedNights: ReadonlySet<string>
) {
  if (!blockedNights.has(isoDate)) {
    return false
  }

  if (step === "arrival") {
    return true
  }

  return compareInputDates(isoDate, arrivalDate) <= 0
}

export function findFirstValidDepartureDate(
  arrivalDate: string,
  configuredMinStay: number,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>
) {
  const minimumDeparture = minimumDepartureDateForArrival(
    arrivalDate,
    configuredMinStay,
    blockedNights,
    configuredMaxStay
  )
  const maximumDeparture = maximumDepartureDateForArrival(
    arrivalDate,
    configuredMaxStay,
    blockedNights
  )

  for (
    let departure = minimumDeparture;
    compareInputDates(departure, maximumDeparture) <= 0;
    departure = addDaysToInputDate(departure, 1)
  ) {
    if (
      isValidBookingDepartureDate(
        arrivalDate,
        departure,
        configuredMinStay,
        configuredMaxStay,
        blockedNights
      )
    ) {
      return departure
    }
  }

  return null
}

/** Date de départ si une seule est valide pour cette arrivée, sinon null. */
export function findUniqueValidDepartureDate(
  arrivalDate: string,
  configuredMinStay: number,
  configuredMaxStay: number,
  blockedNights: ReadonlySet<string>
) {
  const minimumDeparture = minimumDepartureDateForArrival(
    arrivalDate,
    configuredMinStay,
    blockedNights,
    configuredMaxStay
  )
  const maximumDeparture = maximumDepartureDateForArrival(
    arrivalDate,
    configuredMaxStay,
    blockedNights
  )
  let found: string | null = null

  for (
    let departure = minimumDeparture;
    compareInputDates(departure, maximumDeparture) <= 0;
    departure = addDaysToInputDate(departure, 1)
  ) {
    if (
      !isValidBookingDepartureDate(
        arrivalDate,
        departure,
        configuredMinStay,
        configuredMaxStay,
        blockedNights
      )
    ) {
      continue
    }

    if (found !== null) {
      return null
    }

    found = departure
  }

  return found
}
