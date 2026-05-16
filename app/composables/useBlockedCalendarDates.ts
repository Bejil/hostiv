export function useBlockedCalendarDates() {
  const blockedDates = useState<Set<string>>("blocked-calendar-dates", () => new Set())
  const isLoading = useState("blocked-calendar-dates-loading", () => false)
  const lastFetchedAt = useState<string | null>("blocked-calendar-dates-fetched-at", () => null)

  async function refreshBlockedDates() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      const response = await $fetch<{
        dates: string[]
        fetchedAt: string
      }>("/api/calendar/blocked-dates")

      blockedDates.value = new Set(response.dates)
      lastFetchedAt.value = response.fetchedAt
    } catch {
      blockedDates.value = new Set()
      lastFetchedAt.value = null
    } finally {
      isLoading.value = false
    }
  }

  function isNightBlocked(isoDate: string) {
    return blockedDates.value.has(isoDate)
  }

  return {
    blockedDates,
    isLoading,
    lastFetchedAt,
    refreshBlockedDates,
    isNightBlocked
  }
}
