import type { PropertyCalendarConfig } from "../../app/types/property-site"
import {
  applyBookingRangeAvailability,
  type BookingStayRange
} from "../../app/utils/booking-turnover-gaps"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { listAdminBookingReservations } from "./booking-reservation-repository"
import {
  getBlockedNightDates,
  icalEventToBookingRange,
  mergeBlockedNightDates,
  parseIcalEvents
} from "./ical"
import { getPropertyCalendarConfig } from "./property-site-repository"
import { enumerateStayNights } from "./stay-nights"
import { assertAllowedCalendarFeedUrl } from "./calendar-feed-url"

const FETCH_TIMEOUT_MS = 12_000

export const HOSTIV_MANUAL_BLOCK_SOURCE = "Blocage manuel"
export const HOSTIV_RESERVATION_BLOCK_SOURCE = "Réservation Hostiv"

export type { BookingStayRange }

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

function collectHostivBookingRanges(
  reservations: Array<BookingStayRange & { status: string }>
): BookingStayRange[] {
  return reservations
    .filter((reservation) => reservation.status !== "cancelled")
    .map((reservation) => ({
      arrival_date: reservation.arrival_date,
      departure_date: reservation.departure_date,
      kind: "reservation" as const
    }))
}

async function fetchIcalFeedData(feeds?: CalendarFeedInput[]) {
  const feedUrls = normalizeFeedUrls(feeds)
  const results = await Promise.allSettled(
    feedUrls.map(async (feed) => {
      const ics = await fetchCalendarFeed(feed.url)
      const events = parseIcalEvents(ics)

      return {
        feed,
        events,
        dates: getBlockedNightDates(events),
        bookingRanges: events.map((event) => icalEventToBookingRange(event))
      }
    })
  )

  const blockedSets: Set<string>[] = []
  const bookingRanges: BookingStayRange[] = []
  const dateSources: Record<string, string[]> = {}
  const feedBlocks: Array<{ name: string; dates: string[] }> = []
  let failed = 0

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { feed, dates, bookingRanges: feedRanges } = result.value
      const dateList = [...dates]

      feedBlocks.push({
        name: feed.name,
        dates: dateList
      })

      for (const date of dateList) {
        addDateSource(dateSources, date, feed.name)
      }

      blockedSets.push(dates)
      bookingRanges.push(...feedRanges)
    } else {
      failed += 1
    }
  }

  sortDateSources(dateSources)

  return {
    dates: mergeBlockedNightDates(blockedSets),
    bookingRanges,
    dateSources,
    feedBlocks,
    sources: {
      total: feedUrls.length,
      succeeded: blockedSets.length,
      failed
    }
  }
}

export async function getMergedBlockedNightDates(feeds?: CalendarFeedInput[]) {
  const { dates, dateSources, feedBlocks, sources } = await fetchIcalFeedData(feeds)

  return {
    dates,
    dateSources,
    feedBlocks,
    sources
  }
}

export async function getPropertyBlockedNightDates(
  slug: string,
  calendarConfigInput?: Partial<PropertyCalendarConfig> | null
) {
  const calendarConfig = calendarConfigInput
    ? normalizeCalendarConfig(calendarConfigInput)
    : await getPropertyCalendarConfig(slug)

  const ical = await fetchIcalFeedData(calendarConfig.ics_feeds)
  const manualBlocks = calendarConfig.manual_blocks ?? []
  const reservations = await listAdminBookingReservations(slug)
  const hostivRanges = collectHostivBookingRanges(reservations)
  const bookingRanges = [...hostivRanges, ...ical.bookingRanges]
  const dateSources = { ...ical.dateSources }

  for (const date of manualBlocks) {
    addDateSource(dateSources, date, HOSTIV_MANUAL_BLOCK_SOURCE)
  }

  for (const range of hostivRanges) {
    for (const night of enumerateStayNights(range.arrival_date, range.departure_date)) {
      addDateSource(dateSources, night, HOSTIV_RESERVATION_BLOCK_SOURCE)
    }
  }

  sortDateSources(dateSources)

  const mergedBlocked = applyBookingRangeAvailability(bookingRanges, manualBlocks)

  for (const date of Object.keys(dateSources)) {
    if (!mergedBlocked.has(date)) {
      delete dateSources[date]
    }
  }

  const dates = [...mergedBlocked].sort()
  const otaReservationRanges = ical.bookingRanges.filter((range) => range.kind === "reservation")

  return {
    dates,
    bookingRanges,
    manualBlocks,
    otaReservationRanges,
    dateSources,
    feedBlocks: ical.feedBlocks,
    sources: ical.sources
  }
}

export async function getMergedBlockedNightDatesForProperty(slug: string) {
  const {
    dates,
    bookingRanges,
    manualBlocks,
    otaReservationRanges,
    dateSources,
    feedBlocks,
    sources
  } = await getPropertyBlockedNightDates(slug)

  return {
    dates,
    bookingRanges,
    manualBlocks,
    otaReservationRanges,
    dateSources,
    feedBlocks,
    sources
  }
}
