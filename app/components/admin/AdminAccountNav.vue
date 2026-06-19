<script setup lang="ts">
import {
  getAdminAccountViews,
  type AdminAccountViewId
} from "../../data/admin-account-sections"

const props = defineProps<{
  activeView: AdminAccountViewId
  showCohosts?: boolean
  showPlans?: boolean
}>()

const emit = defineEmits<{
  select: [view: AdminAccountViewId]
}>()

const { ui, locale } = useAdminUi()

const accountNavItems = computed(() => {
  let items = getAdminAccountViews(locale.value)

  if (!props.showPlans) {
    items = items.filter((item) => item.id !== "plans")
  }

  if (!props.showCohosts) {
    items = items.filter((item) => item.id !== "cohosts")
  }

  return items
})
</script>

<template>
  <aside class="admin-gallery-editor__sidebar">
    <div class="admin-gallery-editor__sidebar-head">
      <p class="admin-gallery-editor__sidebar-label">{{ ui.header.account }}</p>
    </div>

    <nav class="admin-gallery-editor__nav" :aria-label="ui.header.account">
      <button
        v-for="item in accountNavItems"
        :key="item.id"
        type="button"
        class="admin-gallery-editor__nav-item"
        :class="{
          'admin-gallery-editor__nav-item--active': activeView === item.id
        }"
        :aria-current="activeView === item.id ? 'page' : undefined"
        @click="emit('select', item.id)"
      >
        <span class="admin-gallery-editor__nav-copy">
          <span class="admin-gallery-editor__nav-title-row">
            <span class="admin-gallery-editor__nav-label">{{ item.label }}</span>
          </span>
          <span class="admin-gallery-editor__nav-description">{{ item.description }}</span>
        </span>
      </button>
    </nav>
  </aside>
</template>
