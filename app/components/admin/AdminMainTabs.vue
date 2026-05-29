<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import { adminTopNavItems } from "../../data/admin-nav-sections"

defineProps<{
  slug: string
}>()

const sectionNav = inject(adminSectionNavKey)

if (!sectionNav) {
  throw new Error("AdminMainTabs requires adminSectionNavKey")
}
</script>

<template>
  <nav class="admin-main-tabs" aria-label="Paramètres du site">
    <div class="admin-main-tabs__list" role="tablist">
      <button
        v-for="item in adminTopNavItems"
        :key="item.id"
        type="button"
        role="tab"
        class="admin-main-tabs__tab"
        :class="{ 'admin-main-tabs__tab--active': sectionNav.activeMenuSection.value === item.id }"
        :aria-selected="sectionNav.activeMenuSection.value === item.id"
        @click="sectionNav.selectSection(item.id)"
      >
        <AdminIcon :name="item.icon" :size="18" />
        <span class="admin-main-tabs__label">{{ item.label }}</span>
        <span
          v-if="item.id === 'reservations'"
          class="admin-main-tabs__pill"
          :class="{
            'admin-main-tabs__pill--muted': sectionNav.activeMenuSection.value !== 'reservations'
          }"
          aria-label="Réservations à venir"
        >
          {{ sectionNav.upcomingReservationCount.value }}
        </span>
      </button>

      <a
        class="admin-main-tabs__tab admin-main-tabs__tab--external"
        :href="`/${slug}/preview`"
        target="_blank"
        rel="noopener noreferrer"
        title="Ouvrir l’aperçu du site dans un nouvel onglet"
      >
        <AdminIcon name="external" :size="18" />
        <span class="admin-main-tabs__label">Aperçu</span>
      </a>
    </div>
  </nav>
</template>
