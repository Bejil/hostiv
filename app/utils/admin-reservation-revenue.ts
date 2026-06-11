import type { AdminBookingReservation } from "../types/booking-reservation"
import type { HostivLocale } from "../types/hostiv-locale"
import { adminDateLocaleTag } from "./admin-format-date"
import {
  compareInputDates,
  parseInputDate,
  parisInputDateFromDate
} from "./input-date"

export type ReservationRevenueMonth = {
  monthKey: string
  label: string
  reservationCount: number
  grossEur: number
  netEur: number | null
}

export type ReservationRevenueDateRange = {
  startDate: string
  endDate: string
}

export type ReservationRevenueSummary = {
  months: ReservationRevenueMonth[]
  totalGrossEur: number
  totalNetEur: number | null
  totalReservationCount: number
  hasData: boolean
  dateRange: ReservationRevenueDateRange
}

function monthLabelFormatter(locale: HostivLocale) {
  return new Intl.DateTimeFormat(adminDateLocaleTag(locale), {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris"
  })
}

function monthKeyFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")

  return `${year}-${month}`
}

function monthKeyFromIso(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit"
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value

  if (!year || !month) {
    return null
  }

  return `${year}-${month}`
}

function paymentDateFromIso(iso: string) {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return parisInputDateFromDate(date)
}

function monthLabelFromKey(monthKey: string, locale: HostivLocale = "fr") {
  const [year, month] = monthKey.split("-").map(Number)

  if (!year || !month) {
    return monthKey
  }

  const label = monthLabelFormatter(locale).format(new Date(year, month - 1, 1))

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function buildMonthWindow(count: number) {
  const keys: string[] = []
  const now = new Date()

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)

    keys.push(monthKeyFromDate(date))
  }

  return keys
}

function normalizeDateRange(range: ReservationRevenueDateRange): ReservationRevenueDateRange {
  const start = parseInputDate(range.startDate)
  const end = parseInputDate(range.endDate)

  if (!start || !end) {
    return defaultRevenueDateRange()
  }

  const startValue = range.startDate
  const endValue = range.endDate

  if (compareInputDates(startValue, endValue) <= 0) {
    return { startDate: startValue, endDate: endValue }
  }

  return { startDate: endValue, endDate: startValue }
}

function buildMonthKeysFromRange(range: ReservationRevenueDateRange) {
  const normalized = normalizeDateRange(range)
  const start = parseInputDate(normalized.startDate)
  const end = parseInputDate(normalized.endDate)

  if (!start || !end) {
    return buildMonthWindow(12).reverse()
  }

  const keys: string[] = []
  let year = start.year
  let month = start.month
  const endKey = `${end.year}-${String(end.month).padStart(2, "0")}`
  let guard = 0

  while (guard < 240) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`

    keys.push(monthKey)

    if (monthKey === endKey) {
      break
    }

    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }

    guard += 1
  }

  return keys
}

export function buildRecentMonthsDateRange(
  monthCount: number,
  maxDate: string = parisInputDateFromDate(new Date())
): ReservationRevenueDateRange {
  const monthKeys = buildMonthWindow(monthCount)
  const oldestMonthKey = monthKeys[monthKeys.length - 1] ?? monthKeyFromDate(new Date())

  return {
    startDate: `${oldestMonthKey}-01`,
    endDate: maxDate
  }
}

export function defaultRevenueDateRange(): ReservationRevenueDateRange {
  return buildRecentMonthsDateRange(12)
}

function isRevenueReservation(reservation: AdminBookingReservation) {
  return reservation.status === "confirmed" && !reservation.refunded_at
}

function applyPlatformFee(grossEur: number, platformFeePercent?: number) {
  if (!platformFeePercent || platformFeePercent <= 0) {
    return null
  }

  return grossEur * (1 - platformFeePercent / 100)
}

export function buildReservationRevenueByMonth(
  reservations: AdminBookingReservation[],
  options?: {
    platformFeePercent?: number
    dateRange?: ReservationRevenueDateRange
    locale?: HostivLocale
  }
): ReservationRevenueSummary {
  const locale = options?.locale ?? "fr"
  const dateRange = normalizeDateRange(options?.dateRange ?? defaultRevenueDateRange())
  const monthKeys = buildMonthKeysFromRange(dateRange)

  const buckets = new Map<string, { grossEur: number; reservationCount: number }>()

  for (const monthKey of monthKeys) {
    buckets.set(monthKey, { grossEur: 0, reservationCount: 0 })
  }

  let totalGrossEur = 0
  let totalReservationCount = 0

  for (const reservation of reservations) {
    if (!isRevenueReservation(reservation)) {
      continue
    }

    const paymentDate = paymentDateFromIso(reservation.created_at)

    if (
      !paymentDate ||
      compareInputDates(paymentDate, dateRange.startDate) < 0 ||
      compareInputDates(paymentDate, dateRange.endDate) > 0
    ) {
      continue
    }

    const monthKey = monthKeyFromIso(reservation.created_at)

    if (!monthKey || !buckets.has(monthKey)) {
      continue
    }

    const bucket = buckets.get(monthKey)

    if (!bucket) {
      continue
    }

    bucket.grossEur += reservation.total_eur
    bucket.reservationCount += 1
    totalGrossEur += reservation.total_eur
    totalReservationCount += 1
  }

  const months = [...monthKeys]
    .reverse()
    .map((monthKey) => {
      const bucket = buckets.get(monthKey) ?? { grossEur: 0, reservationCount: 0 }
      const grossEur = Math.round(bucket.grossEur)
      const netEur = applyPlatformFee(grossEur, options?.platformFeePercent)

      return {
        monthKey,
        label: monthLabelFromKey(monthKey, locale),
        reservationCount: bucket.reservationCount,
        grossEur,
        netEur: netEur === null ? null : Math.round(netEur)
      }
    })

  const totalNetEur = applyPlatformFee(totalGrossEur, options?.platformFeePercent)

  return {
    months,
    totalGrossEur: Math.round(totalGrossEur),
    totalNetEur: totalNetEur === null ? null : Math.round(totalNetEur),
    totalReservationCount,
    hasData: totalReservationCount > 0,
    dateRange
  }
}

export function formatRevenueDateRangeLabel(
  range: ReservationRevenueDateRange,
  locale: HostivLocale = "fr"
) {
  const formatter = new Intl.DateTimeFormat(adminDateLocaleTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Paris"
  })

  const start = parseInputDate(range.startDate)
  const end = parseInputDate(range.endDate)

  if (!start || !end) {
    return ""
  }

  const startLabel = formatter.format(new Date(start.year, start.month - 1, start.day))
  const endLabel = formatter.format(new Date(end.year, end.month - 1, end.day))

  return `${startLabel} → ${endLabel}`
}
