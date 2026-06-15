import type { PropertyCalendarConfig } from "../../app/types/property-site"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { assertAllowedCalendarFeedUrl } from "./calendar-feed-url"

export function assertValidCalendarConfigFeeds(config: Partial<PropertyCalendarConfig> | null | undefined) {
  const normalized = normalizeCalendarConfig(config)

  for (const feed of normalized.ics_feeds) {
    if (feed.enabled === false || !feed.url.trim()) {
      continue
    }

    assertAllowedCalendarFeedUrl(feed.url)
  }
}
