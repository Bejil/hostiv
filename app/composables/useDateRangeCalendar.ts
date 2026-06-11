import type { Ref } from "vue"
import type { HostivLocale } from "../types/hostiv-locale"
import { adminDateLocaleTag } from "../utils/admin-format-date"
import {
  addMonths,
  compareInputDates,
  fromInputDate,
  startOfMonth,
  toInputDate
} from "../utils/input-date"

export type DateRangeValue = {
  startDate: string
  endDate: string
}

export type DateRangeSelectionStep = "start" | "end"

function resolveAnchorDate(startDate: string, endDate: string, maxDate: string) {
  const startTrim = startDate.trim()
  const endTrim = endDate.trim()

  if (startTrim) {
    return startTrim
  }

  if (endTrim) {
    return endTrim
  }

  return maxDate
}

export function useDateRangeCalendar(options: {
  startDate: Ref<string>
  endDate: Ref<string>
  maxDate: Ref<string>
  locale?: Ref<HostivLocale>
}) {
  const activeStep = ref<DateRangeSelectionStep>("start")
  const visibleCalendarMonth = ref(
    startOfMonth(
      fromInputDate(resolveAnchorDate(options.startDate.value, options.endDate.value, options.maxDate.value))
    )
  )

  const calendarWeekdayLabels = computed(() => {
    const locale = options.locale?.value ?? "fr"

    return locale === "en"
      ? (["M", "T", "W", "T", "F", "S", "S"] as const)
      : (["L", "M", "M", "J", "V", "S", "D"] as const)
  })

  const visibleCalendarMonths = computed(() => [
    visibleCalendarMonth.value,
    addMonths(visibleCalendarMonth.value, 1)
  ])

  const canGoToNextCalendarMonth = computed(() => {
    const nextMonth = addMonths(visibleCalendarMonth.value, 2)
    const nextMonthStart = toInputDate(nextMonth)

    return compareInputDates(nextMonthStart, options.maxDate.value) <= 0
  })

  function openCalendarAtStart() {
    activeStep.value = "start"
    visibleCalendarMonth.value = startOfMonth(
      fromInputDate(
        resolveAnchorDate(options.startDate.value, options.endDate.value, options.maxDate.value)
      )
    )
  }

  function showMonthForDate(isoDate: string) {
    visibleCalendarMonth.value = startOfMonth(fromInputDate(isoDate))
  }

  function shiftCalendarMonths(delta: number) {
    if (delta > 0 && !canGoToNextCalendarMonth.value) {
      return
    }

    visibleCalendarMonth.value = addMonths(visibleCalendarMonth.value, delta)
  }

  function isDateDisabled(isoDate: string) {
    return compareInputDates(isoDate, options.maxDate.value) > 0
  }

  function selectCalendarDate(isoDate: string) {
    if (isDateDisabled(isoDate)) {
      return false
    }

    if (activeStep.value === "start") {
      options.startDate.value = isoDate

      const endTrim = options.endDate.value.trim()

      if (!endTrim || compareInputDates(endTrim, isoDate) < 0) {
        options.endDate.value = isoDate
      }

      activeStep.value = "end"
      return false
    }

    if (compareInputDates(isoDate, options.startDate.value) < 0) {
      options.startDate.value = isoDate
      options.endDate.value = isoDate
      activeStep.value = "end"
      return false
    }

    options.endDate.value = isoDate
    activeStep.value = "start"

    return true
  }

  function buildCalendarDays(month: Date) {
    const monthStart = startOfMonth(month)
    const startWeekday = (monthStart.getDay() + 6) % 7
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

    const days: Array<{
      key: string
      label: string
      isoDate: string | null
      isDisabled: boolean
      isStart: boolean
      isEnd: boolean
      isInRange: boolean
      isRangeEdge: boolean
    }> = []

    for (let index = 0; index < startWeekday; index += 1) {
      days.push({
        key: `empty-${month.getFullYear()}-${month.getMonth()}-${index}`,
        label: "",
        isoDate: null,
        isDisabled: true,
        isStart: false,
        isEnd: false,
        isInRange: false,
        isRangeEdge: false
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const isoDate = toInputDate(new Date(month.getFullYear(), month.getMonth(), day))
      const isDisabled = isDateDisabled(isoDate)
      const startTrim = options.startDate.value.trim()
      const endTrim = options.endDate.value.trim()
      const isStart = Boolean(startTrim) && isoDate === startTrim
      const isEnd = Boolean(endTrim) && isoDate === endTrim
      const isInRange =
        Boolean(startTrim && endTrim) &&
        compareInputDates(isoDate, startTrim) > 0 &&
        compareInputDates(isoDate, endTrim) < 0

      days.push({
        key: isoDate,
        label: String(day),
        isoDate,
        isDisabled,
        isStart,
        isEnd,
        isInRange,
        isRangeEdge: isStart || isEnd
      })
    }

    return days
  }

  function formatCalendarMonth(date: Date) {
    const localeTag = adminDateLocaleTag(options.locale?.value ?? "fr")
    const label = new Intl.DateTimeFormat(localeTag, {
      month: "long",
      year: "numeric"
    }).format(date)

    return label.charAt(0).toUpperCase() + label.slice(1)
  }

  return {
    activeStep,
    calendarWeekdayLabels,
    visibleCalendarMonths,
    canGoToNextCalendarMonth,
    openCalendarAtStart,
    showMonthForDate,
    shiftCalendarMonths,
    selectCalendarDate,
    buildCalendarDays,
    formatCalendarMonth
  }
}
