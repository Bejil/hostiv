import {
  getMergedBlockedNightDates,
  getMergedBlockedNightDatesForProperty
} from "../../utils/calendar-blocked"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slug = typeof query.slug === "string" ? query.slug.trim() : ""
  const { dates, sources } = slug
    ? await getMergedBlockedNightDatesForProperty(slug)
    : await getMergedBlockedNightDates()

  return {
    dates,
    fetchedAt: new Date().toISOString(),
    sources
  }
})
