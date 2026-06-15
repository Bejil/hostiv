<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import type { PlatformAdminSignupRow } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminSignupRow[]>(
  props.platformFetch,
  "/api/platform-admin/signups"
)

onMounted(load)

defineExpose({ load })
</script>

<template>
  <section class="platform-admin-panel">
    <header class="platform-admin-panel__head">
      <h2 class="platform-admin-panel__title">{{ ui.signups.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.signups.intro }}</p>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <AdminEmptyState v-else-if="!data?.length" icon="plus" :title="ui.signups.empty" description="" />

    <div v-else class="platform-admin-table-wrap">
      <table class="platform-admin-table">
        <thead>
          <tr>
            <th>{{ ui.signups.columns.contact }}</th>
            <th>{{ ui.signups.columns.property }}</th>
            <th>{{ ui.signups.columns.plan }}</th>
            <th>{{ ui.signups.columns.status }}</th>
            <th>{{ ui.signups.columns.created }}</th>
            <th>{{ ui.signups.columns.expires }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <td>
              <strong>{{ row.full_name }}</strong>
              <span class="platform-admin-muted">{{ row.email }}</span>
            </td>
            <td>
              {{ row.property_name }}
              <span class="platform-admin-muted">/{{ row.property_slug }}</span>
            </td>
            <td><span class="platform-admin-badge">{{ row.subscription_plan }}</span></td>
            <td>
              <span
                class="platform-admin-status"
                :class="{
                  'platform-admin-status--ok': row.status === 'completed',
                  'platform-admin-status--warn': row.status === 'pending',
                  'platform-admin-status--critical': row.status === 'failed'
                }"
              >
                {{ ui.signups.status[row.status] }}
              </span>
            </td>
            <td>{{ formatDate(row.created_at) }}</td>
            <td>{{ formatDate(row.expires_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
