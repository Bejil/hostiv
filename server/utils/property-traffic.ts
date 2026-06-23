import { createHash } from "node:crypto"
import type { H3Event } from "h3"
import type {
  PropertyTrafficDailyRow,
  PropertyTrafficMonthlyRow,
  PropertyTrafficReport
} from "../../app/types/property-traffic"
import { getClientIp } from "./rate-limit"
import { getPropertyIdBySlug } from "./property-cohost"
import { requireSupabaseAdmin } from "./supabase"

const PARIS_TIME_ZONE = "Europe/Paris"

function parisDateStringFromDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date)
}

export function parisTodayDateString(now = new Date()) {
  return parisDateStringFromDate(now)
}

function parseInputDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return value
}

function compareInputDates(left: string, right: string) {
  if (left === right) {
    return 0
  }

  return left < right ? -1 : 1
}

function addDaysToInputDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  date.setDate(date.getDate() + days)

  return parisDateStringFromDate(date)
}

function monthKeyFromDay(day: string) {
  return day.slice(0, 7)
}

function monthLabelFromKey(monthKey: string, locale: "fr" | "en" = "fr") {
  const [year, month] = monthKey.split("-").map(Number)

  if (!year || !month) {
    return monthKey
  }

  const date = new Date(Date.UTC(year, month - 1, 1, 12))

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date)
}

function isLikelyBotUserAgent(userAgent: string) {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|wget|curl/i.test(userAgent)
}

export function buildPropertyTrafficVisitorHash(event: H3Event, day = parisTodayDateString()) {
  const ip = getClientIp(event)
  const userAgent = String(getHeader(event, "user-agent") || "")
  const secret = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "hostiv-traffic").trim()

  return createHash("sha256")
    .update(`${ip}|${userAgent}|${day}|${secret}`)
    .digest("hex")
    .slice(0, 40)
}

export async function recordPropertyPageView(input: {
  slug: string
  visitorHash: string
  userAgent?: string
  day?: string
}) {
  const slug = input.slug.trim().toLowerCase()

  if (!slug) {
    return { recorded: false as const }
  }

  if (isLikelyBotUserAgent(String(input.userAgent || ""))) {
    return { recorded: false as const }
  }

  const propertyId = await getPropertyIdBySlug(slug)

  if (!propertyId) {
    return { recorded: false as const }
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("published")
    .eq("id", propertyId)
    .maybeSingle()

  if (propertyError) {
    console.error("[property-traffic] read property:", propertyError.message)

    return { recorded: false as const }
  }

  if (!property?.published) {
    return { recorded: false as const }
  }

  const day = parseInputDate(input.day || parisTodayDateString()) || parisTodayDateString()

  const { error } = await supabase.rpc("record_property_traffic", {
    p_property_id: propertyId,
    p_day: day,
    p_visitor_hash: input.visitorHash
  })

  if (error) {
    console.error("[property-traffic] record:", error.message)

    return { recorded: false as const }
  }

  return { recorded: true as const }
}

export async function getPropertyTrafficReport(input: {
  slug: string
  startDate?: string | null
  endDate?: string | null
  locale?: "fr" | "en"
}): Promise<PropertyTrafficReport> {
  const slug = input.slug.trim().toLowerCase()
  const propertyId = await getPropertyIdBySlug(slug)

  if (!propertyId) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const today = parisTodayDateString()
  const endDate = parseInputDate(String(input.endDate || today).trim()) || today
  let startDate =
    parseInputDate(String(input.startDate || addDaysToInputDate(endDate, -29)).trim()) ||
    addDaysToInputDate(endDate, -29)

  if (compareInputDates(startDate, endDate) > 0) {
    startDate = endDate
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("property_traffic_daily")
    .select("day, page_views, unique_visitors")
    .eq("property_id", propertyId)
    .gte("day", startDate)
    .lte("day", endDate)
    .order("day", { ascending: true })

  if (error) {
    console.error("[property-traffic] report:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les statistiques de trafic."
    })
  }

  const rows = (data ?? []).map((row) => ({
    day: String(row.day),
    page_views: Number(row.page_views || 0),
    unique_visitors: Number(row.unique_visitors || 0)
  })) satisfies PropertyTrafficDailyRow[]

  const daily = fillMissingTrafficDays(rows, startDate, endDate)

  const totals = daily.reduce(
    (acc, row) => {
      acc.page_views += row.page_views

      return acc
    },
    { page_views: 0, unique_visitors: 0 }
  )

  const { count: uniqueVisitorsCount, error: uniqueError } = await supabase
    .from("property_traffic_visitor_daily")
    .select("visitor_hash", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .gte("day", startDate)
    .lte("day", endDate)

  if (uniqueError) {
    console.error("[property-traffic] unique count:", uniqueError.message)
  }

  totals.unique_visitors = uniqueVisitorsCount ?? daily.reduce((sum, row) => sum + row.unique_visitors, 0)

  const monthlyMap = new Map<string, PropertyTrafficMonthlyRow & { visitor_hashes?: Set<string> }>()

  for (const row of daily) {
    const monthKey = monthKeyFromDay(row.day)
    const current = monthlyMap.get(monthKey) ?? {
      month_key: monthKey,
      label: monthLabelFromKey(monthKey, input.locale ?? "fr"),
      page_views: 0,
      unique_visitors: 0
    }

    current.page_views += row.page_views
    monthlyMap.set(monthKey, current)
  }

  const { data: visitorRows, error: visitorRowsError } = await supabase
    .from("property_traffic_visitor_daily")
    .select("day, visitor_hash")
    .eq("property_id", propertyId)
    .gte("day", startDate)
    .lte("day", endDate)

  if (visitorRowsError) {
    console.error("[property-traffic] visitor rows:", visitorRowsError.message)
  }

  for (const row of visitorRows ?? []) {
    const monthKey = monthKeyFromDay(String(row.day))
    const current = monthlyMap.get(monthKey)

    if (!current) {
      continue
    }

    if (!("visitor_hashes" in current) || !(current.visitor_hashes instanceof Set)) {
      current.visitor_hashes = new Set<string>()
    }

    current.visitor_hashes.add(String(row.visitor_hash))
  }

  const monthly = [...monthlyMap.values()].map(({ visitor_hashes, ...month }) => ({
    ...month,
    unique_visitors: visitor_hashes?.size ?? 0
  }))

  return {
    date_range: {
      start_date: startDate,
      end_date: endDate
    },
    totals,
    daily,
    monthly
  }
}

function fillMissingTrafficDays(rows: PropertyTrafficDailyRow[], startDate: string, endDate: string) {
  const byDay = new Map(rows.map((row) => [row.day, row] as const))
  const filled: PropertyTrafficDailyRow[] = []

  let cursor = startDate

  while (compareInputDates(cursor, endDate) <= 0) {
    filled.push(
      byDay.get(cursor) ?? {
        day: cursor,
        page_views: 0,
        unique_visitors: 0
      }
    )

    cursor = addDaysToInputDate(cursor, 1)
  }

  return filled
}

export function shouldSkipPropertyTrafficTracking(event: H3Event) {
  const userAgent = String(getHeader(event, "user-agent") || "")

  return isLikelyBotUserAgent(userAgent)
}
