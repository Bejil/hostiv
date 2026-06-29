type IcalEventRange = {
  start: Date
  end: Date
  summary?: string
}

export type IcalStayKind = "reservation" | "block" | "closure"

function unfoldIcal(source: string) {
  return source
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
}

function parseIcalPropertyValue(line: string) {
  const separatorIndex = line.indexOf(":")

  if (separatorIndex === -1) {
    return ""
  }

  return line.slice(separatorIndex + 1).trim()
}

function parseIcalDateValue(rawValue: string) {
  const value = rawValue.trim()

  if (/^\d{8}$/.test(value)) {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(4, 6)) - 1
    const day = Number(value.slice(6, 8))

    return new Date(year, month, day)
  }

  const dateTimeMatch = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)

  if (!dateTimeMatch) {
    return null
  }

  const [, year, month, day, hour, minute, second, isUtc] = dateTimeMatch

  if (isUtc) {
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    )
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  )
}

function extractProperty(block: string, propertyName: string) {
  const pattern = new RegExp(`^${propertyName}(?:;[^:]*)?:(.+)$`, "im")
  const match = block.match(pattern)

  return match ? match[1].trim() : null
}

export function parseIcalEvents(source: string): IcalEventRange[] {
  const unfolded = unfoldIcal(source)
  const events: IcalEventRange[] = []

  for (const block of unfolded.split("BEGIN:VEVENT").slice(1)) {
    const eventBlock = block.split("END:VEVENT")[0]

    if (/^STATUS:CANCELLED/im.test(eventBlock)) {
      continue
    }

    const startValue = extractProperty(eventBlock, "DTSTART")
    const endValue = extractProperty(eventBlock, "DTEND")
    const summary = extractProperty(eventBlock, "SUMMARY") ?? ""

    if (!startValue) {
      continue
    }

    const start = parseIcalDateValue(startValue)
    const end = endValue ? parseIcalDateValue(endValue) : null

    if (!start || Number.isNaN(start.getTime())) {
      continue
    }

    if (!end || Number.isNaN(end.getTime())) {
      events.push({
        start,
        end: addDays(start, 1),
        summary
      })
      continue
    }

    events.push({ start, end, summary })
  }

  return events
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

/** Nuits indisponibles (DTSTART inclus, DTEND exclus — norme iCal). */
export function getBlockedNightDates(events: IcalEventRange[]) {
  const blocked = new Set<string>()

  for (const event of events) {
    if (classifyIcalStayKind(event.summary ?? "") === "block") {
      continue
    }

    const night = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())
    const lastNight = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())

    while (night < lastNight) {
      blocked.add(toIsoDate(night))
      night.setDate(night.getDate() + 1)
    }
  }

  return blocked
}

/** Blocage turnover Airbnb (ignoré) vs fermeture OTA réelle vs réservation voyageur. */
export function classifyIcalStayKind(summary: string): IcalStayKind {
  const normalized = summary.trim().toLowerCase()

  if (normalized.includes("airbnb") && normalized.includes("not available")) {
    return "block"
  }

  if (
    normalized.includes("closed") ||
    normalized.includes("indisponible") ||
    normalized.includes("blocked") ||
    normalized.includes("fermé") ||
    normalized.includes("ferme") ||
    normalized.includes("not available") ||
    normalized.includes("unavailable")
  ) {
    return "closure"
  }

  return "reservation"
}

/** Arrivée = DTSTART, départ = DTEND (jour de checkout, exclus des nuits occupées). */
export function icalEventToBookingRange(event: IcalEventRange) {
  const start = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())
  const end = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())

  return {
    arrival_date: toIsoDate(start),
    departure_date: toIsoDate(end),
    kind: classifyIcalStayKind(event.summary ?? "")
  }
}

export function mergeBlockedNightDates(sources: Iterable<Set<string>>) {
  const merged = new Set<string>()

  for (const source of sources) {
    for (const date of source) {
      merged.add(date)
    }
  }

  return [...merged].sort()
}
