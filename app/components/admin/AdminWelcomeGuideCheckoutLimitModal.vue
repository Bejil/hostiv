<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import { WELCOME_GUIDE_MAX_CHECKOUT_COUNT } from "../../utils/welcome-guide-content"

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { ui } = useAdminUi()

const limitDesc = computed(() =>
  adminUiFormat(ui.value.welcomeGuide.checkout.limitDesc, { max: WELCOME_GUIDE_MAX_CHECKOUT_COUNT })
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
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--delete"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--delete"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-welcome-guide-checkout-limit-title"
            aria-describedby="admin-welcome-guide-checkout-limit-desc"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head hostiv-modal__head--delete">
              <span class="hostiv-modal__danger-icon" aria-hidden="true">
                <AlertTriangle :size="26" stroke-width="1.75" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-welcome-guide-checkout-limit-title" class="hostiv-modal__title">
                  {{ ui.welcomeGuide.checkout.limitTitle }}
                </h2>
                <p id="admin-welcome-guide-checkout-limit-desc" class="hostiv-modal__subtitle">
                  {{ limitDesc }}
                </p>
              </div>
            </header>

            <footer class="hostiv-modal__danger-footer">
              <button type="button" class="hostiv-btn hostiv-btn--primary" @click="emit('close')">
                {{ ui.common.understood }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
