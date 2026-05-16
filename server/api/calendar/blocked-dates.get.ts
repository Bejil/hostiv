import { getMergedBlockedNightDates } from "../../utils/calendar-blocked"

export default defineEventHandler(async () => {
  const { dates, sources } = await getMergedBlockedNightDates()

  return {
    dates,
    fetchedAt: new Date().toISOString(),
    sources
  }
})
