import type { PropertyCalendarConfig } from "../../app/types/property-site"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { listAdminBookingReservations } from "./booking-reservation-repository"
import { getBlockedNightDates, mergeBlockedNightDates, parseIcalEvents } from "./ical"
import { getPropertyCalendarConfig } from "./property-site-repository"
import { enumerateStayNights } from "./stay-nights"
import { assertAllowedCalendarFeedUrl } from "./calendar-feed-url"

const FETCH_TIMEOUT_MS = 12_000

export const HOSTIV_MANUAL_BLOCK_SOURCE = "Blocage manuel"
export const HOSTIV_RESERVATION_BLOCK_SOURCE = "Réservation Hostiv"

async function fetchCalendarFeed(url: string) {
  assertAllowedCalendarFeedUrl(url)

  return await $fetch<string>(url, {
    timeout: FETCH_TIMEOUT_MS,
    responseType: "text",
    headers: {
      Accept: "text/calendar, text/plain, */*",
      "User-Agent": "TheGrandAppartement/1.0 (calendar-sync)"
    }
  })
}

type CalendarFeedInput = {
  name: string
  url: string
  enabled?: boolean
}

function normalizeFeedUrls(feeds?: CalendarFeedInput[]) {
  return (feeds ?? [])
    .filter((feed) => feed.enabled !== false)
    .map((feed) => ({
      name: feed.name.trim() || feed.url.trim(),
      url: feed.url.trim()
    }))
    .filter((feed) => feed.url)
}

function addDateSource(map: Record<string, string[]>, date: string, source: string) {
  const sources = map[date] ?? []

  if (!sources.includes(source)) {
    sources.push(source)
  }

  map[date] = sources
}

function sortDateSources(map: Record<string, string[]>) {
  for (const date of Object.keys(map)) {
    map[date].sort((a, b) => a.localeCompare(b, "fr"))
  }
}

async function getReservationBlockedNightDates(slug: string) {
  const reservations = await listAdminBookingReservations(slug)
  const dates = new Set<string>()

  for (const reservation of reservations) {
    if (reservation.status === "cancelled") {
      continue
    }

    for (const night of enumerateStayNights(reservation.arrival_date, reservation.departure_date)) {
      dates.add(night)
    }
  }

  return dates
}

export async function getMergedBlockedNightDates(feeds?: CalendarFeedInput[]) {
  const feedUrls = normalizeFeedUrls(feeds)
  const results = await Promise.allSettled(
    feedUrls.map(async (feed) => {
      const ics = await fetchCalendarFeed(feed.url)
      return {
        feed,
        dates: getBlockedNightDates(parseIcalEvents(ics))
      }
    })
  )

  const blockedSets: Set<string>[] = []
  const dateSources: Record<string, string[]> = {}
  const feedBlocks: Array<{ name: string; dates: string[] }> = []
  let failed = 0

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { feed, dates } = result.value
      const dateList = [...dates]

      feedBlocks.push({
        name: feed.name,
        dates: dateList
      })

      for (const date of dateList) {
        addDateSource(dateSources, date, feed.name)
      }

      blockedSets.push(dates)
    } else {
      failed += 1
    }
  }

  sortDateSources(dateSources)

  return {
    dates: mergeBlockedNightDates(blockedSets),
    dateSources,
    feedBlocks,
    sources: {
      total: feedUrls.length,
      succeeded: blockedSets.length,
      failed
    }
  }
}

export async function getPropertyBlockedNightDates(
  slug: string,
  calendarConfigInput?: Partial<PropertyCalendarConfig> | null
) {
  const calendarConfig = calendarConfigInput
    ? normalizeCalendarConfig(calendarConfigInput)
    : await getPropertyCalendarConfig(slug)

  const ical = await getMergedBlockedNightDates(calendarConfig.ics_feeds)
  const manualBlocks = new Set(calendarConfig.manual_blocks ?? [])
  const reservationBlocks = await getReservationBlockedNightDates(slug)
  const dateSources = { ...ical.dateSources }

  for (const date of manualBlocks) {
    addDateSource(dateSources, date, HOSTIV_MANUAL_BLOCK_SOURCE)
  }

  for (const date of reservationBlocks) {
    addDateSource(dateSources, date, HOSTIV_RESERVATION_BLOCK_SOURCE)
  }

  sortDateSources(dateSources)

  const dates = mergeBlockedNightDates([ical.dates, manualBlocks, reservationBlocks])

  return {
    dates,
    dateSources,
    feedBlocks: ical.feedBlocks,
    sources: ical.sources
  }
}

export async function getMergedBlockedNightDatesForProperty(slug: string) {
  const { dates, dateSources, feedBlocks, sources } = await getPropertyBlockedNightDates(slug)

  return {
    dates,
    dateSources,
    feedBlocks,
    sources
  }
}
