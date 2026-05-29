<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import type { PropertyVisualCard } from "../../types/property-site"

const props = defineProps<{
  open: boolean
  card: PropertyVisualCard
  cardIndex: number
  isNew?: boolean
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
}>()

const emit = defineEmits<{
  close: []
  save: [value: PropertyVisualCard]
}>()

const draft = ref<PropertyVisualCard>({ ...props.card })

const canSave = computed(() => Boolean(draft.value.title.trim() && draft.value.image.trim()))

const modalTitle = computed(() => (props.isNew ? "Ajouter une carte" : "Modifier la carte"))

function defaultImagePath(current: string) {
  const trimmed = current.trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  return `gallery/espaces/carte-${props.cardIndex + 1}.jpeg`
}

watch(
  () => [props.open, props.card] as const,
  ([isOpen, card]) => {
    if (isOpen) {
      draft.value = { ...card }
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

function patchDraft(partial: Partial<PropertyVisualCard>) {
  draft.value = { ...draft.value, ...partial }
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", { ...draft.value })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--visual-card"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--visual-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-visual-card-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" aria-label="Fermer" @click="emit('close')">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-visual-card-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.title.trim() || "Sans titre" }}
                </p>
              </div>
            </header>

            <div class="admin-visual-card-modal__fields">
              <AdminImageUpload
                class="admin-visual-card-modal__image"
                cover
                required
                label="Image"
                :model-value="draft.image"
                :default-path="defaultImagePath(draft.image)"
                :upload="upload"
                :preview-url="previewUrl"
                @update:model-value="patchDraft({ image: $event as string })"
              />
              <AdminField
                label="Titre"
                required
                full-width
                :model-value="draft.title"
                @update:model-value="patchDraft({ title: $event as string })"
              />
              <AdminField
                label="Description"
                type="textarea"
                :rows="4"
                full-width
                :model-value="draft.text"
                @update:model-value="patchDraft({ text: $event as string })"
              />
            </div>

            <p v-if="!canSave" class="admin-visual-card-modal__hint">
              L’image et le titre sont obligatoires pour enregistrer.
            </p>

            <footer class="admin-visual-card-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                Annuler
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="!canSave"
                @click="save"
              >
                Enregistrer
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
