import {
  getMergedBlockedNightDates,
  getMergedBlockedNightDatesForProperty
} from "../../utils/calendar-blocked"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slug = typeof query.slug === "string" ? query.slug.trim() : ""
  const result = slug
    ? await getMergedBlockedNightDatesForProperty(slug)
    : await getMergedBlockedNightDates()

  return {
    dates: result.dates,
    bookingRanges: "bookingRanges" in result ? result.bookingRanges : [],
    manualBlocks: "manualBlocks" in result ? result.manualBlocks : [],
    fetchedAt: new Date().toISOString(),
    sources: result.sources
  }
})
