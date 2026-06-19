<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"
import type { HostivPromoCode } from "../../types/hostiv-promo-code"

const props = defineProps<{
  open: boolean
  promoCode: HostivPromoCode | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const { ui } = usePlatformAdminUi()

function onBackdropClick(event: MouseEvent) {
  if (props.loading) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("cancel")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open || props.loading) {
    return
  }

  if (event.key === "Escape") {
    emit("cancel")
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open && promoCode"
        class="hostiv-modal hostiv-modal--delete hostiv-modal--promo-delete"
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
            aria-labelledby="platform-admin-promo-delete-title"
            aria-describedby="platform-admin-promo-delete-desc"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :disabled="loading"
              :aria-label="ui.common.close"
              @click="emit('cancel')"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head hostiv-modal__head--delete">
              <span class="hostiv-modal__danger-icon" aria-hidden="true">
                <AlertTriangle :size="26" stroke-width="1.75" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="platform-admin-promo-delete-title" class="hostiv-modal__title">
                  {{ ui.promoCodes.deleteModal.title }}
                </h2>
                <p id="platform-admin-promo-delete-desc" class="hostiv-modal__subtitle">
                  {{ ui.promoCodes.deleteModal.body }}
                  <strong>{{ promoCode.code }}</strong>
                </p>
              </div>
            </header>

            <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

            <footer class="hostiv-modal__danger-footer">
              <button
                type="button"
                class="hostiv-btn hostiv-btn--secondary"
                :disabled="loading"
                @click="emit('cancel')"
              >
                {{ ui.common.cancel }}
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--accent"
                :disabled="loading"
                @click="emit('confirm')"
              >
                {{ loading ? ui.promoCodes.deleteModal.deleting : ui.promoCodes.deleteModal.confirm }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
