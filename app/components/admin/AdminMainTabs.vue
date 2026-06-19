<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import { useAdminProFeatureGate } from "../../composables/admin-pro-feature-context"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import { getAdminTopNavItems, type AdminTopSectionId } from "../../data/admin-nav-sections"
import { adminUiFormat } from "../../data/admin-ui"
import type { PropertyAdminRecord } from "../../types/property-admin"
import { getIncompleteCustomizationBlockCount } from "../../utils/admin-customization-block-completion"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
}>()

const previewHref = computed(() => `/${props.slug}/preview`)

const { ui, locale } = useAdminUi()

const topNavItems = computed(() => getAdminTopNavItems(locale.value))

const visibleTopNavItems = computed(() => {
  const items = topNavItems.value
  const isCohost = props.record.admin_access?.role === "cohost"

  return items.filter((item) => {
    if (item.id === "account") {
      return false
    }

    if (isCohost && item.id === "payouts") {
      return false
    }

    return true
  })
})

const incompleteCustomizationCount = computed(() =>
  getIncompleteCustomizationBlockCount(props.record, locale.value)
)

const incompleteCustomizationAriaLabel = computed(() => {
  const count = incompleteCustomizationCount.value

  if (count === 1) {
    return ui.value.mainTabs.incompleteSectionOne
  }

  return adminUiFormat(ui.value.mainTabs.incompleteSections, { count: String(count) })
})

const sectionNav = inject(adminSectionNavKey)

if (!sectionNav) {
  throw new Error("AdminMainTabs requires adminSectionNavKey")
}

const proFeatureGate = useAdminProFeatureGate()

function onTabClick(sectionId: AdminTopSectionId) {
  if (sectionId === "welcome-guide" && !proFeatureGate.requireProFeature("welcome-guide")) {
    return
  }

  sectionNav.selectSection(sectionId)
}
</script>

<template>
  <nav class="admin-main-tabs" :aria-label="ui.mainTabs.ariaLabel">
    <div class="admin-main-tabs__bar">
      <div class="admin-main-tabs__inner">
        <div class="admin-main-tabs__tabs" role="tablist">
          <button
            v-for="item in visibleTopNavItems"
            :key="item.id"
            type="button"
            role="tab"
            class="admin-main-tabs__tab"
            :class="{ 'admin-main-tabs__tab--active': sectionNav.activeMenuSection.value === item.id }"
            :aria-selected="sectionNav.activeMenuSection.value === item.id"
            @click="onTabClick(item.id)"
          >
            <AdminIcon :name="item.icon" :size="18" />
            <span class="admin-main-tabs__label">{{ item.label }}</span>
            <span
              v-if="item.id === 'customization' && incompleteCustomizationCount > 0"
              class="admin-main-tabs__pill"
              :class="{
                'admin-main-tabs__pill--muted': sectionNav.activeMenuSection.value !== 'customization'
              }"
              :aria-label="incompleteCustomizationAriaLabel"
            >
              {{ incompleteCustomizationCount }}
            </span>
            <span
              v-if="item.id === 'reservations'"
              class="admin-main-tabs__pill"
              :class="{
                'admin-main-tabs__pill--muted': sectionNav.activeMenuSection.value !== 'reservations'
              }"
              :aria-label="ui.mainTabs.upcomingReservations"
            >
              {{ sectionNav.upcomingReservationCount.value }}
            </span>
            <span
              v-if="item.id === 'payouts' && sectionNav.stripeConnectNeedsAttention.value"
              class="admin-main-tabs__pill admin-main-tabs__pill--alert"
              :class="{
                'admin-main-tabs__pill--muted': sectionNav.activeMenuSection.value !== 'payouts'
              }"
              :aria-label="ui.mainTabs.stripeIncomplete"
            >
              !
            </span>
          </button>
        </div>

        <span class="admin-main-tabs__divider" aria-hidden="true" />

        <a
          class="admin-main-tabs__tab admin-main-tabs__tab--external"
          :href="previewHref"
          target="_blank"
          rel="noopener noreferrer"
          :title="ui.mainTabs.previewTitle"
        >
          <AdminIcon name="external" :size="18" />
          <span class="admin-main-tabs__label">{{ ui.mainTabs.preview }}</span>
        </a>
      </div>
    </div>
  </nav>
</template>
