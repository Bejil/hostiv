<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { getAdminWelcomeGuideFieldExamples } from "../../data/admin-welcome-guide-field-examples"
import type { WelcomeGuidePlace } from "../../types/welcome-guide"

const props = defineProps<{
  open: boolean
  place: WelcomeGuidePlace
  placeIndex: number
  isNew?: boolean
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  previewRevision?: number
}>()

const emit = defineEmits<{ close: []; save: [value: WelcomeGuidePlace]; uploaded: [] }>()
const { ui } = useAdminUi()
const { siteEditLocale } = useAdminEditorContext()

const fieldExamples = computed(() => getAdminWelcomeGuideFieldExamples(siteEditLocale.value))

const draft = ref<WelcomeGuidePlace>({ ...props.place })
const canSave = computed(() =>
  Boolean(
    draft.value.image_path.trim() &&
      draft.value.title.trim() &&
      draft.value.description.trim() &&
      draft.value.address.trim()
  )
)
const modalTitle = computed(() =>
  props.isNew ? ui.value.welcomeGuide.places.addTitle : ui.value.welcomeGuide.places.editTitle
)

function defaultImagePath(current: string) {
  const trimmed = current.trim().replace(/^\/+/, "")
  if (trimmed) return trimmed
  return `gallery/welcome-guide-place-${props.placeIndex + 1}.jpeg`
}

watch(
  () => [props.open, props.place] as const,
  ([isOpen, place]) => {
    if (isOpen) {
      draft.value = {
        image_path: place.image_path ?? "",
        title: place.title ?? "",
        description: place.description ?? "",
        address: place.address ?? ""
      }
    }
  },
  { immediate: true, deep: true }
)
watch(() => props.open, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? "hidden" : ""
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = "" })

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") emit("close")
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) emit("close")
}
function patchDraft(partial: Partial<WelcomeGuidePlace>) {
  draft.value = { ...draft.value, ...partial }
}
function save() {
  if (!canSave.value) return
  emit("save", {
    image_path: draft.value.image_path.trim(),
    title: draft.value.title.trim(),
    description: draft.value.description.trim(),
    address: draft.value.address.trim()
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div v-if="open" class="hostiv-modal hostiv-modal--benefit-card" data-backdrop="true" role="presentation" @click="onBackdropClick" @keydown="onKeydown">
        <Transition name="hostiv-modal-panel" appear>
          <div class="hostiv-modal__panel hostiv-modal__panel--benefit-card" role="dialog" aria-modal="true" aria-labelledby="admin-welcome-guide-place-edit-title" @click.stop>
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />
            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>
            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-welcome-guide-place-edit-title" class="hostiv-modal__title">{{ modalTitle }}</h2>
                <p class="hostiv-modal__subtitle">{{ draft.title.trim() || ui.common.untitled }}</p>
              </div>
            </header>
            <div class="admin-welcome-guide-place-modal__fields">
              <AdminImageUpload class="admin-welcome-guide-place-modal__image" cover required :label="ui.common.image" :model-value="draft.image_path" :default-path="defaultImagePath(draft.image_path)" :examples="[...fieldExamples.placeImage]" :upload="upload" :preview-url="previewUrl" :preview-revision="previewRevision" @update:model-value="patchDraft({ image_path: String($event) })" @uploaded="emit('uploaded')" />
              <AdminField :label="ui.common.title" required full-width :examples="[...fieldExamples.placeTitle]" :model-value="draft.title" @update:model-value="patchDraft({ title: $event as string })" />
              <AdminField :label="ui.common.address" required full-width :examples="[...fieldExamples.placeAddress]" :model-value="draft.address" @update:model-value="patchDraft({ address: $event as string })" />
              <AdminField :label="ui.common.description" required type="textarea" :rows="4" full-width :examples="[...fieldExamples.placeDescription]" :model-value="draft.description" @update:model-value="patchDraft({ description: $event as string })" />
            </div>
            <p v-if="!canSave" class="admin-benefit-card-modal__hint">{{ ui.welcomeGuide.places.requiredHint }}</p>
            <footer class="admin-benefit-card-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">{{ ui.common.cancel }}</button>
              <button type="button" class="hostiv-btn hostiv-btn--primary" :disabled="!canSave" @click="save">{{ ui.common.save }}</button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
