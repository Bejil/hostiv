import {
  applyBookingRangeAvailability,
  type BookingStayRange
} from "../utils/booking-turnover-gaps"

const BLOCKED_DATES_STATE_VERSION = "v6"

export function useBlockedCalendarDates(slug?: Ref<string> | string) {
  const slugValue = computed(() => (typeof slug === "string" ? slug : slug?.value ?? "default"))
  const stateKey = `${BLOCKED_DATES_STATE_VERSION}:${typeof slug === "string" ? slug : slug?.value ?? "default"}`
  const blockedDates = useState<Set<string>>(`blocked-calendar-dates:${stateKey}`, () => new Set())
  const bookingRanges = useState<BookingStayRange[]>(`blocked-calendar-ranges:${stateKey}`, () => [])
  const isLoading = useState(`blocked-calendar-dates-loading:${stateKey}`, () => false)
  const lastFetchedAt = useState<string | null>(
    `blocked-calendar-dates-fetched-at:${stateKey}`,
    () => null
  )

  function applyAvailability(
    ranges: BookingStayRange[],
    manualBlocks: string[],
    fallbackDates: string[]
  ) {
    if (ranges.length > 0) {
      blockedDates.value = applyBookingRangeAvailability(ranges, manualBlocks)
      return
    }

    blockedDates.value = new Set(fallbackDates)
  }

  async function refreshBlockedDates() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      const response = await $fetch<{
        dates: string[]
        bookingRanges?: BookingStayRange[]
        manualBlocks?: string[]
        fetchedAt: string
      }>("/api/calendar/blocked-dates", {
        query: slugValue.value === "default" ? undefined : { slug: slugValue.value },
        cache: "no-store"
      })

      const ranges = response.bookingRanges ?? []
      const manualBlocks = response.manualBlocks ?? []

      bookingRanges.value = ranges
      applyAvailability(ranges, manualBlocks, response.dates)
      lastFetchedAt.value = response.fetchedAt
    } catch {
      blockedDates.value = new Set()
      bookingRanges.value = []
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
    bookingRanges,
    isLoading,
    lastFetchedAt,
    refreshBlockedDates,
    isNightBlocked
  }
}
