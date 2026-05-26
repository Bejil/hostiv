import { getBlockedNightDates, mergeBlockedNightDates, parseIcalEvents } from "./ical"
import { getPropertyCalendarConfig } from "./property-site-repository"

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
  let failed = 0

  for (const result of results) {
    if (result.status === "fulfilled") {
      blockedSets.push(result.value.dates)
    } else {
      failed += 1
    }
  }

  return {
    dates: mergeBlockedNightDates(blockedSets),
    sources: {
      total: feedUrls.length,
      succeeded: blockedSets.length,
      failed
    }
  }
}

export async function getMergedBlockedNightDatesForProperty(slug: string) {
  const calendarConfig = await getPropertyCalendarConfig(slug)

  return getMergedBlockedNightDates(calendarConfig.ics_feeds)
}
