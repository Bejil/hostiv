<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminAmenityIconPicker from "./AdminAmenityIconPicker.vue"
import AdminField from "./AdminField.vue"
import { DEFAULT_AMENITY_ICON } from "../../data/amenity-icons"
import type { AmenityItem } from "../../types/amenity"
import { getAdminCustomizationAmenityExamples } from "../../data/admin-customization-field-examples"

const props = withDefaults(
  defineProps<{
    open: boolean
    item: AmenityItem
    isNew?: boolean
    lockScroll?: boolean
  }>(),
  {
    lockScroll: true
  }
)

const emit = defineEmits<{
  close: []
  save: [value: AmenityItem]
}>()

const { ui, locale } = useAdminUi()

const amenityExamples = computed(() => getAdminCustomizationAmenityExamples(locale.value))

const draft = ref<AmenityItem>({ ...props.item })

const canSave = computed(() => Boolean(draft.value.name.trim()))

const modalTitle = computed(() =>
  props.isNew
    ? ui.value.editors.amenities.modal.itemAddTitle
    : ui.value.editors.amenities.modal.itemEditTitle
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
    if (!import.meta.client || !props.lockScroll) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client && props.lockScroll) {
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

function patchDraft(partial: Partial<AmenityItem>) {
  draft.value = { ...draft.value, ...partial }
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", {
    ...draft.value,
    icon: draft.value.icon || DEFAULT_AMENITY_ICON,
    name: draft.value.name.trim()
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--amenity-item"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--amenity-item"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-amenity-item-edit-title"
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
                <h2 id="admin-amenity-item-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.name.trim() || ui.editors.shared.noName }}
                </p>
              </div>
            </header>

            <div class="admin-amenity-item-modal__fields">
              <AdminAmenityIconPicker
                :model-value="draft.icon"
                @update:model-value="patchDraft({ icon: $event as string })"
              />
              <AdminField
                :label="ui.editors.shared.name"
                required
                full-width
                :examples="[...amenityExamples.itemName]"
                :model-value="draft.name"
                @update:model-value="patchDraft({ name: $event as string })"
              />
            </div>

            <p v-if="!canSave" class="admin-amenity-item-modal__hint">
              {{ ui.editors.amenities.modal.itemSaveHint }}
            </p>

            <footer class="admin-amenity-item-modal__footer">
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
