<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import AdminIcon from "../admin/AdminIcon.vue"
import type { AdminIconName } from "../admin/admin-icon-types"
import type { PlatformAdminRevenueReport } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const { ui, formatEuro, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminRevenueReport>(
  props.platformFetch,
  "/api/platform-admin/revenue"
)

onMounted(load)

defineExpose({ load })

const summaryCards = computed(() => {
  const report = data.value

  if (!report) {
    return []
  }

  const { summary } = report
  const s = ui.value.revenue.summary

  return [
    {
      icon: "sparkles" as const satisfies AdminIconName,
      label: s.total,
      value: formatEuro(summary.total_collected_eur),
      hint: `${summary.payments_count} ${s.payments.toLowerCase()}`,
      accent: true
    },
    {
      icon: "calendar" as const satisfies AdminIconName,
      label: s.last30d,
      value: formatEuro(summary.last_30d_eur),
      hint: `${summary.last_30d_count} ${s.payments.toLowerCase()}`,
      accent: false
    },
    {
      icon: "user" as const satisfies AdminIconName,
      label: s.signup,
      value: formatEuro(summary.signup_eur),
      accent: false
    },
    {
      icon: "card" as const satisfies AdminIconName,
      label: s.renewal,
      value: formatEuro(summary.subscription_eur),
      accent: false
    },
    {
      icon: "star" as const satisfies AdminIconName,
      label: s.premiumTools,
      value: formatEuro(summary.premium_tools_eur),
      accent: false
    }
  ]
})
</script>

<template>
  <section class="platform-admin-panel platform-admin-dashboard">
    <header class="platform-admin-dashboard__head">
      <div>
        <h2 class="platform-admin-panel__title">{{ ui.revenue.title }}</h2>
        <p class="platform-admin-panel__intro">{{ ui.revenue.intro }}</p>
      </div>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <template v-else-if="data">
      <div class="platform-admin-dashboard__hero platform-admin-dashboard__hero--revenue">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="platform-admin-dashboard__hero-card"
          :class="{ 'platform-admin-dashboard__hero-card--accent': card.accent }"
        >
          <span class="platform-admin-dashboard__hero-icon" aria-hidden="true">
            <AdminIcon :name="card.icon" :size="18" />
          </span>
          <p class="platform-admin-dashboard__hero-label">{{ card.label }}</p>
          <p class="platform-admin-dashboard__hero-value">{{ card.value }}</p>
          <p v-if="card.hint" class="platform-admin-dashboard__hero-hint">{{ card.hint }}</p>
        </article>
      </div>

      <section
        v-if="!data.payments.length"
        class="platform-admin-dashboard__panel platform-admin-dashboard__panel--wide"
      >
        <AdminEmptyState
          icon="card"
          :title="ui.revenue.empty"
          description=""
        />
      </section>

      <template v-else>
        <div class="platform-admin-table-wrap">
          <table class="platform-admin-table platform-admin-table--align-middle">
            <thead>
              <tr>
                <th>{{ ui.revenue.columns.date }}</th>
                <th>{{ ui.revenue.columns.type }}</th>
                <th>{{ ui.revenue.columns.product }}</th>
                <th>{{ ui.revenue.columns.member }}</th>
                <th>{{ ui.revenue.columns.site }}</th>
                <th>{{ ui.revenue.columns.amount }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in data.payments" :key="payment.id">
                <td>{{ formatDate(payment.paid_at) }}</td>
                <td>
                  <span class="platform-admin-badge">{{ ui.revenue.checkoutTypes[payment.checkout_type] }}</span>
                </td>
                <td>{{ payment.product_label }}</td>
                <td>{{ payment.member_email ?? "—" }}</td>
                <td>
                  <NuxtLink
                    v-if="payment.property_slug"
                    :to="`/${payment.property_slug}/admin`"
                    target="_blank"
                    rel="noopener"
                    class="platform-admin-link"
                  >
                    /{{ payment.property_slug }}
                  </NuxtLink>
                  <span v-else>—</span>
                </td>
                <td>{{ formatEuro(payment.amount_eur) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="platform-admin-disclaimer">{{ ui.revenue.historyNote }}</p>
      </template>
    </template>
  </section>
</template>
