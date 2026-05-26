<script setup lang="ts">
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
    confirmLabel: "Confirmer",
    cancelLabel: "Annuler",
    variant: "primary",
    loading: false
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

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
    <div
      v-if="open"
      class="admin-confirm-dialog"
      data-backdrop="true"
      @click="onBackdropClick"
      @keydown="onKeydown"
    >
      <div
        class="admin-confirm-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-dialog-title"
        @click.stop
      >
        <h3 id="admin-confirm-dialog-title" class="admin-confirm-dialog__title">{{ title }}</h3>
        <p class="admin-confirm-dialog__message">{{ message }}</p>

        <footer class="admin-confirm-dialog__footer">
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="admin-btn admin-btn--sm"
            :class="variant === 'danger' ? 'admin-btn--danger' : 'admin-btn--primary'"
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ loading ? "En cours…" : confirmLabel }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
