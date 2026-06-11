<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import type { AdminIconName } from "./admin-icon-types"

withDefaults(
  defineProps<{
    icon: AdminIconName
    title: string
    description: string
    compact?: boolean
  }>(),
  {
    compact: false
  }
)
</script>

<template>
  <div class="admin-empty-state" :class="{ 'admin-empty-state--compact': compact }">
    <div class="admin-empty-state__icon" aria-hidden="true">
      <AdminIcon :name="icon" :size="28" />
    </div>
    <h3 class="admin-empty-state__title">{{ title }}</h3>
    <p class="admin-empty-state__description">{{ description }}</p>
    <div v-if="$slots.default" class="admin-empty-state__actions">
      <slot />
    </div>
  </div>
</template>
