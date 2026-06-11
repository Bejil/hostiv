<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminToggle from "./AdminToggle.vue"
import type { PropertyBookingConfig } from "../../types/property-site"

export type BookingRateTabId = "night" | "week" | "month"

const props = defineProps<{
  modelValue: PropertyBookingConfig
  activeTab?: BookingRateTabId
  lockedSection?: BookingRateTabId
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyBookingConfig]
  "update:activeTab": [value: BookingRateTabId]
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

const internalTab = ref<BookingRateTabId>(props.activeTab ?? "night")

watch(
  () => props.activeTab,
  (value) => {
    if (value) {
      internalTab.value = value
    }
  }
)

const activeTabId = computed({
  get: () => props.lockedSection ?? props.activeTab ?? internalTab.value,
  set: (value: BookingRateTabId) => {
    if (props.lockedSection) {
      return
    }

    internalTab.value = value
    emit("update:activeTab", value)
  }
})

function patch(partial: Partial<PropertyBookingConfig>) {
  emit("update:modelValue", { ...props.modelValue, ...partial })
}

function selectTab(id: BookingRateTabId) {
  activeTabId.value = id
}

function isDiscountTabMuted(id: BookingRateTabId) {
  if (id === "week") {
    return !props.modelValue.week_discount_enabled
  }

  if (id === "month") {
    return !props.modelValue.month_discount_enabled
  }

  return false
}

function discountRateToPercent(rate: number) {
  return Math.round(rate * 100)
}

function percentToDiscountRate(percent: number) {
  const value = Number(percent)

  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(1, Math.max(0, value / 100))
}
</script>

<template>
  <div
    class="admin-booking-config-form"
    :class="{ 'admin-booking-config-form--locked': lockedSection }"
  >
    <div v-if="!lockedSection" class="admin-tabs-shell">
      <div class="admin-tabs" role="tablist" :aria-label="ext.bookingConfig.pricingAria">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="admin-tabs__btn"
          :class="{
            'admin-tabs__btn--active': activeTabId === tab.id,
            'admin-tabs__btn--muted': isDiscountTabMuted(tab.id) && activeTabId !== tab.id
          }"
          :aria-selected="activeTabId === tab.id"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="activeTabId === 'night'" class="admin-booking-config__panel" role="tabpanel">
      <header class="admin-booking-config__panel-top">
        <div>
          <p class="admin-booking-config__panel-kicker">{{ ext.bookingConfig.baseKicker }}</p>
          <h4 class="admin-booking-config__panel-title">{{ ext.bookingTabs.night }}</h4>
        </div>
      </header>
      <AdminField
        :label="ext.bookingConfig.nightPrice"
        type="number"
        min="0"
        full-width
        :model-value="modelValue.base_night_price_eur"
        @update:model-value="patch({ base_night_price_eur: $event as number })"
      />
      <div class="admin-booking-config__grid">
        <AdminField
          :label="ext.bookingConfig.includedGuests"
          type="number"
          min="1"
          :model-value="modelValue.included_main_guests"
          @update:model-value="patch({ included_main_guests: $event as number })"
        />
        <AdminField
          :label="ext.bookingConfig.extraGuest"
          type="number"
          min="0"
          :model-value="modelValue.extra_main_guest_per_night_eur"
          @update:model-value="patch({ extra_main_guest_per_night_eur: $event as number })"
        />
      </div>
    </div>

    <div v-else-if="activeTabId === 'week'" class="admin-booking-config__panel" role="tabpanel">
      <header class="admin-booking-config__panel-top">
        <div>
          <p class="admin-booking-config__panel-kicker">{{ ext.bookingConfig.longStayKicker }}</p>
          <h4 class="admin-booking-config__panel-title">{{ ext.bookingTabs.week }}</h4>
        </div>
        <AdminToggle
          :model-value="modelValue.week_discount_enabled"
          :label="ext.bookingConfig.enableDiscount"
          @update:model-value="patch({ week_discount_enabled: $event })"
        />
      </header>
      <fieldset class="admin-booking-config__fieldset" :disabled="!modelValue.week_discount_enabled">
        <div class="admin-booking-config__grid">
          <AdminField
            :label="ext.bookingConfig.minNights"
            type="number"
            min="1"
            :model-value="modelValue.week_min_nights"
            @update:model-value="patch({ week_min_nights: $event as number })"
          />
          <AdminField
            :label="ext.bookingConfig.discountPercent"
            type="number"
            step="1"
            min="0"
            max="100"
            :model-value="discountRateToPercent(modelValue.week_discount_rate)"
            @update:model-value="patch({ week_discount_rate: percentToDiscountRate($event as number) })"
          />
        </div>
      </fieldset>
    </div>

    <div v-else class="admin-booking-config__panel" role="tabpanel">
      <header class="admin-booking-config__panel-top">
        <div>
          <p class="admin-booking-config__panel-kicker">{{ ext.bookingConfig.longStayKicker }}</p>
          <h4 class="admin-booking-config__panel-title">{{ ext.bookingTabs.month }}</h4>
        </div>
        <AdminToggle
          :model-value="modelValue.month_discount_enabled"
          :label="ext.bookingConfig.enableDiscount"
          @update:model-value="patch({ month_discount_enabled: $event })"
        />
      </header>
      <fieldset class="admin-booking-config__fieldset" :disabled="!modelValue.month_discount_enabled">
        <div class="admin-booking-config__grid">
          <AdminField
            :label="ext.bookingConfig.minNights"
            type="number"
            min="1"
            :model-value="modelValue.month_min_nights"
            @update:model-value="patch({ month_min_nights: $event as number })"
          />
          <AdminField
            :label="ext.bookingConfig.discountPercent"
            type="number"
            step="1"
            min="0"
            max="100"
            :model-value="discountRateToPercent(modelValue.month_discount_rate)"
            @update:model-value="patch({ month_discount_rate: percentToDiscountRate($event as number) })"
          />
        </div>
      </fieldset>
    </div>
  </div>
</template>
