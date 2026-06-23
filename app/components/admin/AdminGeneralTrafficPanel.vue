<script setup lang="ts">
import AdminDateRangePicker from "./AdminDateRangePicker.vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminTrafficLineChart, { type AdminTrafficChartPoint } from "./AdminTrafficLineChart.vue"
import type { PropertyTrafficReport } from "../../types/property-traffic"
import {
  buildRecentMonthsDateRange,
  type ReservationRevenueDateRange
} from "../../utils/admin-reservation-revenue"
import { formatDisplayDate, parisInputDateFromDate } from "../../utils/input-date"

const props = defineProps<{
  slug: string
  published: boolean
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const loading = ref(true)
const error = ref<string | null>(null)
const report = ref<PropertyTrafficReport | null>(null)

function buildDefaultTrafficDateRange(): ReservationRevenueDateRange {
  const end = parisInputDateFromDate(new Date())
  const startDate = new Date(`${end}T12:00:00`)
  startDate.setDate(startDate.getDate() - 29)

  return {
    startDate: parisInputDateFromDate(startDate),
    endDate: end
  }
}

const dateRange = ref<ReservationRevenueDateRange>(buildDefaultTrafficDateRange())

const maxDateRange = computed(() => parisInputDateFromDate(new Date()))

const trafficPresets = computed(() => [
  { days: 7, label: ext.value.traffic.presets.last7Days },
  { days: 30, label: ext.value.traffic.presets.last30Days },
  { months: 6, label: ext.value.traffic.presets.lastSixMonths }
])

const dayCountInRange = computed(() => report.value?.daily.length ?? 0)

const useDailyChart = computed(() => dayCountInRange.value > 0 && dayCountInRange.value <= 31)

const chartTitle = computed(() =>
  useDailyChart.value ? ext.value.traffic.dailyTitle : ext.value.traffic.monthlyTitle
)

const chartPoints = computed<AdminTrafficChartPoint[]>(() => {
  if (!report.value) {
    return []
  }

  if (useDailyChart.value) {
    return report.value.daily.map((row) => ({
      key: row.day,
      label: formatDisplayDate(row.day, locale.value),
      page_views: row.page_views,
      unique_visitors: row.unique_visitors
    }))
  }

  return report.value.monthly.map((row) => ({
    key: row.month_key,
    label: row.label,
    page_views: row.page_views,
    unique_visitors: row.unique_visitors
  }))
})

const dailyAverageViews = computed(() => {
  if (!report.value || dayCountInRange.value === 0) {
    return 0
  }

  return Math.round((report.value.totals.page_views / dayCountInRange.value) * 10) / 10
})

function formatCount(value: number) {
  return new Intl.NumberFormat(locale.value === "en" ? "en-GB" : "fr-FR").format(value)
}

function isPresetActive(preset: { days?: number; months?: number }) {
  if (preset.months) {
    const range = buildRecentMonthsDateRange(preset.months, maxDateRange.value)

    return (
      dateRange.value.startDate === range.startDate && dateRange.value.endDate === range.endDate
    )
  }

  if (!preset.days) {
    return false
  }

  const end = maxDateRange.value
  const startDate = new Date(`${end}T12:00:00`)
  startDate.setDate(startDate.getDate() - (preset.days - 1))
  const start = parisInputDateFromDate(startDate)

  return dateRange.value.startDate === start && dateRange.value.endDate === end
}

function applyPreset(preset: { days?: number; months?: number }) {
  if (preset.months) {
    dateRange.value = buildRecentMonthsDateRange(preset.months, maxDateRange.value)
    return
  }

  if (!preset.days) {
    return
  }

  const end = maxDateRange.value
  const startDate = new Date(`${end}T12:00:00`)
  startDate.setDate(startDate.getDate() - (preset.days - 1))

  dateRange.value = {
    startDate: parisInputDateFromDate(startDate),
    endDate: end
  }
}

function presetDescription(preset: { days?: number; months?: number }) {
  if (preset.months) {
    const range = buildRecentMonthsDateRange(preset.months, maxDateRange.value)

    return `${formatDisplayDate(range.startDate, locale.value)} – ${formatDisplayDate(range.endDate, locale.value)}`
  }

  if (!preset.days) {
    return ""
  }

  const end = maxDateRange.value
  const startDate = new Date(`${end}T12:00:00`)
  startDate.setDate(startDate.getDate() - (preset.days - 1))
  const start = parisInputDateFromDate(startDate)

  return `${formatDisplayDate(start, locale.value)} – ${formatDisplayDate(end, locale.value)}`
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function loadTraffic() {
  loading.value = true
  error.value = null

  try {
    report.value = await $fetch<PropertyTrafficReport>(`/api/admin/${props.slug}/traffic`, {
      headers: await authHeaders(),
      query: {
        start_date: dateRange.value.startDate,
        end_date: dateRange.value.endDate,
        locale: locale.value
      }
    })
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.traffic.errors.load
    report.value = null
  } finally {
    loading.value = false
  }
}

watch(dateRange, () => {
  void loadTraffic()
})

watch(
  () => props.slug,
  () => {
    void loadTraffic()
  }
)

onMounted(() => {
  void loadTraffic()
})

defineExpose({ loading, refresh: loadTraffic })
</script>

<template>
  <div class="admin-general-traffic">
    <div class="admin-general-traffic__filters">
      <div class="admin-general-traffic__filter">
        <AdminDateRangePicker v-model="dateRange" :max-date="maxDateRange" />
      </div>

      <button
        v-for="preset in trafficPresets"
        :key="preset.label"
        type="button"
        class="admin-general-traffic__filter-preset"
        :class="{ 'admin-general-traffic__filter-preset--active': isPresetActive(preset) }"
        @click="applyPreset(preset)"
      >
        <span class="admin-general-traffic__filter-preset-label">{{ preset.label }}</span>
        <span class="admin-general-traffic__filter-preset-meta">
          {{ presetDescription(preset) }}
        </span>
      </button>
    </div>

    <p v-if="!published" class="admin-general-traffic__notice">{{ ext.general.trafficUnpublished }}</p>

    <p v-if="error" class="admin-general-traffic__error">{{ error }}</p>
    <p v-else-if="loading" class="admin-general-traffic__loading">{{ ext.traffic.loading }}</p>

    <template v-else-if="report">
      <div class="admin-general-traffic__summary" :aria-label="ext.traffic.summaryAria">
        <article class="admin-general-traffic__stat admin-general-traffic__stat--accent">
          <p class="admin-general-traffic__stat-label">{{ ext.traffic.stats.pageViews }}</p>
          <strong class="admin-general-traffic__stat-value">
            {{ formatCount(report.totals.page_views) }}
          </strong>
          <span class="admin-general-traffic__stat-meta">{{ ext.traffic.stats.onPeriod }}</span>
        </article>

        <article class="admin-general-traffic__stat">
          <p class="admin-general-traffic__stat-label">{{ ext.traffic.stats.uniqueVisitors }}</p>
          <strong class="admin-general-traffic__stat-value">
            {{ formatCount(report.totals.unique_visitors) }}
          </strong>
          <span class="admin-general-traffic__stat-meta">{{ ext.traffic.stats.onPeriod }}</span>
        </article>

        <article class="admin-general-traffic__stat">
          <p class="admin-general-traffic__stat-label">{{ ext.traffic.stats.dailyAverage }}</p>
          <strong class="admin-general-traffic__stat-value">
            {{ formatCount(dailyAverageViews) }}
          </strong>
          <span class="admin-general-traffic__stat-meta">{{ ext.traffic.stats.viewsPerDay }}</span>
        </article>
      </div>

      <AdminEmptyState
        v-if="report.totals.page_views === 0"
        icon="eye"
        :title="ext.traffic.empty.title"
        :description="ext.traffic.empty.description"
      />

      <template v-else>
        <section v-if="chartPoints.length" class="admin-general-traffic__section admin-general-traffic__section--chart">
          <h4 class="admin-general-traffic__section-title">{{ chartTitle }}</h4>

          <AdminTrafficLineChart
            :points="chartPoints"
            :locale="locale"
            :aria-label="ext.traffic.chartAria"
            :legend-page-views="ext.traffic.stats.pageViews"
            :legend-unique-visitors="ext.traffic.stats.uniqueVisitors"
            :tooltip-views-label="ext.traffic.chartTooltipViews"
            :tooltip-visitors-label="ext.traffic.chartTooltipVisitors"
          />
        </section>
      </template>

      <p class="admin-general-traffic__note">{{ ext.traffic.note }}</p>
    </template>
  </div>
</template>
