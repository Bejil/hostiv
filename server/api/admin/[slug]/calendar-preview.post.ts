import { normalizeCalendarConfig } from "../../../../app/utils/calendar-config"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import { getMergedBlockedNightDates } from "../../../utils/calendar-blocked"
import { assertValidCalendarConfigFeeds } from "../../../utils/validate-calendar-config"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const body = await readBody(event)

  assertValidCalendarConfigFeeds(body as Parameters<typeof assertValidCalendarConfigFeeds>[0])

  const calendarConfig = normalizeCalendarConfig(body)
  const { dates, dateSources, feedBlocks, sources } = await getMergedBlockedNightDates(calendarConfig.ics_feeds)

  return {
    dates,
    dateSources,
    feedBlocks,
    fetchedAt: new Date().toISOString(),
    sources
  }
})
