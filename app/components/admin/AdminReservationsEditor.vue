<script setup lang="ts">
import AdminConfirmDialog from "./AdminConfirmDialog.vue"
import AdminDateRangePicker from "./AdminDateRangePicker.vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminHoverTooltip from "./AdminHoverTooltip.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminIcsCalendarsModal from "./AdminIcsCalendarsModal.vue"
import AdminReservationModal from "./AdminReservationModal.vue"
import AdminReservationStatusFilter from "./AdminReservationStatusFilter.vue"
import AdminReservationsIcsUrlModal from "./AdminReservationsIcsUrlModal.vue"
import type { DateRangeValue } from "../../composables/useDateRangeCalendar"
import type { AdminBookingReservation, AdminBookingReservationStatus } from "../../types/booking-reservation"
import type { PropertyCalendarConfig, PropertyCalendarFeed } from "../../types/property-site"
import { normalizeCalendarConfig } from "../../utils/calendar-config"
import { downloadBookingInvoicePdf } from "../../utils/download-booking-invoice"
import {
  filterAdminReservations,
  hasActiveAdminReservationFilters,
  type AdminReservationStatusFilter as ReservationStatusFilterValue
} from "../../utils/filter-admin-reservations"
import { adminUiFormat } from "../../data/admin-ui"
import { compareInputDates, parisInputDateFromDate } from "../../utils/input-date"
import { useAdminProFeatureGate } from "../../composables/admin-pro-feature-context"

const props = defineProps<{
  slug: string
  modelValue: PropertyCalendarConfig
  saveDraft?: () => Promise<boolean>
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyCalendarConfig]
  "reservations-changed": []
}>()

const proFeatureGate = useAdminProFeatureGate()
const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.reservations)

const calendarWeekdayLabels = ["L", "M", "M", "J", "V", "S", "D"]
const visibleMonth = ref(startOfMonth(new Date()))
const blockedDates = ref<Set<string>>(new Set())
const blockedDateSources = ref<Record<string, string[]>>({})
const previewLoading = ref(false)
const previewError = ref<string | null>(null)
const reservations = ref<AdminBookingReservation[]>([])
const reservationsLoading = ref(false)
const reservationsError = ref<string | null>(null)
const selectedReservation = ref<AdminBookingReservation | null>(null)
const pendingDeleteReservation = ref<AdminBookingReservation | null>(null)
const deleteReservationLoading = ref(false)
const invoiceLoadingId = ref<string | null>(null)
const icsModalOpen = ref(false)
const icsExportModalOpen = ref(false)
const icsExportUrl = ref("")
const icsExportLoading = ref(false)
const icsExportRotating = ref(false)
const icsExportError = ref<string | null>(null)
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const reservationStatusLabels = computed<Record<AdminBookingReservationStatus, string>>(() => ({
  upcoming: ext.value.status.upcoming,
  past: ext.value.status.past,
  cancelled: ext.value.status.cancelled
}))

const RESERVATIONS_PAGE_SIZE = 25

const filterDateRange = ref<DateRangeValue>({ startDate: "", endDate: "" })
const filterStatus = ref<ReservationStatusFilterValue>("all")
const reservationsPage = ref(1)

const filterDateFrom = computed(() => filterDateRange.value.startDate)
const filterDateTo = computed(() => filterDateRange.value.endDate)

const reservationFilterMaxDate = computed(() => {
  const fallback = parisInputDateFromDate(
    new Date(new Date().getFullYear() + 3, 11, 31)
  )

  if (!reservations.value.length) {
    return fallback
  }

  return reservations.value.reduce((latest, reservation) => {
    return compareInputDates(reservation.departure_date, latest) > 0
      ? reservation.departure_date
      : latest
  }, fallback)
})

const filteredReservations = computed(() =>
  filterAdminReservations(reservations.value, {
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
    status: filterStatus.value
  })
)

const reservationsPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredReservations.value.length / RESERVATIONS_PAGE_SIZE))
)

const paginatedReservations = computed(() => {
  const start = (reservationsPage.value - 1) * RESERVATIONS_PAGE_SIZE

  return filteredReservations.value.slice(start, start + RESERVATIONS_PAGE_SIZE)
})

const showReservationsPagination = computed(
  () => filteredReservations.value.length > RESERVATIONS_PAGE_SIZE
)

const reservationsPaginationLabel = computed(() => {
  const total = filteredReservations.value.length

  if (!showReservationsPagination.value) {
    return ""
  }

  const start = (reservationsPage.value - 1) * RESERVATIONS_PAGE_SIZE + 1
  const end = Math.min(reservationsPage.value * RESERVATIONS_PAGE_SIZE, total)

  return adminUiFormat(ext.value.paginationRange, {
    start: String(start),
    end: String(end),
    total: String(total)
  })
})

const hasActiveFilters = computed(() =>
  hasActiveAdminReservationFilters(
    filterDateFrom.value,
    filterDateTo.value,
    filterStatus.value
  )
)

const filterResultLabel = computed(() => {
  const total = reservations.value.length
  const visible = filteredReservations.value.length

  if (!total) {
    return ""
  }

  if (!hasActiveFilters.value) {
    return adminUiFormat(total > 1 ? ext.value.countAllPlural : ext.value.countAll, {
      count: String(total)
    })
  }

  return adminUiFormat(
    total > 1 ? ext.value.countFilteredPlural : ext.value.countFiltered,
    {
      visible: String(visible),
      total: String(total)
    }
  )
})

function resetReservationFilters() {
  filterDateRange.value = { startDate: "", endDate: "" }
  filterStatus.value = "all"
}

function goToReservationsPage(page: number) {
  const nextPage = Math.min(Math.max(1, page), reservationsPageCount.value)

  if (nextPage === reservationsPage.value) {
    return
  }

  reservationsPage.value = nextPage

  nextTick(() => {
    document
      .querySelector(".admin-reservations-toolbar__count")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  })
}

watch(
  [filterDateRange, filterStatus],
  () => {
    reservationsPage.value = 1
  },
  { deep: true }
)

watch(reservationsPageCount, (count) => {
  if (reservationsPage.value > count) {
    reservationsPage.value = count
  }
})

const feeds = computed(() =>
  (props.modelValue?.ics_feeds ?? []).map((feed, index) => ({
    id: feed.id || `ics-${index + 1}`,
    name: feed.name ?? "",
    url: feed.url ?? "",
    enabled: typeof feed.enabled === "boolean" ? feed.enabled : true
  }))
)
const visibleMonths = computed(() => [
  visibleMonth.value,
  addMonths(visibleMonth.value, 1),
  addMonths(visibleMonth.value, 2)
])

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function formatCalendarMonth(date: Date) {
  const label = new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    month: "long",
    year: "numeric"
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function fromInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function formatReservationDate(value: string) {
  const date = fromInputDate(value)

  if (!date) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}

function pluralizeNights(value: number) {
  return pluralize(value, ext.value.plurals.night, ext.value.plurals.nights)
}

function formatReservationDateRange(reservation: AdminBookingReservation) {
  return `${formatReservationDate(reservation.arrival_date)} → ${formatReservationDate(reservation.departure_date)}`
}

function formatGuestCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`
}

function openReservation(reservation: AdminBookingReservation) {
  selectedReservation.value = reservation
}

function onEditReservation(reservation: AdminBookingReservation, event: MouseEvent) {
  event.stopPropagation()
  openReservation(reservation)
}

function onDeleteReservationClick(reservation: AdminBookingReservation, event: MouseEvent) {
  event.stopPropagation()
  pendingDeleteReservation.value = reservation
}

async function onDownloadInvoice(reservation: AdminBookingReservation, event: MouseEvent) {
  event.stopPropagation()

  if (!proFeatureGate.requireProFeature("invoice")) {
    return
  }

  if (invoiceLoadingId.value) {
    return
  }

  invoiceLoadingId.value = reservation.id
  reservationsError.value = null

  try {
    await downloadBookingInvoicePdf(props.slug, reservation, await authHeaders())
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    reservationsError.value =
      e.data?.message || e.message || ext.value.errors.invoicePdf
  } finally {
    invoiceLoadingId.value = null
  }
}

function cancelDeleteReservation() {
  if (deleteReservationLoading.value) {
    return
  }

  pendingDeleteReservation.value = null
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function confirmDeleteReservation() {
  const reservation = pendingDeleteReservation.value

  if (!reservation) {
    return
  }

  deleteReservationLoading.value = true

  try {
    await $fetch(`/api/admin/${props.slug}/reservations/${reservation.id}`, {
      method: "DELETE",
      headers: await authHeaders()
    })

    reservations.value = reservations.value.filter((item) => item.id !== reservation.id)

    if (selectedReservation.value?.id === reservation.id) {
      selectedReservation.value = null
    }

    pendingDeleteReservation.value = null
    emit("reservations-changed")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    reservationsError.value = e.data?.message || e.message || ext.value.errors.delete
    pendingDeleteReservation.value = null
  } finally {
    deleteReservationLoading.value = false
  }
}

const pendingDeleteGuestLabel = computed(() => {
  const reservation = pendingDeleteReservation.value

  if (!reservation) {
    return ext.value.guestFallback
  }

  const name = `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()

  return name || ext.value.guestFallback
})

function closeReservationModal() {
  selectedReservation.value = null
}

function onReservationSaved(updated: AdminBookingReservation) {
  reservations.value = reservations.value.map((item) =>
    item.id === updated.id ? updated : item
  )

  if (selectedReservation.value?.id === updated.id) {
    selectedReservation.value = updated
  }

  emit("reservations-changed")
}

function onReservationDeleted() {
  const deletedId = selectedReservation.value?.id

  if (deletedId) {
    reservations.value = reservations.value.filter((item) => item.id !== deletedId)
  }

  selectedReservation.value = null
  emit("reservations-changed")
}

function patchFeeds(nextFeeds: PropertyCalendarFeed[]) {
  emit("update:modelValue", { ics_feeds: nextFeeds })
}

async function persistFeeds(nextFeeds: PropertyCalendarFeed[]) {
  patchFeeds(nextFeeds)

  await nextTick()

  if (props.saveDraft) {
    await props.saveDraft()
  }
}

function addFeed(feed: PropertyCalendarFeed) {
  void persistFeeds([...feeds.value, feed])
}

function updateFeed(index: number, feed: PropertyCalendarFeed) {
  void persistFeeds(feeds.value.map((item, feedIndex) => (feedIndex === index ? feed : item)))
}

function removeFeed(index: number) {
  void persistFeeds(feeds.value.filter((_, feedIndex) => feedIndex !== index))
}

function shiftCalendarMonths(delta: number) {
  visibleMonth.value = addMonths(visibleMonth.value, delta)
}

function blockedDateTooltip(isoDate: string) {
  const names = blockedDateSources.value[isoDate]

  if (names?.length) {
    return names.join(" · ")
  }

  if (!blockedDates.value.has(isoDate)) {
    return undefined
  }

  const activeFeedNames = feeds.value
    .filter((feed) => feed.enabled && feed.name.trim())
    .map((feed) => feed.name.trim())

  if (activeFeedNames.length === 1) {
    return activeFeedNames[0]
  }

  if (activeFeedNames.length > 1) {
    return activeFeedNames.join(" · ")
  }

  return ext.value.calendar.externalCalendar
}

function buildDateSourcesFromFeedBlocks(blocks: Array<{ name: string; dates: string[] }>) {
  const map: Record<string, string[]> = {}

  for (const block of blocks) {
    for (const date of block.dates) {
      const sources = map[date] ?? []

      if (!sources.includes(block.name)) {
        sources.push(block.name)
      }

      map[date] = sources
    }
  }

  for (const date of Object.keys(map)) {
    map[date].sort((a, b) => a.localeCompare(b, "fr"))
  }

  return map
}

function applyPreviewSources(response: {
  dateSources?: Record<string, string[]>
  feedBlocks?: Array<{ name: string; dates: string[] }>
}) {
  if (response.dateSources && Object.keys(response.dateSources).length > 0) {
    blockedDateSources.value = response.dateSources
    return
  }

  blockedDateSources.value = buildDateSourcesFromFeedBlocks(response.feedBlocks ?? [])
}

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month)
  const startWeekday = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: {
    key: string
    isoDate: string
    label: number
    isBlocked: boolean
    tooltip?: string
  }[] = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `empty-${i}`, isoDate: "", label: 0, isBlocked: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const isoDate = toInputDate(date)
    const isBlocked = blockedDates.value.has(isoDate)

    cells.push({
      key: isoDate,
      isoDate,
      label: day,
      isBlocked,
      tooltip: isBlocked ? blockedDateTooltip(isoDate) : undefined
    })
  }

  return cells
}

async function refreshPreview() {
  previewLoading.value = true
  previewError.value = null

  try {
    const response = await $fetch<{
      dates: string[]
      dateSources: Record<string, string[]>
      feedBlocks: Array<{ name: string; dates: string[] }>
      fetchedAt: string
      sources: { total: number; succeeded: number; failed: number }
    }>(`/api/admin/${props.slug}/calendar-preview`, {
      method: "POST",
      headers: await authHeaders(),
      body: normalizeCalendarConfig(props.modelValue)
    })

    blockedDates.value = new Set(response.dates)
    applyPreviewSources(response)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    blockedDates.value = new Set()
    blockedDateSources.value = {}
    previewError.value = e.data?.message || e.message || ext.value.errors.icsLoad
  } finally {
    previewLoading.value = false
  }
}

async function loadReservations() {
  reservationsLoading.value = true
  reservationsError.value = null

  try {
    const response = await $fetch<{ reservations: AdminBookingReservation[] }>(
      `/api/admin/${props.slug}/reservations`,
      {
        headers: await authHeaders()
      }
    )

    reservations.value = response.reservations
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    reservations.value = []
    reservationsError.value = e.data?.message || e.message || ext.value.errors.listLoad
  } finally {
    reservationsLoading.value = false
  }
}

async function openIcsExportModal() {
  icsExportModalOpen.value = true
  icsExportLoading.value = true
  icsExportError.value = null
  icsExportUrl.value = ""

  try {
    const response = await $fetch<{ url: string }>(
      `/api/admin/${props.slug}/reservations-ics-url`,
      {
        headers: await authHeaders()
      }
    )

    icsExportUrl.value = response.url
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    icsExportError.value =
      e.data?.message || e.message || ext.value.errors.icsUrl
  } finally {
    icsExportLoading.value = false
  }
}

function closeIcsExportModal() {
  icsExportModalOpen.value = false
}

async function rotateIcsExportUrl() {
  icsExportRotating.value = true
  icsExportError.value = null

  try {
    const response = await $fetch<{ url: string }>(
      `/api/admin/${props.slug}/reservations-ics-url`,
      {
        method: "POST",
        headers: await authHeaders()
      }
    )

    icsExportUrl.value = response.url
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    icsExportError.value =
      e.data?.message || e.message || ext.value.errors.icsUrl
  } finally {
    icsExportRotating.value = false
  }
}

watch(
  feeds,
  () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    refreshTimer = setTimeout(() => {
      void refreshPreview()
    }, 450)
  },
  { immediate: true, deep: true }
)

watch(
  () => props.slug,
  () => {
    void loadReservations()
  },
  { immediate: true }
)

onUnmounted(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
})
</script>

<template>
  <div class="admin-reservations">
    <section class="admin-reservations__panel admin-reservations__panel--calendar admin-reservations__panel--full">
      <div class="admin-reservations__calendar-actions">
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="previewLoading"
          @click="refreshPreview"
        >
          <AdminIcon name="calendar" :size="16" />
          {{ previewLoading ? ext.calendar.loading : ext.calendar.refresh }}
        </button>
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          @click="icsModalOpen = true"
        >
          <AdminIcon name="external" :size="16" />
          {{ ext.calendar.otherCalendars }}
        </button>
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          @click="openIcsExportModal"
        >
          <AdminIcon name="external" :size="16" />
          {{ ext.calendar.icsExportLink }}
        </button>
      </div>

      <p v-if="previewError" class="admin-reservations__error">{{ previewError }}</p>

      <div class="admin-reservations-calendar booking-calendar-shell">
        <button type="button" class="calendar-nav-button" @click="shiftCalendarMonths(-1)">
          ‹
        </button>
        <div class="calendar-months">
          <section
            v-for="month in visibleMonths"
            :key="formatCalendarMonth(month)"
            class="calendar-month"
          >
            <h4 class="calendar-month-title">{{ formatCalendarMonth(month) }}</h4>
            <div class="calendar-weekdays">
              <span v-for="weekday in calendarWeekdayLabels" :key="weekday" class="calendar-weekday">
                {{ weekday }}
              </span>
            </div>
            <div class="calendar-grid">
              <template v-for="day in buildCalendarDays(month)" :key="day.key">
                <span v-if="!day.isoDate" class="calendar-day-cell calendar-day-cell-empty" />

                <span v-else class="calendar-day-cell">
                  <AdminHoverTooltip v-if="day.isBlocked && day.tooltip" :label="day.tooltip">
                    <span
                      class="calendar-day-button is-disabled is-reserved"
                      :aria-label="`${day.label} — ${day.tooltip}`"
                    >
                      {{ day.label }}
                    </span>
                  </AdminHoverTooltip>
                  <span v-else class="calendar-day-button">
                    {{ day.label }}
                  </span>
                </span>
              </template>
            </div>
          </section>
        </div>
        <button type="button" class="calendar-nav-button" @click="shiftCalendarMonths(1)">
          ›
        </button>
      </div>
    </section>

    <section class="admin-reservations__panel admin-reservations__panel--bookings admin-reservations__panel--full">
      <p v-if="reservationsError" class="admin-reservations__error">{{ reservationsError }}</p>
      <p v-else-if="reservationsLoading" class="admin-reservations__loading">
        {{ ext.calendar.loadingList }}
      </p>
      <AdminEmptyState
        v-else-if="!reservations.length"
        icon="check"
        :title="ext.empty.title"
        :description="ext.empty.description"
        compact
      />

      <template v-else>
        <p v-if="filterResultLabel" class="admin-reservations-toolbar__count">
          {{ filterResultLabel }}
        </p>

        <div class="admin-reservations-bookings">
          <div class="admin-reservations-filters">
            <div class="admin-reservations-filters__dates">
              <AdminDateRangePicker
                v-model="filterDateRange"
                :label="ext.filters.stayPeriod"
                optional
                :empty-summary="ext.filters.allDates"
                :max-date="reservationFilterMaxDate"
              />
            </div>

            <AdminReservationStatusFilter
              v-model="filterStatus"
              class="admin-reservations-filters__status"
            />

            <button
              type="button"
              class="admin-btn admin-btn--secondary admin-reservations-filters__reset"
              :disabled="!hasActiveFilters"
              @click="resetReservationFilters"
            >
              {{ ext.filters.reset }}
            </button>
          </div>

          <AdminEmptyState
            v-if="!filteredReservations.length"
            icon="search"
            :title="ext.noMatch.title"
            :description="ext.noMatch.description"
            compact
          />

          <template v-else>
            <ul class="admin-reservations-list" role="list">
        <li
          v-for="reservation in paginatedReservations"
          :key="reservation.id"
          class="admin-reservations-list__row"
        >
          <button
            type="button"
            class="admin-reservations-list__item"
            @click="openReservation(reservation)"
          >
            <div class="admin-reservations-list__line admin-reservations-list__line--primary">
              <span
                class="admin-reservations-status-pill admin-reservations-list__status"
                :class="`admin-reservations-status-pill--${reservation.display_status}`"
              >
                {{ reservationStatusLabels[reservation.display_status] }}
              </span>
              <p class="admin-reservations-list__dates">
                {{ formatReservationDateRange(reservation) }}
                <span class="admin-reservations-list__nights">
                  ({{ pluralizeNights(reservation.stay_nights) }})
                </span>
              </p>
            </div>

            <div class="admin-reservations-list__line admin-reservations-list__line--guests">
              <span class="admin-reservations-list__guest-stat">
                <AdminIcon name="user" :size="15" />
                {{ formatGuestCountLabel(reservation.adults, ext.plurals.adult, ext.plurals.adults) }}
              </span>
              <span class="admin-reservations-list__guest-stat">
                <AdminIcon name="child" :size="15" />
                {{ formatGuestCountLabel(reservation.children, ext.plurals.child, ext.plurals.children) }}
              </span>
              <span class="admin-reservations-list__guest-stat">
                <AdminIcon name="baby" :size="15" />
                {{ formatGuestCountLabel(reservation.babies, ext.plurals.baby, ext.plurals.babies) }}
              </span>
            </div>
          </button>

          <div class="admin-reservations-list__actions">
            <button
              type="button"
              class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
              :aria-label="
                invoiceLoadingId === reservation.id
                  ? ext.actions.invoiceGenerating
                  : ext.actions.invoiceDownload
              "
              :disabled="Boolean(invoiceLoadingId)"
              @click="onDownloadInvoice(reservation, $event)"
            >
              <AdminIcon name="file" :size="16" />
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
              :aria-label="ext.actions.edit"
              @click="onEditReservation(reservation, $event)"
            >
              <AdminIcon name="pencil" :size="16" />
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
              :aria-label="ext.actions.delete"
              @click="onDeleteReservationClick(reservation, $event)"
            >
              <AdminIcon name="trash" :size="16" />
            </button>
          </div>
        </li>
            </ul>

            <nav
              v-if="showReservationsPagination"
              class="admin-reservations-pagination"
              :aria-label="ext.paginationAria"
            >
              <button
                type="button"
                class="admin-btn admin-btn--secondary admin-btn--sm"
                :disabled="reservationsPage <= 1"
                @click="goToReservationsPage(reservationsPage - 1)"
              >
                {{ ext.paginationPrev }}
              </button>
              <p class="admin-reservations-pagination__meta">
                <span class="admin-reservations-pagination__range">{{ reservationsPaginationLabel }}</span>
                <span class="admin-reservations-pagination__pages">
                  {{
                    adminUiFormat(ext.paginationPage, {
                      page: String(reservationsPage),
                      total: String(reservationsPageCount)
                    })
                  }}
                </span>
              </p>
              <button
                type="button"
                class="admin-btn admin-btn--secondary admin-btn--sm"
                :disabled="reservationsPage >= reservationsPageCount"
                @click="goToReservationsPage(reservationsPage + 1)"
              >
                {{ ext.paginationNext }}
              </button>
            </nav>
          </template>
        </div>
      </template>
    </section>

    <AdminReservationsIcsUrlModal
      :open="icsExportModalOpen"
      :url="icsExportUrl"
      :loading="icsExportLoading"
      :rotating="icsExportRotating"
      :error="icsExportError"
      @close="closeIcsExportModal"
      @rotate="rotateIcsExportUrl"
    />

    <AdminIcsCalendarsModal
      :open="icsModalOpen"
      :feeds="feeds"
      @close="icsModalOpen = false"
      @add="addFeed"
      @update="updateFeed"
      @remove="removeFeed"
    />

    <AdminReservationModal
      :slug="slug"
      :reservation="selectedReservation"
      @close="closeReservationModal"
      @saved="onReservationSaved"
      @deleted="onReservationDeleted"
    />

    <AdminConfirmDialog
      :open="Boolean(pendingDeleteReservation)"
      :title="ext.deleteConfirm.title"
      :message="
        adminUiFormat(ext.deleteConfirm.message, { guest: pendingDeleteGuestLabel })
      "
      :confirm-label="ext.deleteConfirm.confirm"
      variant="danger"
      :loading="deleteReservationLoading"
      @confirm="confirmDeleteReservation"
      @cancel="cancelDeleteReservation"
    />
  </div>
</template>
