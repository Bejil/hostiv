import { CALENDAR_FEED_URLS } from "./calendar-feeds"
import { getBlockedNightDates, mergeBlockedNightDates, parseIcalEvents } from "./ical"

const FETCH_TIMEOUT_MS = 12_000

async function fetchCalendarFeed(url: string) {
  return await $fetch<string>(url, {
    timeout: FETCH_TIMEOUT_MS,
    responseType: "text",
    headers: {
      Accept: "text/calendar, text/plain, */*",
      "User-Agent": "TheGrandAppartement/1.0 (calendar-sync)"
    }
  })
}

export async function getMergedBlockedNightDates() {
  const results = await Promise.allSettled(
    CALENDAR_FEED_URLS.map(async (url) => {
      const ics = await fetchCalendarFeed(url)
      return getBlockedNightDates(parseIcalEvents(ics))
    })
  )

  const blockedSets: Set<string>[] = []
  let failed = 0

  for (const result of results) {
    if (result.status === "fulfilled") {
      blockedSets.push(result.value)
    } else {
      failed += 1
    }
  }

  return {
    dates: mergeBlockedNightDates(blockedSets),
    sources: {
      total: CALENDAR_FEED_URLS.length,
      succeeded: blockedSets.length,
      failed
    }
  }
}
