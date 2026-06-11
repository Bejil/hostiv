<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue"
import { adminUiFormat } from "../../data/admin-ui"
import AmenityIcon from "../AmenityIcon.vue"
import AdminIcon from "./AdminIcon.vue"
import { AMENITY_ICON_OPTIONS } from "../../data/amenity-icons"

const props = withDefaults(
  defineProps<{
    modelValue: string
    inline?: boolean
  }>(),
  {
    inline: false
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const { ui } = useAdminUi()

const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const filter = ref("")

const POPOVER_WIDTH_PX = 256
const POPOVER_ESTIMATED_HEIGHT_PX = 280
const POPOVER_GAP_PX = 6

const popoverPosition = ref({
  position: "fixed",
  top: "0px",
  left: "0px",
  width: `${POPOVER_WIDTH_PX}px`,
  zIndex: "9999"
})

const filteredOptions = computed(() => {
  const query = filter.value.trim().toLowerCase()

  if (!query) {
    return AMENITY_ICON_OPTIONS
  }

  return AMENITY_ICON_OPTIONS.filter(
    (option) =>
      option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)
  )
})

const activeLabel = computed(
  () =>
    AMENITY_ICON_OPTIONS.find((option) => option.value === props.modelValue)?.label ??
    ui.value.common.iconFallback
)

const changeIconLabel = computed(() =>
  adminUiFormat(ui.value.common.changeIcon, { label: activeLabel.value })
)

const iconsAvailableLabel = computed(() =>
  adminUiFormat(ui.value.common.iconsAvailable, { label: activeLabel.value })
)

function updatePopoverPosition() {
  if (!import.meta.client || !props.inline || !triggerRef.value) {
    return
  }

  const rect = triggerRef.value.getBoundingClientRect()
  const margin = 8
  const width = Math.min(POPOVER_WIDTH_PX, window.innerWidth - margin * 2)

  let left = rect.left
  let top = rect.bottom + POPOVER_GAP_PX

  if (left + width > window.innerWidth - margin) {
    left = window.innerWidth - width - margin
  }

  left = Math.max(margin, left)

  if (top + POPOVER_ESTIMATED_HEIGHT_PX > window.innerHeight - margin) {
    top = rect.top - POPOVER_ESTIMATED_HEIGHT_PX - POPOVER_GAP_PX
  }

  top = Math.max(margin, top)

  popoverPosition.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: "9999"
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value

  if (!isOpen.value) {
    filter.value = ""
  }
}

function closePanel() {
  isOpen.value = false
  filter.value = ""
}

function selectIcon(icon: string) {
  emit("update:modelValue", icon)
  closePanel()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isOpen.value) {
    return
  }

  const target = event.target as Node

  if (rootRef.value?.contains(target) || popoverRef.value?.contains(target)) {
    return
  }

  closePanel()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isOpen.value) {
    closePanel()
  }
}

function bindDocumentListeners() {
  if (!import.meta.client) {
    return
  }

  document.addEventListener("pointerdown", onDocumentPointerDown)
  document.addEventListener("keydown", onDocumentKeydown)
  window.addEventListener("scroll", updatePopoverPosition, true)
  window.addEventListener("resize", updatePopoverPosition)
}

function unbindDocumentListeners() {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener("pointerdown", onDocumentPointerDown)
  document.removeEventListener("keydown", onDocumentKeydown)
  window.removeEventListener("scroll", updatePopoverPosition, true)
  window.removeEventListener("resize", updatePopoverPosition)
}

watch(isOpen, async (open) => {
  if (!import.meta.client) {
    return
  }

  if (!open) {
    unbindDocumentListeners()
    return
  }

  if (props.inline) {
    await nextTick()
    updatePopoverPosition()
  }

  bindDocumentListeners()
})

onUnmounted(() => {
  unbindDocumentListeners()
})
</script>

<template>
  <div
    ref="rootRef"
    class="admin-amenity-icon-picker"
    :class="{ 'admin-amenity-icon-picker--inline': inline }"
  >
    <button
      v-if="inline"
      ref="triggerRef"
      type="button"
      class="admin-amenity-icon-picker__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-label="changeIconLabel"
      :title="activeLabel"
      @click="togglePanel"
    >
      <AmenityIcon :name="modelValue" />
    </button>

    <template v-else>
      <div class="admin-amenity-icon-picker__canvas">
        <div class="admin-amenity-icon-picker__scrim admin-amenity-icon-picker__scrim--top" aria-hidden="true" />
        <div class="admin-amenity-icon-picker__scrim admin-amenity-icon-picker__scrim--bottom" aria-hidden="true" />
        <p class="admin-amenity-icon-picker__label">{{ ui.common.icon }}</p>

        <div class="admin-amenity-icon-picker__center">
          <div class="admin-amenity-icon-picker__preview" aria-hidden="true">
            <AmenityIcon :name="modelValue" />
          </div>
          <p class="admin-amenity-icon-picker__active-name">{{ activeLabel }}</p>
        </div>

        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm admin-amenity-icon-picker__choose"
          :aria-expanded="isOpen"
          aria-haspopup="listbox"
          @click="togglePanel"
        >
          <AdminIcon name="layout" :size="16" />
          {{ isOpen ? ui.common.close : ui.common.choose }}
        </button>
      </div>
    </template>

    <Teleport to="body" :disabled="!inline">
      <div
        v-if="inline && isOpen"
        ref="popoverRef"
        class="admin-amenity-icon-picker__popover admin-amenity-icon-picker__popover--floating"
        :style="popoverPosition"
        role="dialog"
        :aria-label="ui.common.chooseIcon"
      >
        <label class="admin-amenity-icon-picker__filter">
          <span class="visually-hidden">{{ ui.common.searchIcon }}</span>
          <input
            v-model="filter"
            type="search"
            class="admin-amenity-icon-picker__filter-input"
            :placeholder="ui.common.search"
            autocomplete="off"
          />
        </label>

        <p v-if="!filteredOptions.length" class="admin-amenity-icon-picker__empty">
          {{ ui.common.noIconResults }}
        </p>

        <div
          v-else
          class="admin-amenity-icon-picker__grid admin-amenity-icon-picker__grid--compact"
          role="listbox"
          :aria-label="iconsAvailableLabel"
        >
          <button
            v-for="option in filteredOptions"
            :key="option.value"
            type="button"
            role="option"
            class="admin-amenity-icon-picker__tile"
            :class="{ 'admin-amenity-icon-picker__tile--active': option.value === modelValue }"
            :aria-selected="option.value === modelValue"
            :title="option.label"
            @click="selectIcon(option.value)"
          >
            <span class="admin-amenity-icon-picker__tile-icon" aria-hidden="true">
              <AmenityIcon :name="option.value" />
            </span>
          </button>
        </div>
      </div>
    </Teleport>

    <div
      v-if="!inline && isOpen"
      class="admin-amenity-icon-picker__popover"
      role="dialog"
      :aria-label="ui.common.chooseIcon"
    >
      <label class="admin-amenity-icon-picker__filter">
        <span class="visually-hidden">{{ ui.common.searchIcon }}</span>
        <input
          v-model="filter"
          type="search"
          class="admin-amenity-icon-picker__filter-input"
          :placeholder="ui.common.search"
          autocomplete="off"
        />
      </label>

      <p v-if="!filteredOptions.length" class="admin-amenity-icon-picker__empty">
        {{ ui.common.noIconResults }}
      </p>

      <div
        v-else
        class="admin-amenity-icon-picker__grid"
        role="listbox"
        :aria-label="iconsAvailableLabel"
      >
        <button
          v-for="option in filteredOptions"
          :key="option.value"
          type="button"
          role="option"
          class="admin-amenity-icon-picker__tile"
          :class="{ 'admin-amenity-icon-picker__tile--active': option.value === modelValue }"
          :aria-selected="option.value === modelValue"
          :title="option.label"
          @click="selectIcon(option.value)"
        >
          <span class="admin-amenity-icon-picker__tile-icon" aria-hidden="true">
            <AmenityIcon :name="option.value" />
          </span>
          <span class="admin-amenity-icon-picker__tile-label">{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
