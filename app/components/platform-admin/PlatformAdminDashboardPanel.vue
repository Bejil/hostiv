<script setup lang="ts">
import AdminIcon from "../admin/AdminIcon.vue"
import type { PlatformAdminDashboardStats } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const { ui, formatEuro, formatDate, locale } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminDashboardStats>(
  props.platformFetch,
  "/api/platform-admin/dashboard"
)

onMounted(load)

defineExpose({ load })

const heroCards = computed(() => {
  const stats = data.value

  if (!stats) {
    return []
  }

  const d = ui.value.dashboard

  return [
    {
      icon: "user" as const,
      label: d.hero.members,
      value: String(stats.members_total),
      hint: `${d.kpi.newMembers30d}: +${stats.new_members_30d}`,
      momPct: stats.members_mom_pct,
      accent: false
    },
    {
      icon: "home" as const,
      label: d.hero.sites,
      value: String(stats.sites_total),
      hint: `${d.kpi.published}: ${stats.sites_published} · ${d.kpi.draft}: ${stats.sites_draft}`,
      momPct: stats.sites_mom_pct,
      accent: false
    },
    {
      icon: "card" as const,
      label: d.hero.activePlans,
      value: String(stats.subscriptions_active),
      hint: `${d.kpi.starterActive}: ${stats.starter_active} · ${d.kpi.proActive}: ${stats.pro_active}`,
      momPct: stats.subscriptions_active_mom_pct,
      accent: false
    },
    {
      icon: "sparkles" as const,
      label: d.hero.revenue,
      value: formatEuro(stats.revenue_total_eur),
      hint: `${d.hero.revenue30d}: ${formatEuro(stats.revenue_last_30d_eur)}`,
      momPct: stats.revenue_mom_pct,
      accent: true
    }
  ]
})

const planMetrics = computed(() => {
  const stats = data.value

  if (!stats) {
    return []
  }

  const k = ui.value.dashboard.kpi
  const total = Math.max(stats.subscriptions_active, 1)

  return [
    { label: k.starterActive, value: stats.starter_active, share: Math.round((stats.starter_active / total) * 100) },
    { label: k.proActive, value: stats.pro_active, share: Math.round((stats.pro_active / total) * 100) },
    { label: k.starterPlusActive, value: stats.starter_plus_active, share: Math.round((stats.starter_plus_active / total) * 100) }
  ]
})

const activityMetrics = computed(() => {
  const stats = data.value

  if (!stats) {
    return []
  }

  const k = ui.value.dashboard.kpi

  return [
    { label: k.newMembers30d, value: stats.new_members_30d },
    { label: k.newSites30d, value: stats.new_sites_30d },
    { label: k.pendingSignups, value: stats.pending_signups }
  ]
})

const bookingMetrics = computed(() => {
  const stats = data.value

  if (!stats) {
    return []
  }

  const k = ui.value.dashboard.kpi

  return [
    { label: k.reservations, value: stats.reservations_confirmed, sub: `/ ${stats.reservations_total}` },
    { label: k.gmv, value: formatEuro(stats.reservations_gmv_eur) },
    {
      label: k.guestReviews,
      value: String(stats.guest_reviews_total),
      sub: stats.guest_reviews_avg_rating ? `${k.avgRating}: ${stats.guest_reviews_avg_rating}/5` : undefined
    }
  ]
})

const healthItems = computed(() => {
  const stats = data.value

  if (!stats) {
    return []
  }

  const h = ui.value.dashboard.health

  return [
    { label: h.expired, value: stats.subscriptions_expired, tone: stats.subscriptions_expired > 0 ? "warn" : "ok" },
    { label: h.unpaid, value: stats.subscriptions_unpaid, tone: stats.subscriptions_unpaid > 0 ? "warn" : "ok" },
    { label: h.pendingSignups, value: stats.pending_signups, tone: stats.pending_signups > 0 ? "info" : "ok" },
    { label: h.stripeMissing, value: stats.stripe_missing_count, tone: stats.stripe_missing_count > 0 ? "warn" : "ok" },
    { label: h.drafts, value: stats.sites_draft, tone: stats.sites_draft > 0 ? "muted" : "ok" }
  ]
})

function formatMomPct(pct: number | null) {
  if (pct === null) {
    return null
  }

  const formatted = Math.abs(pct).toLocaleString(locale.value, { maximumFractionDigits: 1 })

  if (pct > 0) {
    return `+${formatted} %`
  }

  if (pct < 0) {
    return `−${formatted} %`
  }

  return "0 %"
}

function momDeltaClass(pct: number | null, accent = false) {
  const base = accent
    ? "platform-admin-dashboard__hero-delta--accent"
    : "platform-admin-dashboard__hero-delta"

  if (pct === null || pct === 0) {
    return `${base} platform-admin-dashboard__hero-delta--flat`
  }

  return pct > 0
    ? `${base} platform-admin-dashboard__hero-delta--up`
    : `${base} platform-admin-dashboard__hero-delta--down`
}
</script>

<template>
  <section class="platform-admin-panel platform-admin-dashboard">
    <header class="platform-admin-dashboard__head">
      <div>
        <h2 class="platform-admin-panel__title">{{ ui.dashboard.title }}</h2>
        <p class="platform-admin-panel__intro">{{ ui.dashboard.intro }}</p>
      </div>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <template v-else-if="data">
      <div class="platform-admin-dashboard__hero">
        <article
          v-for="card in heroCards"
          :key="card.label"
          class="platform-admin-dashboard__hero-card"
          :class="{ 'platform-admin-dashboard__hero-card--accent': card.accent }"
        >
          <span class="platform-admin-dashboard__hero-icon" aria-hidden="true">
            <AdminIcon :name="card.icon" :size="18" />
          </span>
          <p class="platform-admin-dashboard__hero-label">{{ card.label }}</p>
          <div class="platform-admin-dashboard__hero-value-row">
            <p class="platform-admin-dashboard__hero-value">{{ card.value }}</p>
            <span
              v-if="formatMomPct(card.momPct)"
              class="platform-admin-dashboard__hero-delta"
              :class="momDeltaClass(card.momPct, card.accent)"
              :title="`${formatMomPct(card.momPct)} ${ui.dashboard.vsLastMonth}`"
            >
              {{ formatMomPct(card.momPct) }}
            </span>
          </div>
          <p class="platform-admin-dashboard__hero-hint">{{ card.hint }}</p>
        </article>
      </div>

      <div class="platform-admin-dashboard__grid">
        <section class="platform-admin-dashboard__panel">
          <header class="platform-admin-dashboard__panel-head">
            <AdminIcon name="card" :size="16" />
            <h3>{{ ui.dashboard.sections.plans }}</h3>
          </header>
          <div class="platform-admin-dashboard__plan-list">
            <div v-for="metric in planMetrics" :key="metric.label" class="platform-admin-dashboard__plan-row">
              <div class="platform-admin-dashboard__plan-row-top">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </div>
              <div class="platform-admin-dashboard__plan-bar" aria-hidden="true">
                <span :style="{ width: `${metric.share}%` }" />
              </div>
            </div>
          </div>
        </section>

        <section class="platform-admin-dashboard__panel">
          <header class="platform-admin-dashboard__panel-head">
            <AdminIcon name="calendar" :size="16" />
            <h3>{{ ui.dashboard.sections.activity }}</h3>
          </header>
          <div class="platform-admin-dashboard__stat-grid">
            <div v-for="metric in activityMetrics" :key="metric.label" class="platform-admin-dashboard__stat">
              <p class="platform-admin-dashboard__stat-label">{{ metric.label }}</p>
              <p class="platform-admin-dashboard__stat-value">{{ metric.value }}</p>
            </div>
          </div>
        </section>

        <section class="platform-admin-dashboard__panel">
          <header class="platform-admin-dashboard__panel-head">
            <AdminIcon name="list" :size="16" />
            <h3>{{ ui.dashboard.sections.bookings }}</h3>
          </header>
          <div class="platform-admin-dashboard__stat-grid platform-admin-dashboard__stat-grid--bookings">
            <div v-for="metric in bookingMetrics" :key="metric.label" class="platform-admin-dashboard__stat">
              <p class="platform-admin-dashboard__stat-label">{{ metric.label }}</p>
              <p class="platform-admin-dashboard__stat-value">
                {{ metric.value }}
                <span v-if="metric.sub" class="platform-admin-dashboard__stat-sub">{{ metric.sub }}</span>
              </p>
            </div>
          </div>
        </section>

        <section class="platform-admin-dashboard__panel">
          <header class="platform-admin-dashboard__panel-head">
            <AdminIcon name="alert" :size="16" />
            <h3>{{ ui.dashboard.sections.health }}</h3>
          </header>
          <ul class="platform-admin-dashboard__health-list">
            <li
              v-for="item in healthItems"
              :key="item.label"
              class="platform-admin-dashboard__health-item"
              :class="`platform-admin-dashboard__health-item--${item.tone}`"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </section>
      </div>

      <section class="platform-admin-dashboard__panel platform-admin-dashboard__panel--wide">
        <header class="platform-admin-dashboard__panel-head">
          <AdminIcon name="sparkles" :size="16" />
          <h3>{{ ui.dashboard.recentPayments }}</h3>
        </header>

        <p v-if="!data.recent_payments.length" class="platform-admin-dashboard__empty">
          {{ ui.dashboard.noRecentPayments }}
        </p>
      </section>

      <div v-if="data.recent_payments.length" class="platform-admin-table-wrap">
        <table class="platform-admin-table platform-admin-table--align-middle">
          <thead>
            <tr>
              <th>{{ ui.revenue.columns.date }}</th>
              <th>{{ ui.revenue.columns.type }}</th>
              <th>{{ ui.revenue.columns.product }}</th>
              <th>{{ ui.revenue.columns.member }}</th>
              <th>{{ ui.revenue.columns.amount }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in data.recent_payments" :key="payment.id">
              <td>{{ formatDate(payment.paid_at) }}</td>
              <td>
                <span class="platform-admin-badge">{{ ui.dashboard.checkoutTypes[payment.checkout_type] }}</span>
              </td>
              <td>{{ payment.product_label }}</td>
              <td>{{ payment.member_email ?? "—" }}</td>
              <td>{{ formatEuro(payment.amount_eur) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
