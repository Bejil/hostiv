import type { PropertyCalendarConfig, PropertyCalendarFeed } from "../types/property-site"

const ISO_INPUT_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const DEFAULT_CALENDAR_CONFIG: PropertyCalendarConfig = {
  ics_feeds: [],
  manual_blocks: []
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

function normalizeManualBlocks(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[]
  }

  const unique = new Set<string>()

  for (const item of value) {
    if (typeof item !== "string") {
      continue
    }

    const date = item.trim()

    if (ISO_INPUT_DATE_RE.test(date)) {
      unique.add(date)
    }
  }

  return [...unique].sort((a, b) => a.localeCompare(b))
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
      .filter((feed) => feed.name.trim() || feed.url.trim()),
    manual_blocks: normalizeManualBlocks(config?.manual_blocks)
  }
}
