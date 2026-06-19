import type { PropertyCalendarConfig } from "../../app/types/property-site"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { assertAllowedCalendarFeedUrl } from "./calendar-feed-url"

const ISO_INPUT_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function assertValidCalendarConfig(config: Partial<PropertyCalendarConfig> | null | undefined) {
  const normalized = normalizeCalendarConfig(config)

  for (const feed of normalized.ics_feeds) {
    if (feed.enabled === false || !feed.url.trim()) {
      continue
    }

    assertAllowedCalendarFeedUrl(feed.url)
  }

  for (const date of normalized.manual_blocks ?? []) {
    if (!ISO_INPUT_DATE_RE.test(date)) {
      throw createError({
        statusCode: 400,
        message: "Date de blocage manuel invalide."
      })
    }
  }
}

/** @deprecated Utiliser assertValidCalendarConfig */
export function assertValidCalendarConfigFeeds(config: Partial<PropertyCalendarConfig> | null | undefined) {
  assertValidCalendarConfig(config)
}
