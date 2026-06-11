<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "primary" | "danger"
    loading?: boolean
  }>(),
  {
    variant: "primary",
    loading: false
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { ui } = useAdminUi()

const resolvedConfirmLabel = computed(() => props.confirmLabel ?? ui.value.common.confirm)
const resolvedCancelLabel = computed(() => props.cancelLabel ?? ui.value.common.cancel)

const isDanger = computed(() => props.variant === "danger")

const titleId = "admin-confirm-dialog-title"
const descId = "admin-confirm-dialog-desc"

function onBackdropClick(event: MouseEvent) {
  if (props.loading) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("cancel")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !props.loading) {
    emit("cancel")
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--admin-confirm"
        :class="{ 'hostiv-modal--delete': isDanger }"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--admin-confirm"
            :class="{ 'hostiv-modal__panel--delete': isDanger }"
            role="alertdialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descId"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :aria-label="ui.common.close"
              :disabled="loading"
              @click="emit('cancel')"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header
              class="hostiv-modal__head"
              :class="{ 'hostiv-modal__head--delete': isDanger }"
            >
              <span v-if="isDanger" class="hostiv-modal__danger-icon" aria-hidden="true">
                <AlertTriangle :size="26" stroke-width="1.75" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 :id="titleId" class="hostiv-modal__title">{{ title }}</h2>
                <p :id="descId" class="hostiv-modal__subtitle admin-confirm-dialog__message">
                  {{ message }}
                </p>
              </div>
            </header>

            <footer
              class="hostiv-modal__danger-footer"
              :class="{ 'admin-confirm-dialog__footer--primary': !isDanger }"
            >
              <button
                type="button"
                class="hostiv-btn hostiv-btn--secondary"
                :disabled="loading"
                @click="emit('cancel')"
              >
                {{ resolvedCancelLabel }}
              </button>
              <button
                type="button"
                class="hostiv-btn"
                :class="isDanger ? 'hostiv-btn--accent' : 'hostiv-btn--primary'"
                :disabled="loading"
                @click="emit('confirm')"
              >
                {{ loading ? ui.common.inProgress : resolvedConfirmLabel }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
