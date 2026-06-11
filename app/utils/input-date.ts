import type { HostivLocale } from "../types/hostiv-locale"
import { adminDateLocaleTag } from "./admin-format-date"

const PARIS_DATE = new Intl.DateTimeFormat("fr-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
})

export function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  return new Date(year, month - 1, day)
}

export function compareInputDates(left: string, right: string) {
  return left.localeCompare(right)
}

export function parisInputDateFromDate(date: Date) {
  return PARIS_DATE.format(date)
}

export function parseInputDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  return { year, month, day }
}

export function formatDisplayDate(value: string, locale: HostivLocale = "fr") {
  return new Intl.DateTimeFormat(adminDateLocaleTag(locale), {
    day: "numeric",
    month: "short"
  }).format(fromInputDate(value))
}

export function formatLongDisplayDate(value: string, locale: HostivLocale = "fr") {
  return new Intl.DateTimeFormat(adminDateLocaleTag(locale), {
    day: "numeric",
    month: "long"
  }).format(fromInputDate(value))
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date)

  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export function addDaysToInputDate(value: string, days: number) {
  return toInputDate(addDays(fromInputDate(value), days))
}

export function daysBetweenInclusive(startDate: string, endDate: string) {
  const start = fromInputDate(startDate)
  const end = fromInputDate(endDate)
  const diffMs = end.getTime() - start.getTime()

  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
}
