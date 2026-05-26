import type { PropertyCalendarConfig, PropertyCalendarFeed } from "../types/property-site"

export const DEFAULT_CALENDAR_CONFIG: PropertyCalendarConfig = {
  ics_feeds: []
}

function asText(value: unknown) {
  return typeof value === "string" ? value : ""
}

function createFeedId(index: number, seed: string) {
  const slug = seed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || `ics-${index + 1}`
}

export function normalizeCalendarConfig(config: Partial<PropertyCalendarConfig> | null | undefined): PropertyCalendarConfig {
  const feeds = Array.isArray(config?.ics_feeds) ? config.ics_feeds : DEFAULT_CALENDAR_CONFIG.ics_feeds

  return {
    ics_feeds: feeds
      .map((feed, index): PropertyCalendarFeed => {
        const name = asText(feed?.name)
        const url = asText(feed?.url)

        return {
          id: asText(feed?.id) || createFeedId(index, name || url),
          name,
          url,
          enabled: typeof feed?.enabled === "boolean" ? feed.enabled : true
        }
      })
      .filter((feed) => feed.name.trim() || feed.url.trim())
  }
}
