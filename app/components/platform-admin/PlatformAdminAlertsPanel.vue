<script setup lang="ts">
import AdminEmptyState from "../admin/AdminEmptyState.vue"
import type { PlatformAdminAlertRow } from "../../types/platform-admin"

const props = defineProps<{
  platformFetch: (path: string) => Promise<unknown>
}>()

const emit = defineEmits<{
  loaded: [number]
}>()

const { ui, formatDate } = usePlatformAdminUi()
const { loading, error, data, load } = usePlatformAdminDataLoader<PlatformAdminAlertRow[]>(
  props.platformFetch,
  "/api/platform-admin/alerts"
)

onMounted(async () => {
  await load()
  emit("loaded", data.value?.length ?? 0)
})

defineExpose({ load })

watch(data, (rows) => {
  emit("loaded", rows?.length ?? 0)
})
</script>

<template>
  <section class="platform-admin-panel">
    <header class="platform-admin-panel__head">
      <h2 class="platform-admin-panel__title">{{ ui.alerts.title }}</h2>
      <p class="platform-admin-panel__intro">{{ ui.alerts.intro }}</p>
    </header>

    <p v-if="error" class="platform-admin-panel__error" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="platform-admin-panel__loading">{{ ui.shell.loading }}</p>

    <AdminEmptyState v-else-if="!data?.length" icon="alert" :title="ui.alerts.empty" description="" />

    <div v-else class="platform-admin-alerts-list">
      <article
        v-for="alert in data"
        :key="alert.id"
        class="platform-admin-alert-card"
        :class="`platform-admin-alert-card--${alert.severity}`"
      >
        <div class="platform-admin-alert-card__head">
          <span class="platform-admin-alert-card__severity">
            {{ ui.alerts.severity[alert.severity] }}
          </span>
          <h3>{{ alert.title }}</h3>
        </div>
        <p>{{ alert.detail }}</p>
        <div class="platform-admin-alert-card__meta">
          <NuxtLink
            v-if="alert.property_slug"
            :to="`/${alert.property_slug}/admin`"
            class="platform-admin-link"
          >
            /{{ alert.property_slug }}
          </NuxtLink>
          <span v-if="alert.member_email" class="platform-admin-muted">{{ alert.member_email }}</span>
          <time v-if="alert.due_at">{{ formatDate(alert.due_at) }}</time>
        </div>
      </article>
    </div>
  </section>
</template>
