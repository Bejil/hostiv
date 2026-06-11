<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminDateRangePicker from "./AdminDateRangePicker.vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import type { AdminBookingReservation } from "../../types/booking-reservation"
import {
  buildRecentMonthsDateRange,
  buildReservationRevenueByMonth,
  defaultRevenueDateRange,
  type ReservationRevenueDateRange
} from "../../utils/admin-reservation-revenue"
import { formatEuro } from "../../utils/booking-price"
import { formatDisplayDate, parisInputDateFromDate } from "../../utils/input-date"

const props = defineProps<{
  slug: string
  platformFeePercent?: number
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const loading = ref(true)
const error = ref<string | null>(null)
const reservations = ref<AdminBookingReservation[]>([])

const dateRange = ref<ReservationRevenueDateRange>(defaultRevenueDateRange())

const revenue = computed(() =>
  buildReservationRevenueByMonth(reservations.value, {
    platformFeePercent: props.platformFeePercent,
    dateRange: dateRange.value,
    locale: locale.value
  })
)

const maxDateRange = computed(() => parisInputDateFromDate(new Date()))

const maxMonthGrossEur = computed(() =>
  Math.max(...revenue.value.months.map((month) => month.grossEur), 1)
)

const visibleMonths = computed(() => revenue.value.months)

const revenuePresets = computed(() => [
  { months: 1 as const, label: ext.value.revenue.presets.lastMonth },
  { months: 6 as const, label: ext.value.revenue.presets.lastSixMonths }
])

function isPresetActive(months: number) {
  const preset = buildRecentMonthsDateRange(months, maxDateRange.value)

  return (
    dateRange.value.startDate === preset.startDate &&
    dateRange.value.endDate === preset.endDate
  )
}

function applyPreset(months: number) {
  dateRange.value = buildRecentMonthsDateRange(months, maxDateRange.value)
}

function presetDescription(months: number) {
  const preset = buildRecentMonthsDateRange(months, maxDateRange.value)

  return `${formatDisplayDate(preset.startDate, locale.value)} – ${formatDisplayDate(preset.endDate, locale.value)}`
}

function pluralizeReservations(count: number) {
  return count > 1
    ? adminUiFormat(ext.value.revenue.reservationCountPlural, { count })
    : adminUiFormat(ext.value.revenue.reservationCount, { count })
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function loadReservations() {
  loading.value = true
  error.value = null

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
    error.value = e.data?.message || e.message || ext.value.revenue.errors.load
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadReservations()
})

watch(
  () => props.slug,
  () => {
    void loadReservations()
  }
)

defineExpose({
  refresh: loadReservations,
  loading
})
</script>

<template>
  <div class="admin-accounting-revenue">
    <div class="admin-accounting-revenue__filters">
      <div class="admin-accounting-revenue__filter">
        <AdminDateRangePicker
          v-model="dateRange"
          :label="ext.revenue.periodLabel"
          :max-date="maxDateRange"
        />
      </div>

      <button
        v-for="preset in revenuePresets"
        :key="preset.months"
        type="button"
        class="admin-accounting-revenue__filter-preset"
        :class="{ 'admin-accounting-revenue__filter-preset--active': isPresetActive(preset.months) }"
        @click="applyPreset(preset.months)"
      >
        <span class="admin-accounting-revenue__filter-preset-label">{{ preset.label }}</span>
        <span class="admin-accounting-revenue__filter-preset-meta">
          {{ presetDescription(preset.months) }}
        </span>
      </button>
    </div>

    <p v-if="error" class="admin-accounting__error">{{ error }}</p>
    <p v-else-if="loading" class="admin-accounting__loading">{{ ext.revenue.loading }}</p>

    <template v-else>
      <div class="admin-accounting-revenue__summary" :aria-label="ext.revenue.summaryAria">
        <article class="admin-accounting-revenue__stat admin-accounting-revenue__stat--accent">
          <p class="admin-accounting-revenue__stat-label">{{ ext.revenue.stats.totalGross }}</p>
          <strong class="admin-accounting-revenue__stat-value">
            {{ formatEuro(revenue.totalGrossEur) }}
          </strong>
          <span class="admin-accounting-revenue__stat-meta">
            {{ pluralizeReservations(revenue.totalReservationCount) }}
            {{ ext.revenue.stats.onPeriod }}
          </span>
        </article>

        <article class="admin-accounting-revenue__stat">
          <p class="admin-accounting-revenue__stat-label">{{ ext.revenue.stats.monthlyAverage }}</p>
          <strong class="admin-accounting-revenue__stat-value">
            {{
              formatEuro(
                revenue.months.length
                  ? Math.round(revenue.totalGrossEur / revenue.months.length)
                  : 0
              )
            }}
          </strong>
          <span class="admin-accounting-revenue__stat-meta">
            {{
              adminUiFormat(ext.revenue.stats.monthsShown, { count: revenue.months.length })
            }}
          </span>
        </article>

        <article class="admin-accounting-revenue__stat">
          <p class="admin-accounting-revenue__stat-label">{{ ext.revenue.stats.netEstimated }}</p>
          <strong class="admin-accounting-revenue__stat-value">
            {{
              revenue.totalNetEur !== null ? formatEuro(revenue.totalNetEur) : "—"
            }}
          </strong>
          <span v-if="revenue.totalNetEur !== null" class="admin-accounting-revenue__stat-meta">
            {{
              adminUiFormat(ext.revenue.stats.afterCommission, {
                percent: platformFeePercent ?? 0
              })
            }}
          </span>
          <span v-else class="admin-accounting-revenue__stat-meta">
            {{ ext.revenue.stats.commissionNotConfigured }}
          </span>
        </article>
      </div>

      <AdminEmptyState
        v-if="!revenue.hasData"
        icon="calendar"
        :title="ext.revenue.empty.title"
        :description="ext.revenue.empty.description"
        compact
      />

      <div v-else class="admin-accounting-revenue__months">
        <div
          v-for="month in visibleMonths"
          :key="month.monthKey"
          class="admin-accounting-revenue__month"
          :class="{ 'admin-accounting-revenue__month--empty': month.reservationCount === 0 }"
        >
          <div class="admin-accounting-revenue__month-head">
            <span class="admin-accounting-revenue__month-label">{{ month.label }}</span>
            <strong class="admin-accounting-revenue__month-amount">
              {{ formatEuro(month.grossEur) }}
            </strong>
          </div>

          <div
            class="admin-accounting-revenue__bar"
            role="presentation"
            :aria-hidden="month.reservationCount === 0"
          >
            <span
              class="admin-accounting-revenue__bar-fill"
              :style="{ width: `${Math.round((month.grossEur / maxMonthGrossEur) * 100)}%` }"
            />
          </div>

          <p class="admin-accounting-revenue__month-meta">
            <span>{{ pluralizeReservations(month.reservationCount) }}</span>
            <span v-if="month.netEur !== null && month.reservationCount > 0">
              ·
              {{
                adminUiFormat(ext.revenue.monthNet, { amount: formatEuro(month.netEur) })
              }}
            </span>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
