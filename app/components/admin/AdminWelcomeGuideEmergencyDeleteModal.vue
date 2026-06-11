<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"

const props = defineProps<{ open: boolean; contactTitle: string }>()
const emit = defineEmits<{ cancel: []; confirm: [] }>()
const { ui } = useAdminUi()

watch(() => props.open, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? "hidden" : ""
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = "" })
function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") emit("cancel")
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) emit("cancel")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div v-if="open" class="hostiv-modal hostiv-modal--delete" data-backdrop="true" role="presentation" @click="onBackdropClick" @keydown="onKeydown">
        <Transition name="hostiv-modal-panel" appear>
          <div class="hostiv-modal__panel hostiv-modal__panel--delete hostiv-modal__panel--house-rule-delete" role="alertdialog" aria-modal="true" aria-labelledby="admin-welcome-guide-emergency-delete-title" aria-describedby="admin-welcome-guide-emergency-delete-desc" @click.stop>
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />
            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('cancel')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>
            <header class="hostiv-modal__head hostiv-modal__head--delete">
              <span class="hostiv-modal__danger-icon" aria-hidden="true"><AlertTriangle :size="26" stroke-width="1.75" /></span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-welcome-guide-emergency-delete-title" class="hostiv-modal__title">{{ ui.welcomeGuide.emergency.deleteTitle }}</h2>
                <p id="admin-welcome-guide-emergency-delete-desc" class="hostiv-modal__subtitle">
                  <strong>{{ contactTitle }}</strong>{{ ui.welcomeGuide.emergency.deleteSuffix }}
                </p>
              </div>
            </header>
            <footer class="hostiv-modal__danger-footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('cancel')">{{ ui.common.cancel }}</button>
              <button type="button" class="hostiv-btn hostiv-btn--accent" @click="emit('confirm')">{{ ui.common.delete }}</button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
