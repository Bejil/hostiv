<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue"
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuideRuleIcon from "./AdminWelcomeGuideRuleIcon.vue"
import {
  WELCOME_GUIDE_RULE_ICON_OPTIONS,
  welcomeGuideRuleIconLabel
} from "../../data/welcome-guide-rule-icons"
import type { WelcomeGuideRuleIcon } from "../../types/welcome-guide"

const props = defineProps<{
  modelValue: WelcomeGuideRuleIcon
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuideRuleIcon]
}>()

const { ui } = useAdminUi()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const filter = ref("")

const filteredOptions = computed(() => {
  const query = filter.value.trim().toLowerCase()

  if (!query) {
    return WELCOME_GUIDE_RULE_ICON_OPTIONS
  }

  return WELCOME_GUIDE_RULE_ICON_OPTIONS.filter(
    (option) =>
      option.label.toLowerCase().includes(query) || option.id.toLowerCase().includes(query)
  )
})

const activeLabel = computed(() => welcomeGuideRuleIconLabel(props.modelValue))

const iconsAvailableLabel = computed(() =>
  adminUiFormat(ui.value.common.iconsAvailable, { label: activeLabel.value })
)

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

function selectIcon(icon: WelcomeGuideRuleIcon) {
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
      <p class="admin-benefit-icon-picker__label">{{ ui.common.icon }}</p>

      <div class="admin-benefit-icon-picker__center">
        <div class="admin-benefit-icon-picker__preview" aria-hidden="true">
          <AdminWelcomeGuideRuleIcon :icon="modelValue" />
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
        {{ isOpen ? ui.common.close : ui.common.choose }}
      </button>
    </div>

    <div
      v-if="isOpen"
      class="admin-benefit-icon-picker__popover"
      role="dialog"
      :aria-label="ui.common.chooseIcon"
    >
      <label class="admin-benefit-icon-picker__filter">
        <span class="visually-hidden">{{ ui.common.searchIcon }}</span>
        <input
          v-model="filter"
          type="search"
          class="admin-benefit-icon-picker__filter-input"
          :placeholder="ui.common.search"
          autocomplete="off"
        />
      </label>

      <p v-if="!filteredOptions.length" class="admin-benefit-icon-picker__empty">
        {{ ui.common.noIconResults }}
      </p>

      <div
        v-else
        class="admin-benefit-icon-picker__grid"
        role="listbox"
        :aria-label="iconsAvailableLabel"
      >
        <button
          v-for="option in filteredOptions"
          :key="option.id"
          type="button"
          role="option"
          class="admin-benefit-icon-picker__tile"
          :class="{ 'admin-benefit-icon-picker__tile--active': option.id === modelValue }"
          :aria-selected="option.id === modelValue"
          :title="option.label"
          @click="selectIcon(option.id)"
        >
          <span class="admin-benefit-icon-picker__tile-icon" aria-hidden="true">
            <AdminWelcomeGuideRuleIcon :icon="option.id" />
          </span>
          <span class="admin-benefit-icon-picker__tile-label">{{ option.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
