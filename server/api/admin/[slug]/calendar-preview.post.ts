import { normalizeCalendarConfig } from "../../../../app/utils/calendar-config"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import { getPropertyBlockedNightDates } from "../../../utils/calendar-blocked"
import { assertValidCalendarConfig } from "../../../utils/validate-calendar-config"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const body = await readBody(event)

  assertValidCalendarConfig(body as Parameters<typeof assertValidCalendarConfig>[0])

  const calendarConfig = normalizeCalendarConfig(body)
  const { dates, bookingRanges, manualBlocks, otaReservationRanges, dateSources, feedBlocks, sources } =
    await getPropertyBlockedNightDates(slug, calendarConfig)

  return {
    dates,
    bookingRanges,
    manualBlocks,
    otaReservationRanges,
    dateSources,
    feedBlocks,
    fetchedAt: new Date().toISOString(),
    sources
  }
})
