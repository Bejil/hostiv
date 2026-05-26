<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminReservationModal from "./AdminReservationModal.vue"
import AdminToggle from "./AdminToggle.vue"
import type { AdminBookingReservation, AdminBookingReservationStatus } from "../../types/booking-reservation"
import type { PropertyCalendarConfig, PropertyCalendarFeed } from "../../types/property-site"
import { normalizeCalendarConfig } from "../../utils/calendar-config"

const props = defineProps<{
  slug: string
  modelValue: PropertyCalendarConfig
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyCalendarConfig]
  "reservations-changed": []
}>()

const calendarWeekdayLabels = ["L", "M", "M", "J", "V", "S", "D"]
const visibleMonth = ref(startOfMonth(new Date()))
const blockedDates = ref<Set<string>>(new Set())
const previewLoading = ref(false)
const previewError = ref<string | null>(null)
const previewFetchedAt = ref<string | null>(null)
const previewSources = ref<{ total: number; succeeded: number; failed: number } | null>(null)
const reservations = ref<AdminBookingReservation[]>([])
const reservationsLoading = ref(false)
const reservationsError = ref<string | null>(null)
const selectedReservation = ref<AdminBookingReservation | null>(null)
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const reservationStatusLabels: Record<AdminBookingReservationStatus, string> = {
  upcoming: "À venir",
  past: "Passée",
  cancelled: "Annulée"
}

const feeds = computed(() =>
  (props.modelValue?.ics_feeds ?? []).map((feed, index) => ({
    id: feed.id || `ics-${index + 1}`,
    name: feed.name ?? "",
    url: feed.url ?? "",
    enabled: typeof feed.enabled === "boolean" ? feed.enabled : true
  }))
)
const visibleMonths = computed(() => [visibleMonth.value, addMonths(visibleMonth.value, 1)])

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
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  }).format(date)

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatFetchedAt(value: string | null) {
  if (!value) {
    return "Jamais actualisé"
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value))
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

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date)
}

function formatReservationAmount(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value)
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}

function formatReservationDateRange(reservation: AdminBookingReservation) {
  return `${formatReservationDate(reservation.arrival_date)} → ${formatReservationDate(reservation.departure_date)}`
}

function formatReservationGuestCount(reservation: AdminBookingReservation) {
  const total = reservation.adults + reservation.children + reservation.babies

  return pluralize(total, "personne", "personnes")
}

function openReservation(reservation: AdminBookingReservation) {
  selectedReservation.value = reservation
}

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

function createFeed(): PropertyCalendarFeed {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    enabled: true
  }
}

function patchFeeds(nextFeeds: PropertyCalendarFeed[]) {
  emit("update:modelValue", { ics_feeds: nextFeeds })
}

function addFeed() {
  patchFeeds([...feeds.value, createFeed()])
}

function updateFeed(index: number, partial: Partial<PropertyCalendarFeed>) {
  patchFeeds(feeds.value.map((feed, feedIndex) => (feedIndex === index ? { ...feed, ...partial } : feed)))
}

function removeFeed(index: number) {
  patchFeeds(feeds.value.filter((_, feedIndex) => feedIndex !== index))
}

function shiftCalendarMonths(delta: number) {
  visibleMonth.value = addMonths(visibleMonth.value, delta)
}

function buildCalendarDays(month: Date) {
  const monthStart = startOfMonth(month)
  const startWeekday = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: { key: string; isoDate: string; label: number; isBlocked: boolean }[] = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `empty-${i}`, isoDate: "", label: 0, isBlocked: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    const isoDate = toInputDate(date)

    cells.push({
      key: isoDate,
      isoDate,
      label: day,
      isBlocked: blockedDates.value.has(isoDate)
    })
  }

  return cells
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function refreshPreview() {
  previewLoading.value = true
  previewError.value = null

  try {
    const response = await $fetch<{
      dates: string[]
      fetchedAt: string
      sources: { total: number; succeeded: number; failed: number }
    }>(`/api/admin/${props.slug}/calendar-preview`, {
      method: "POST",
      headers: await authHeaders(),
      body: normalizeCalendarConfig(props.modelValue)
    })

    blockedDates.value = new Set(response.dates)
    previewFetchedAt.value = response.fetchedAt
    previewSources.value = response.sources
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    blockedDates.value = new Set()
    previewError.value = e.data?.message || e.message || "Impossible de charger les calendriers ICS."
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
    reservationsError.value = e.data?.message || e.message || "Impossible de charger les réservations."
  } finally {
    reservationsLoading.value = false
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
    <section class="admin-reservations__panel admin-reservations__panel--bookings">
      <header class="admin-reservations__head">
        <div>
          <p class="admin-reservations__kicker">Réservations</p>
          <h3>Réservations du site</h3>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="reservationsLoading"
          @click="loadReservations"
        >
          <AdminIcon name="calendar" :size="16" />
          {{ reservationsLoading ? "Chargement..." : "Actualiser" }}
        </button>
      </header>

      <p v-if="reservationsError" class="admin-reservations__error">{{ reservationsError }}</p>
      <p v-else-if="reservationsLoading" class="admin-reservations__empty">
        Chargement des réservations...
      </p>
      <p v-else-if="!reservations.length" class="admin-reservations__empty">
        Aucune réservation confirmée sur le site pour le moment.
      </p>

      <ul v-else class="admin-reservations-list" role="list">
        <li v-for="reservation in reservations" :key="reservation.id">
          <button
            type="button"
            class="admin-reservations-list__item"
            @click="openReservation(reservation)"
          >
            <span class="admin-reservations-list__dates">
              {{ formatReservationDateRange(reservation) }}
            </span>
            <span class="admin-reservations-list__nights">
              {{ pluralize(reservation.stay_nights, "nuit", "nuits") }}
            </span>
            <span class="admin-reservations-list__guests">
              {{ formatReservationGuestCount(reservation) }}
            </span>
            <span class="admin-reservations-list__price">
              {{ formatReservationAmount(reservation.total_eur) }}
            </span>
            <span
              class="admin-reservations-booking__status admin-reservations-list__status"
              :class="`admin-reservations-booking__status--${reservation.display_status}`"
            >
              {{ reservationStatusLabels[reservation.display_status] }}
            </span>
          </button>
        </li>
      </ul>
    </section>

    <AdminReservationModal
      :slug="slug"
      :reservation="selectedReservation"
      @close="closeReservationModal"
      @saved="onReservationSaved"
      @deleted="onReservationDeleted"
    />

    <section class="admin-reservations__panel">
      <header class="admin-reservations__head">
        <div>
          <p class="admin-reservations__kicker">Synchronisation</p>
          <h3>Liens ICS</h3>
        </div>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addFeed">
          <AdminIcon name="plus" :size="16" />
          Ajouter un lien
        </button>
      </header>

      <p v-if="!feeds.length" class="admin-reservations__empty">
        Aucun flux ICS. Ajoutez les calendriers Airbnb, Booking, Abritel ou toute autre plateforme.
      </p>

      <div v-else class="admin-reservations__feeds">
        <article v-for="(feed, index) in feeds" :key="feed.id" class="admin-reservations-feed">
          <AdminToggle
            :model-value="feed.enabled"
            @update:model-value="updateFeed(index, { enabled: $event })"
          />
          <AdminField
            label="Lien ICS"
            :model-value="feed.url"
            type="url"
            placeholder="https://.../calendar.ics"
            @update:model-value="updateFeed(index, { url: $event as string })"
          />
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-reservations-feed__delete"
            aria-label="Supprimer le lien ICS"
            title="Supprimer"
            @click="removeFeed(index)"
          >
            <AdminIcon name="trash" :size="16" />
          </button>
        </article>
      </div>
    </section>

    <section class="admin-reservations__panel admin-reservations__panel--calendar">
      <header class="admin-reservations__head">
        <div>
          <p class="admin-reservations__kicker">Disponibilités</p>
          <h3>Dates réservées</h3>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :disabled="previewLoading"
          @click="refreshPreview"
        >
          <AdminIcon name="calendar" :size="16" />
          {{ previewLoading ? "Chargement..." : "Actualiser" }}
        </button>
      </header>

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
                  <button
                    type="button"
                    class="calendar-day-button"
                    :class="{
                      'is-disabled': day.isBlocked,
                      'is-reserved': day.isBlocked
                    }"
                    :disabled="day.isBlocked"
                  >
                    {{ day.label }}
                  </button>
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
  </div>
</template>
