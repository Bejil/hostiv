<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import {
  DEFAULT_SITE_TEMPLATE_ID,
  siteTemplateOptions,
  type SiteTemplateId
} from "../../data/site-templates"

const props = defineProps<{
  modelValue: SiteTemplateId | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: SiteTemplateId]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

const selectedOption = computed(() => {
  const match = siteTemplateOptions.find((option) => option.id === props.modelValue)

  if (match) {
    return match
  }

  return (
    siteTemplateOptions.find((option) => option.id === DEFAULT_SITE_TEMPLATE_ID) ??
    siteTemplateOptions[0]
  )
})

function updatePanelPosition() {
  const trigger = triggerRef.value

  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const maxHeight = Math.min(320, Math.max(120, window.innerHeight - rect.bottom - 16))

  panelStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${maxHeight}px`
  }
}

function toggleOpen() {
  open.value = !open.value

  if (open.value) {
    nextTick(updatePanelPosition)
  }
}

function selectTemplate(id: SiteTemplateId) {
  emit("update:modelValue", id)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) {
    return
  }

  const target = event.target

  if (!(target instanceof Node) || !rootRef.value?.contains(target)) {
    open.value = false
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (open.value && event.key === "Escape") {
    open.value = false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  nextTick(updatePanelPosition)
})

onMounted(() => {
  document.addEventListener("click", onDocumentClick)
  document.addEventListener("keydown", onDocumentKeydown)
  window.addEventListener("resize", updatePanelPosition)
  window.addEventListener("scroll", updatePanelPosition, true)
})

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick)
  document.removeEventListener("keydown", onDocumentKeydown)
  window.removeEventListener("resize", updatePanelPosition)
  window.removeEventListener("scroll", updatePanelPosition, true)
})
</script>

<template>
  <div
    ref="rootRef"
    class="admin-template-select"
    :class="{ 'admin-template-select--open': open }"
  >
    <button
      ref="triggerRef"
      type="button"
      class="admin-template-item__button admin-template-select__trigger"
      :class="[`admin-template-item--${selectedOption.id}`]"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="`Thème du site : ${selectedOption.name}`"
      @click.stop="toggleOpen"
    >
      <span class="admin-template-item__swatch" aria-hidden="true" />
      <span class="admin-template-item__copy">
        <span class="admin-template-item__meta">
          <strong>{{ selectedOption.name }}</strong>
          <span class="admin-template-item__eyebrow">{{ selectedOption.eyebrow }}</span>
        </span>
        <span class="admin-template-item__description admin-template-select__trigger-desc">
          {{ selectedOption.description }}
        </span>
      </span>
      <ChevronDown class="admin-template-select__chevron" :size="18" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <ul
        v-show="open"
        class="admin-template-editor admin-template-select__panel"
        :style="panelStyle"
        role="listbox"
        aria-label="Choisir un thème"
      >
        <li
          v-for="option in siteTemplateOptions"
          :key="option.id"
          class="admin-template-item"
          :class="{
            'admin-template-item--active': modelValue === option.id,
            [`admin-template-item--${option.id}`]: true
          }"
          role="option"
          :aria-selected="modelValue === option.id"
        >
          <button
            type="button"
            class="admin-template-item__button"
            @click="selectTemplate(option.id)"
          >
            <span class="admin-template-item__swatch" aria-hidden="true" />
            <span class="admin-template-item__copy">
              <span class="admin-template-item__meta">
                <strong>{{ option.name }}</strong>
                <span class="admin-template-item__eyebrow">{{ option.eyebrow }}</span>
              </span>
              <span class="admin-template-item__description">{{ option.description }}</span>
            </span>
            <span class="admin-template-item__status">
              {{ modelValue === option.id ? "Actif" : "Choisir" }}
            </span>
          </button>
        </li>
      </ul>
    </Teleport>
  </div>
</template>
