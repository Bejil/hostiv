<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import type { PlatformAdminReservationsPayload } from "../../composables/usePlatformAdmin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const { ui, formatEuro, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminReservationsPayload>(
  props.platformFetch,
  "/api/platform-admin/reservations"
)

onMounted(load)

defineExpose({ load })
</script>

<template>
  <section class="platform-admin-panel">
    <header class="platform-admin-panel__head">
      <h2 class="platform-admin-panel__title">{{ ui.reservations.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.reservations.intro }}</p>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <template v-else-if="data">
      <div class="platform-admin-summary-grid">
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.total }}</p>
          <p class="platform-admin-summary-card__value">{{ data.summary.total }}</p>
        </article>
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.confirmed }}</p>
          <p class="platform-admin-summary-card__value">{{ data.summary.confirmed }}</p>
        </article>
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.cancelled }}</p>
          <p class="platform-admin-summary-card__value">{{ data.summary.cancelled }}</p>
        </article>
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.gmv }}</p>
          <p class="platform-admin-summary-card__value">{{ formatEuro(data.summary.gmv_eur) }}</p>
        </article>
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.avg }}</p>
          <p class="platform-admin-summary-card__value">{{ formatEuro(data.summary.avg_booking_eur) }}</p>
        </article>
        <article class="platform-admin-summary-card">
          <p class="platform-admin-summary-card__label">{{ ui.reservations.summary.last30d }}</p>
          <p class="platform-admin-summary-card__value">
            {{ data.summary.last_30d_count }} · {{ formatEuro(data.summary.last_30d_gmv_eur) }}
          </p>
        </article>
      </div>

      <AdminEmptyState v-if="!data.rows.length" icon="calendar" :title="ui.reservations.empty" description="" />

      <div v-else class="platform-admin-table-wrap">
        <table class="platform-admin-table">
          <thead>
            <tr>
              <th>{{ ui.reservations.columns.site }}</th>
              <th>{{ ui.reservations.columns.guest }}</th>
              <th>{{ ui.reservations.columns.dates }}</th>
              <th>{{ ui.reservations.columns.amount }}</th>
              <th>{{ ui.reservations.columns.status }}</th>
              <th>{{ ui.reservations.columns.created }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.rows" :key="row.id">
              <td>
                <strong>{{ row.brand_name }}</strong>
                <span class="platform-admin-muted">/{{ row.property_slug }}</span>
              </td>
              <td>
                {{ row.guest_name }}
                <span class="platform-admin-muted">{{ row.guest_email }}</span>
              </td>
              <td>
                {{ formatDate(row.arrival_date) }} → {{ formatDate(row.departure_date) }}
                <span class="platform-admin-muted">{{ row.stay_nights }} n.</span>
              </td>
              <td>{{ formatEuro(row.total_eur) }}</td>
              <td>
                {{
                  row.status === "confirmed"
                    ? ui.reservations.confirmed
                    : ui.reservations.cancelled
                }}
              </td>
              <td>{{ formatDate(row.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
