<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import type { AdminBookingReservationStatus } from "../../types/booking-reservation"
import {
  ADMIN_RESERVATION_FILTER_STATUSES,
  type AdminReservationStatusFilter
} from "../../utils/filter-admin-reservations"

const props = defineProps<{
  modelValue: AdminReservationStatusFilter
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended.reservations)

const emit = defineEmits<{
  "update:modelValue": [value: AdminReservationStatusFilter]
}>()

const statusLabels = computed<Record<AdminBookingReservationStatus, string>>(() => ({
  upcoming: ext.value.status.upcoming,
  past: ext.value.status.past,
  cancelled: ext.value.status.cancelled
}))

const options = computed(() => [
  { value: "all" as const, label: ext.value.status.all, tone: "all" as const },
  ...ADMIN_RESERVATION_FILTER_STATUSES.map((status) => ({
    value: status,
    label: statusLabels.value[status],
    tone: status
  }))
])

const rootRef = ref<HTMLElement | null>(null)
const open = ref(false)

const activeOption = computed(
  () => options.value.find((option) => option.value === props.modelValue) ?? options.value[0]!
)

function toggleOpen() {
  open.value = !open.value
}

function closePanel() {
  open.value = false
}

function selectStatus(value: AdminReservationStatusFilter) {
  emit("update:modelValue", value)
  closePanel()
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) {
    return
  }

  const target = event.target

  if (!(target instanceof Node) || !rootRef.value?.contains(target)) {
    closePanel()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (open.value && event.key === "Escape") {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick)
  document.addEventListener("keydown", onDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick)
  document.removeEventListener("keydown", onDocumentKeydown)
})
</script>

<template>
  <div ref="rootRef" class="admin-reservation-status-filter">
    <button
      type="button"
      class="admin-reservation-status-filter__trigger"
      :class="{ 'admin-reservation-status-filter__trigger--open': open }"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggleOpen"
    >
      <span
        class="admin-reservations-status-pill admin-reservation-status-filter__pill"
        :class="`admin-reservations-status-pill--${activeOption.tone}`"
      >
        {{ activeOption.label }}
      </span>
      <ChevronDown class="admin-reservation-status-filter__chevron" :size="16" stroke-width="2" />
    </button>

    <div v-if="open" class="admin-reservation-status-filter__panel" role="listbox" @click.stop>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="option"
        class="admin-reservation-status-filter__option"
        :class="{ 'admin-reservation-status-filter__option--active': option.value === modelValue }"
        :aria-selected="option.value === modelValue"
        @click="selectStatus(option.value)"
      >
        <span
          class="admin-reservations-status-pill"
          :class="`admin-reservations-status-pill--${option.tone}`"
        >
          {{ option.label }}
        </span>
        <span v-if="option.value === modelValue" class="admin-reservation-status-filter__check" aria-hidden="true">
          ✓
        </span>
      </button>
    </div>
  </div>
</template>
