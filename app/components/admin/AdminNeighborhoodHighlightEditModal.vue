<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminLocationHighlightIconPicker from "./AdminLocationHighlightIconPicker.vue"
import {
  DEFAULT_LOCATION_HIGHLIGHT_ICON,
  normalizeLocationHighlightIconId
} from "../../data/location-highlight-icons"
import type { LocationHighlightIconId } from "../../data/location-highlight-icons"
import type { PropertyNeighborhoodHighlight } from "../../types/property-site"
import { getAdminCustomizationCardExamples } from "../../data/admin-customization-field-examples"

const props = defineProps<{
  open: boolean
  item: PropertyNeighborhoodHighlight
  isNew?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [value: PropertyNeighborhoodHighlight]
}>()

const { ui, locale } = useAdminUi()

const cardExamples = computed(() => getAdminCustomizationCardExamples(locale.value))

const draft = ref<PropertyNeighborhoodHighlight>({ ...props.item })

const canSave = computed(() => Boolean(draft.value.title.trim()))

const modalTitle = computed(() =>
  props.isNew
    ? ui.value.editors.neighborhoodHighlights.modal.addTitle
    : ui.value.editors.neighborhoodHighlights.modal.editTitle
)

watch(
  () => [props.open, props.item] as const,
  ([isOpen, item]) => {
    if (isOpen) {
      draft.value = { ...item }
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

function patchDraft(partial: Partial<PropertyNeighborhoodHighlight>) {
  draft.value = { ...draft.value, ...partial }
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", {
    icon: normalizeLocationHighlightIconId(draft.value.icon) || DEFAULT_LOCATION_HIGHLIGHT_ICON,
    title: draft.value.title.trim(),
    text: draft.value.text
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--neighborhood-highlight"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--neighborhood-highlight"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-neighborhood-highlight-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-neighborhood-highlight-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.title.trim() || ui.editors.shared.untitled }}
                </p>
              </div>
            </header>

            <div class="admin-neighborhood-highlight-modal__fields">
              <AdminLocationHighlightIconPicker
                :model-value="draft.icon"
                @update:model-value="patchDraft({ icon: $event as LocationHighlightIconId })"
              />
              <AdminField
                :label="ui.editors.shared.title"
                required
                full-width
                :examples="[...cardExamples.highlightTitle]"
                :model-value="draft.title"
                @update:model-value="patchDraft({ title: $event as string })"
              />
              <AdminField
                :label="ui.editors.shared.description"
                type="textarea"
                :rows="4"
                full-width
                :examples="[...cardExamples.highlightText]"
                :model-value="draft.text"
                @update:model-value="patchDraft({ text: $event as string })"
              />
            </div>

            <p v-if="!canSave" class="admin-neighborhood-highlight-modal__hint">
              {{ ui.editors.neighborhoodHighlights.modal.saveHint }}
            </p>

            <footer class="admin-neighborhood-highlight-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                {{ ui.common.cancel }}
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="!canSave"
                @click="save"
              >
                {{ ui.common.save }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
