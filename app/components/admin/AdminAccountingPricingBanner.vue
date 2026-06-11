<script setup lang="ts">
import type { PropertyBookingConfig } from "../../types/property-site"
import type { BookingRateTabId } from "./AdminBookingConfigForm.vue"

const props = defineProps<{
  config: PropertyBookingConfig
  activeSection: BookingRateTabId
}>()

const emit = defineEmits<{
  configure: [tab: BookingRateTabId]
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const tabs = computed(() => {
  const labels = ext.value.bookingTabs

  return [
    { id: "night" as const, label: labels.night },
    { id: "week" as const, label: labels.week },
    { id: "month" as const, label: labels.month }
  ]
})

function isTabMuted(id: BookingRateTabId) {
  if (id === "week") {
    return !props.config.week_discount_enabled
  }

  if (id === "month") {
    return !props.config.month_discount_enabled
  }

  return false
}
</script>

<template>
  <nav class="admin-accounting__pricing-tabs" :aria-label="ext.accounting.pricingTabsAria">
    <div class="admin-tabs-shell">
      <div class="admin-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="admin-tabs__btn"
          :class="{
            'admin-tabs__btn--active': activeSection === tab.id,
            'admin-tabs__btn--muted': isTabMuted(tab.id) && activeSection !== tab.id
          }"
          :aria-selected="activeSection === tab.id"
          @click="emit('configure', tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </nav>
</template>
