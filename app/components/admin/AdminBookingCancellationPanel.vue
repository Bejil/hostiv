<script setup lang="ts">
import AdminField from "./AdminField.vue"
import type { PropertyBookingConfig } from "../../types/property-site"
import { formatCancellationRefundPolicy } from "../../utils/cancellation-policy"

const props = defineProps<{
  modelValue: PropertyBookingConfig
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyBookingConfig]
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const previewText = computed(() =>
  formatCancellationRefundPolicy(props.modelValue, locale.value)
)

function patch(partial: Partial<PropertyBookingConfig>) {
  emit("update:modelValue", { ...props.modelValue, ...partial })
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

function clampDays(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.round(value))
}
</script>

<template>
  <section class="admin-booking-cancellation" aria-labelledby="admin-booking-cancellation-title">
    <header class="admin-booking-cancellation__head">
      <div>
        <p class="admin-booking-cancellation__kicker">{{ ext.cancellation.kicker }}</p>
        <h4 id="admin-booking-cancellation-title" class="admin-booking-cancellation__title">
          {{ ext.cancellation.title }}
        </h4>
        <p class="admin-booking-cancellation__lead">
          {{ ext.cancellation.lead }}
        </p>
      </div>
    </header>

    <div class="admin-booking-config__grid">
      <AdminField
        :label="ext.cancellation.fields.refundPercent"
        type="number"
        step="1"
        min="0"
        max="100"
        :hint="ext.cancellation.fields.refundHint"
        :model-value="modelValue.cancellation_refund_percent"
        @update:model-value="patch({ cancellation_refund_percent: clampPercent($event as number) })"
      />
      <AdminField
        :label="ext.cancellation.fields.daysBefore"
        type="number"
        min="0"
        :hint="ext.cancellation.fields.daysHint"
        :model-value="modelValue.cancellation_days_before_checkin"
        @update:model-value="patch({ cancellation_days_before_checkin: clampDays($event as number) })"
      />
    </div>

    <p v-if="previewText" class="admin-booking-cancellation__preview">
      <span class="admin-booking-cancellation__preview-label">{{ ext.cancellation.previewLabel }}</span>
      {{ previewText }}
    </p>
    <p v-else class="admin-booking-cancellation__preview admin-booking-cancellation__preview--muted">
      {{ ext.cancellation.previewHidden }}
    </p>
  </section>
</template>
