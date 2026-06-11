<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { getAdminWelcomeGuideFieldExamples } from "../../data/admin-welcome-guide-field-examples"
import type { WelcomeGuideEmergencyContact } from "../../types/welcome-guide"

const props = defineProps<{ open: boolean; contact: WelcomeGuideEmergencyContact; isNew?: boolean }>()
const emit = defineEmits<{ close: []; save: [value: WelcomeGuideEmergencyContact] }>()
const { ui } = useAdminUi()
const { siteEditLocale } = useAdminEditorContext()

const fieldExamples = computed(() => getAdminWelcomeGuideFieldExamples(siteEditLocale.value))

const draft = ref<WelcomeGuideEmergencyContact>({ ...props.contact })
const canSave = computed(() =>
  Boolean(draft.value.title.trim() && draft.value.description.trim() && draft.value.text.trim())
)
const modalTitle = computed(() =>
  props.isNew ? ui.value.welcomeGuide.emergency.addTitle : ui.value.welcomeGuide.emergency.editTitle
)

watch(
  () => [props.open, props.contact] as const,
  ([isOpen, contact]) => {
    if (isOpen) {
      draft.value = {
        title: contact.title ?? "",
        description: contact.description ?? "",
        text: contact.text ?? "",
        note: contact.note ?? ""
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
function patchDraft(partial: Partial<WelcomeGuideEmergencyContact>) {
  draft.value = { ...draft.value, ...partial }
}
function save() {
  if (!canSave.value) return
  emit("save", {
    title: draft.value.title.trim(),
    description: draft.value.description.trim(),
    text: draft.value.text.trim(),
    note: draft.value.note.trim()
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div v-if="open" class="hostiv-modal hostiv-modal--benefit-card" data-backdrop="true" role="presentation" @click="onBackdropClick" @keydown="onKeydown">
        <Transition name="hostiv-modal-panel" appear>
          <div class="hostiv-modal__panel hostiv-modal__panel--benefit-card" role="dialog" aria-modal="true" aria-labelledby="admin-welcome-guide-emergency-edit-title" @click.stop>
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />
            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>
            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-welcome-guide-emergency-edit-title" class="hostiv-modal__title">{{ modalTitle }}</h2>
                <p class="hostiv-modal__subtitle">{{ draft.title.trim() || ui.common.noLabel }}</p>
              </div>
            </header>
            <div class="admin-benefit-card-modal__fields">
              <AdminField :label="ui.common.label" required full-width :examples="[...fieldExamples.emergencyTitle]" :model-value="draft.title" @update:model-value="patchDraft({ title: $event as string })" />
              <AdminField :label="ui.welcomeGuide.emergency.whenToCallLabel" required type="textarea" :rows="3" full-width :examples="[...fieldExamples.emergencyDescription]" :hint="ui.welcomeGuide.emergency.whenToCallHint" :model-value="draft.description" @update:model-value="patchDraft({ description: $event as string })" />
              <AdminField :label="ui.welcomeGuide.emergency.numberLabel" required full-width :examples="[...fieldExamples.emergencyText]" :model-value="draft.text" @update:model-value="patchDraft({ text: $event as string })" />
              <AdminField :label="ui.welcomeGuide.emergency.noteLabel" full-width :examples="[...fieldExamples.emergencyNote]" :hint="ui.welcomeGuide.emergency.noteHint" :model-value="draft.note" @update:model-value="patchDraft({ note: $event as string })" />
            </div>
            <p v-if="!canSave" class="admin-benefit-card-modal__hint">{{ ui.welcomeGuide.emergency.requiredHint }}</p>
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
