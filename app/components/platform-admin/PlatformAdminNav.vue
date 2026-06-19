<script setup lang="ts">
import AdminIcon from "../admin/AdminIcon.vue"
import { getPlatformAdminNavItems } from "../../data/platform-admin-ui/nav-sections"
import type { PlatformAdminSectionId } from "../../types/platform-admin"

const props = defineProps<{
  activeSection: PlatformAdminSectionId
}>()

const emit = defineEmits<{
  select: [PlatformAdminSectionId]
}>()

const { ui, locale } = usePlatformAdminUi()

const navItems = computed(() => getPlatformAdminNavItems(locale.value))
</script>

<template>
  <nav class="admin-main-tabs" :aria-label="ui.shell.title">
    <div class="admin-main-tabs__bar">
      <div class="admin-main-tabs__inner">
        <div class="admin-main-tabs__tabs" role="tablist">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            role="tab"
            class="admin-main-tabs__tab"
            :class="{ 'admin-main-tabs__tab--active': activeSection === item.id }"
            :aria-selected="activeSection === item.id"
            @click="emit('select', item.id)"
          >
            <AdminIcon :name="item.icon" :size="18" />
            <span class="admin-main-tabs__label">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
