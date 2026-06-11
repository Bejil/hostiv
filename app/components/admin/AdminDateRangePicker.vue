<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import { useDateRangeCalendar } from "../../composables/useDateRangeCalendar"
import type { DateRangeValue } from "../../composables/useDateRangeCalendar"
import {
  daysBetweenInclusive,
  formatDisplayDate,
  formatLongDisplayDate,
  parisInputDateFromDate
} from "../../utils/input-date"

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const props = withDefaults(
  defineProps<{
    modelValue: DateRangeValue
    label?: string
    maxDate?: string
    /** Autorise une période vide (aucun filtre de dates). */
    optional?: boolean
    emptySummary?: string
  }>(),
  {
    label: undefined,
    maxDate: undefined,
    optional: false,
    emptySummary: undefined
  }
)

const effectiveLabel = computed(() => props.label ?? ext.value.dateRange.defaultLabel)
const effectiveEmptySummary = computed(
  () => props.emptySummary ?? ext.value.dateRange.emptySummary
)

const emit = defineEmits<{
  "update:modelValue": [value: DateRangeValue]
}>()

const rootRef = ref<HTMLElement | null>(null)
const open = ref(false)

const startDate = ref(props.modelValue.startDate)
const endDate = ref(props.modelValue.endDate)

const maxDateValue = computed(() => props.maxDate ?? parisInputDateFromDate(new Date()))

const {
  activeStep,
  calendarWeekdayLabels,
  visibleCalendarMonths,
  canGoToNextCalendarMonth,
  openCalendarAtStart,
  shiftCalendarMonths,
  selectCalendarDate,
  buildCalendarDays,
  formatCalendarMonth
} = useDateRangeCalendar({
  startDate,
  endDate,
  maxDate: maxDateValue,
  locale
})

const hasCompleteRange = computed(
  () => Boolean(startDate.value.trim() && endDate.value.trim())
)

const summary = computed(() => {
  const startTrim = startDate.value.trim()
  const endTrim = endDate.value.trim()

  if (props.optional && !startTrim && !endTrim) {
    return effectiveEmptySummary.value
  }

  if (!startTrim || !endTrim) {
    const startLabel = startTrim ? formatDisplayDate(startTrim, locale.value) : "…"
    const endLabel = endTrim ? formatDisplayDate(endTrim, locale.value) : "…"

    return `${startLabel} – ${endLabel}`
  }

  return `${formatDisplayDate(startTrim, locale.value)} – ${formatDisplayDate(endTrim, locale.value)}`
})

const meta = computed(() => {
  if (!hasCompleteRange.value) {
    return ""
  }

  const days = daysBetweenInclusive(startDate.value, endDate.value)

  return days > 1
    ? adminUiFormat(ext.value.dateRange.days, { count: days })
    : ext.value.dateRange.dayOne
})

const canClearRange = computed(
  () => props.optional && Boolean(startDate.value.trim() || endDate.value.trim())
)

function formatChipDate(value: string) {
  const trimmed = value.trim()

  return trimmed ? formatLongDisplayDate(trimmed, locale.value) : "—"
}

function clearRange() {
  startDate.value = ""
  endDate.value = ""
  emitRange()
  closePopover()
}

watch(
  () => props.modelValue,
  (value) => {
    startDate.value = value.startDate
    endDate.value = value.endDate
  },
  { deep: true }
)

function emitRange() {
  emit("update:modelValue", {
    startDate: startDate.value,
    endDate: endDate.value
  })
}

function toggleOpen() {
  open.value = !open.value

  if (open.value) {
    openCalendarAtStart()
  }
}

function closePopover() {
  open.value = false
}

function onSelectDate(isoDate: string) {
  const completed = selectCalendarDate(isoDate)

  emitRange()

  if (completed) {
    closePopover()
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) {
    return
  }

  const target = event.target

  if (!(target instanceof Node) || !rootRef.value?.contains(target)) {
    closePopover()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (open.value && event.key === "Escape") {
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick)
  document.addEventListener("keydown", onDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick)
  document.removeEventListener("keydown", onDocumentKeydown)
})
</script>

<template>
  <div ref="rootRef" class="admin-date-range-picker">
    <button
      type="button"
      class="admin-date-range-picker__trigger"
      :class="{ 'admin-date-range-picker__trigger--open': open }"
      :aria-expanded="open"
      @click.stop="toggleOpen"
    >
      <strong>{{ summary }}</strong>
      <small v-if="meta">{{ meta }}</small>
      <ChevronDown class="admin-date-range-picker__chevron" :size="16" stroke-width="2" />
    </button>

    <div v-if="open" class="admin-date-range-picker__popover" @click.stop>
      <header class="admin-date-range-picker__head">
        <div>
          <strong>{{ ext.dateRange.headTitle }}</strong>
          <span>{{ ext.dateRange.headHint }}</span>
        </div>

        <button
          v-if="canClearRange"
          type="button"
          class="admin-date-range-picker__clear"
          @click="clearRange"
        >
          {{ ext.dateRange.clear }}
        </button>

        <div class="admin-date-range-picker__chips">
          <button
            type="button"
            class="admin-date-range-picker__chip"
            :class="{ 'admin-date-range-picker__chip--active': activeStep === 'start' }"
            @click="activeStep = 'start'"
          >
            <span>{{ ext.dateRange.start }}</span>
            <strong>{{ formatChipDate(startDate) }}</strong>
          </button>

          <button
            type="button"
            class="admin-date-range-picker__chip"
            :class="{ 'admin-date-range-picker__chip--active': activeStep === 'end' }"
            @click="activeStep = 'end'"
          >
            <span>{{ ext.dateRange.end }}</span>
            <strong>{{ formatChipDate(endDate) }}</strong>
          </button>
        </div>
      </header>

      <div class="admin-date-range-picker__calendar booking-calendar-shell">
        <button type="button" class="calendar-nav-button" @click="shiftCalendarMonths(-1)">
          ‹
        </button>

        <div class="calendar-months">
          <section
            v-for="month in visibleCalendarMonths"
            :key="formatCalendarMonth(month)"
            class="calendar-month"
          >
            <h4 class="calendar-month-title">{{ formatCalendarMonth(month) }}</h4>

            <div class="calendar-weekdays">
              <span
                v-for="weekday in calendarWeekdayLabels"
                :key="weekday"
                class="calendar-weekday"
              >
                {{ weekday }}
              </span>
            </div>

            <div class="calendar-grid">
              <template v-for="day in buildCalendarDays(month)" :key="day.key">
                <span v-if="!day.isoDate" class="calendar-day-cell calendar-day-cell-empty" />

                <span
                  v-else
                  class="calendar-day-cell"
                  :class="{
                    'is-in-range': day.isInRange,
                    'is-range-start': day.isStart && !day.isEnd,
                    'is-range-end': day.isEnd && !day.isStart,
                    'is-single-day': day.isStart && day.isEnd
                  }"
                >
                  <button
                    type="button"
                    class="calendar-day-button"
                    :class="{
                      'is-selected': day.isRangeEdge,
                      'is-disabled': day.isDisabled
                    }"
                    :disabled="day.isDisabled"
                    @click="onSelectDate(day.isoDate!)"
                  >
                    {{ day.label }}
                  </button>
                </span>
              </template>
            </div>
          </section>
        </div>

        <button
          type="button"
          class="calendar-nav-button"
          :disabled="!canGoToNextCalendarMonth"
          @click="shiftCalendarMonths(1)"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>
