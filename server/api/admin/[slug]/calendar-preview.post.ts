import type { PropertyCalendarConfig } from "../../../../app/types/property-site"
import { normalizeCalendarConfig } from "../../../../app/utils/calendar-config"
import { getMergedBlockedNightDates } from "../../../utils/calendar-blocked"
import { requirePropertyOwner } from "../../../utils/admin-auth"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const body = await readBody<Partial<PropertyCalendarConfig>>(event)
  const calendarConfig = normalizeCalendarConfig(body)
  const { dates, sources } = await getMergedBlockedNightDates(calendarConfig.ics_feeds)

  return {
    dates,
    fetchedAt: new Date().toISOString(),
    sources
  }
})
