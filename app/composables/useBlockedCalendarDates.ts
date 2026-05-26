export function useBlockedCalendarDates(slug?: Ref<string> | string) {
  const slugValue = computed(() => (typeof slug === "string" ? slug : slug?.value ?? "default"))
  const stateKey = typeof slug === "string" ? slug : slug?.value ?? "default"
  const blockedDates = useState<Set<string>>(`blocked-calendar-dates:${stateKey}`, () => new Set())
  const isLoading = useState(`blocked-calendar-dates-loading:${stateKey}`, () => false)
  const lastFetchedAt = useState<string | null>(
    `blocked-calendar-dates-fetched-at:${stateKey}`,
    () => null
  )

  async function refreshBlockedDates() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      const response = await $fetch<{
        dates: string[]
        fetchedAt: string
      }>("/api/calendar/blocked-dates", {
        query: slugValue.value === "default" ? undefined : { slug: slugValue.value }
      })

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
