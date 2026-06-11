<script setup lang="ts">
import {
  getAdminAccountingSections,
  type AdminAccountingSectionId
} from "../../data/admin-accounting-sections"
import { getAdminTopNavItems } from "../../data/admin-nav-sections"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"

defineProps<{
  activeSection: AdminAccountingSectionId
  paymentsNavDescription?: string
}>()

const emit = defineEmits<{
  select: [section: AdminAccountingSectionId]
}>()

const sectionNav = inject(adminSectionNavKey)

if (!sectionNav) {
  throw new Error("AdminAccountingNav requires adminSectionNavKey")
}

const { ui, locale } = useAdminUi()

const accountingNavItems = computed(() => getAdminAccountingSections(locale.value))

const sidebarLabel = computed(
  () => getAdminTopNavItems(locale.value).find((item) => item.id === "payouts")?.label ?? ""
)

function navDescription(
  item: (typeof accountingNavItems.value)[number],
  paymentsNavDescription?: string
) {
  if (item.id === "payments" && paymentsNavDescription?.trim()) {
    return paymentsNavDescription.trim()
  }

  return item.description
}
</script>

<template>
  <aside class="admin-gallery-editor__sidebar">
    <div class="admin-gallery-editor__sidebar-head">
      <p class="admin-gallery-editor__sidebar-label">{{ sidebarLabel }}</p>
    </div>

    <nav class="admin-gallery-editor__nav" :aria-label="sidebarLabel">
      <button
        v-for="item in accountingNavItems"
        :key="item.id"
        type="button"
        class="admin-gallery-editor__nav-item"
        :class="{
          'admin-gallery-editor__nav-item--active': activeSection === item.id
        }"
        :aria-current="activeSection === item.id ? 'page' : undefined"
        @click="emit('select', item.id)"
      >
        <span class="admin-gallery-editor__nav-copy">
          <span class="admin-gallery-editor__nav-title-row">
            <span class="admin-gallery-editor__nav-label">{{ item.label }}</span>
          </span>
          <span class="admin-gallery-editor__nav-description">
            {{ navDescription(item, paymentsNavDescription) }}
          </span>
        </span>
        <span
          v-if="item.id === 'payments' && sectionNav.stripeConnectNeedsAttention.value"
          class="admin-main-tabs__pill admin-main-tabs__pill--alert"
          :class="{
            'admin-main-tabs__pill--muted': activeSection !== 'payments'
          }"
          :aria-label="ui.mainTabs.stripeIncomplete"
        >
          !
        </span>
      </button>
    </nav>
  </aside>
</template>
