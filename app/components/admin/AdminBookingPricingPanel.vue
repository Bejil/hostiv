<script setup lang="ts">
import AdminBookingConfigForm, { type BookingRateTabId } from "./AdminBookingConfigForm.vue"
import type { PropertyBookingConfig } from "../../types/property-site"

defineProps<{
  modelValue: PropertyBookingConfig
  section: BookingRateTabId
}>()

defineEmits<{
  "update:modelValue": [value: PropertyBookingConfig]
}>()
</script>

<template>
  <div class="admin-booking-pricing-panel">
    <AdminBookingConfigForm
      :model-value="modelValue"
      :locked-section="section"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
