<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import AdminIcon from "./AdminIcon.vue"
import {
  PLATFORM_CUSTOM_ICON_OPTIONS,
  normalizePlatformCustomIconId,
  platformCustomIconLabel
} from "../../data/platform-custom-icons"
import type { AdminIconName } from "./admin-icon-types"

const props = defineProps<{
  modelValue: AdminIconName
}>()

const emit = defineEmits<{
  "update:modelValue": [value: AdminIconName]
}>()

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const panelStyle = ref<Record<string, string>>({})

const PANEL_WIDTH_PX = 288
const PANEL_GAP_PX = 6

const activeLabel = computed(() => platformCustomIconLabel(props.modelValue))

function updatePanelPosition() {
  const trigger = triggerRef.value

  if (!trigger || !import.meta.client) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const margin = 8
  const width = Math.min(PANEL_WIDTH_PX, window.innerWidth - margin * 2)
  let left = rect.left

  if (left + width > window.innerWidth - margin) {
    left = window.innerWidth - width - margin
  }

  left = Math.max(margin, left)

  const spaceBelow = window.innerHeight - rect.bottom - margin
  const spaceAbove = rect.top - margin
  const openAbove = spaceBelow < 200 && spaceAbove > spaceBelow
  const maxHeight = Math.min(320, Math.max(140, openAbove ? spaceAbove : spaceBelow))

  if (openAbove) {
    panelStyle.value = {
      position: "fixed",
      top: `${Math.max(margin, rect.top - maxHeight - PANEL_GAP_PX)}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: "2500"
    }
    return
  }

  panelStyle.value = {
    position: "fixed",
    top: `${rect.bottom + PANEL_GAP_PX}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    zIndex: "2500"
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    nextTick(updatePanelPosition)
  }
}

function closePanel() {
  isOpen.value = false
}

function selectIcon(icon: AdminIconName) {
  emit("update:modelValue", normalizePlatformCustomIconId(icon))
  closePanel()
}

function containsTarget(target: Node) {
  return Boolean(rootRef.value?.contains(target) || panelRef.value?.contains(target))
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) {
    return
  }

  if (containsTarget(event.target as Node)) {
    return
  }

  closePanel()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    return
  }

  if (event.key === "Escape") {
    event.stopPropagation()
    closePanel()
  }
}

watch(isOpen, (open) => {
  if (!import.meta.client) {
    return
  }

  if (open) {
    nextTick(updatePanelPosition)
    document.addEventListener("pointerdown", onDocumentPointerDown)
    document.addEventListener("keydown", onDocumentKeydown, true)
    window.addEventListener("resize", updatePanelPosition)
    window.addEventListener("scroll", updatePanelPosition, true)
    return
  }

  document.removeEventListener("pointerdown", onDocumentPointerDown)
  document.removeEventListener("keydown", onDocumentKeydown, true)
  window.removeEventListener("resize", updatePanelPosition)
  window.removeEventListener("scroll", updatePanelPosition, true)
})

onUnmounted(() => {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener("pointerdown", onDocumentPointerDown)
  document.removeEventListener("keydown", onDocumentKeydown, true)
  window.removeEventListener("resize", updatePanelPosition)
  window.removeEventListener("scroll", updatePanelPosition, true)
})
</script>

<template>
  <div ref="rootRef" class="admin-platform-icon-picker">
    <span class="admin-field__label">Icône</span>
    <button
      ref="triggerRef"
      type="button"
      class="admin-platform-icon-picker__trigger admin-field__control"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click.stop="togglePanel"
    >
      <span class="admin-platform-icon-picker__trigger-icon" aria-hidden="true">
        <AdminIcon :name="modelValue" :size="18" />
      </span>
      <span class="admin-platform-icon-picker__trigger-label">{{ activeLabel }}</span>
      <ChevronDown class="admin-platform-icon-picker__chevron" :size="16" stroke-width="2" />
    </button>

    <Teleport to="body">
      <div
        v-show="isOpen"
        ref="panelRef"
        class="admin-platform-icon-picker__panel"
        :style="panelStyle"
        role="listbox"
        :aria-label="`Icônes — ${activeLabel}`"
      >
        <button
          v-for="option in PLATFORM_CUSTOM_ICON_OPTIONS"
          :key="option.id"
          type="button"
          role="option"
          class="admin-platform-icon-picker__option"
          :class="{ 'admin-platform-icon-picker__option--active': option.id === modelValue }"
          :aria-selected="option.id === modelValue"
          :title="option.label"
          @click="selectIcon(option.id)"
        >
          <span class="admin-platform-icon-picker__option-icon" aria-hidden="true">
            <AdminIcon :name="option.id" :size="18" />
          </span>
          <span class="admin-platform-icon-picker__option-label">{{ option.label }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>
