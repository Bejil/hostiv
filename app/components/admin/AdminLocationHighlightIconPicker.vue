<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import LocationHighlightIcon from "../LocationHighlightIcon.vue"
import AdminIcon from "./AdminIcon.vue"
import {
  LOCATION_HIGHLIGHT_ICON_OPTIONS,
  locationHighlightIconLabel,
  type LocationHighlightIconId
} from "../../data/location-highlight-icons"

const props = defineProps<{
  modelValue: LocationHighlightIconId
}>()

const emit = defineEmits<{
  "update:modelValue": [value: LocationHighlightIconId]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const activeLabel = computed(() => locationHighlightIconLabel(props.modelValue))

function togglePanel() {
  isOpen.value = !isOpen.value
}

function closePanel() {
  isOpen.value = false
}

function selectIcon(icon: LocationHighlightIconId) {
  emit("update:modelValue", icon)
  closePanel()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value || !rootRef.value) {
    return
  }

  if (rootRef.value.contains(event.target as Node)) {
    return
  }

  closePanel()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isOpen.value) {
    closePanel()
  }
}

watch(isOpen, (open) => {
  if (!import.meta.client) {
    return
  }

  if (open) {
    document.addEventListener("pointerdown", onDocumentPointerDown)
    document.addEventListener("keydown", onDocumentKeydown)
    return
  }

  document.removeEventListener("pointerdown", onDocumentPointerDown)
  document.removeEventListener("keydown", onDocumentKeydown)
})

onUnmounted(() => {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener("pointerdown", onDocumentPointerDown)
  document.removeEventListener("keydown", onDocumentKeydown)
})
</script>

<template>
  <div ref="rootRef" class="admin-benefit-icon-picker">
    <div class="admin-benefit-icon-picker__canvas">
      <div class="admin-benefit-icon-picker__scrim admin-benefit-icon-picker__scrim--top" aria-hidden="true" />
      <div class="admin-benefit-icon-picker__scrim admin-benefit-icon-picker__scrim--bottom" aria-hidden="true" />
      <p class="admin-benefit-icon-picker__label">Icône</p>

      <div class="admin-benefit-icon-picker__center">
        <div class="admin-benefit-icon-picker__preview" aria-hidden="true">
          <LocationHighlightIcon :name="modelValue" />
        </div>
        <p class="admin-benefit-icon-picker__active-name">{{ activeLabel }}</p>
      </div>

      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm admin-benefit-icon-picker__choose"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        @click="togglePanel"
      >
        <AdminIcon name="layout" :size="16" />
        {{ isOpen ? "Fermer" : "Choisir" }}
      </button>
    </div>

    <div
      v-if="isOpen"
      class="admin-benefit-icon-picker__popover"
      role="dialog"
      aria-label="Choisir une icône"
    >
      <div
        class="admin-benefit-icon-picker__grid admin-benefit-icon-picker__grid--compact"
        role="listbox"
        :aria-label="`Icônes disponibles — ${activeLabel}`"
      >
        <button
          v-for="option in LOCATION_HIGHLIGHT_ICON_OPTIONS"
          :key="option.value"
          type="button"
          role="option"
          class="admin-benefit-icon-picker__tile"
          :class="{ 'admin-benefit-icon-picker__tile--active': option.value === modelValue }"
          :aria-selected="option.value === modelValue"
          :title="option.label"
          @click="selectIcon(option.value)"
        >
          <span class="admin-benefit-icon-picker__tile-icon" aria-hidden="true">
            <LocationHighlightIcon :name="option.value" />
          </span>
          <span class="admin-benefit-icon-picker__tile-label">{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
