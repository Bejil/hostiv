<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"
import AdminField from "./AdminField.vue"

const props = defineProps<{
  open: boolean
  slug: string
  loading?: boolean
  error?: string | null
  confirmSlug: string
}>()

const emit = defineEmits<{
  "update:confirmSlug": [value: string]
  cancel: []
  confirm: []
}>()

const normalizedSlug = computed(() => props.slug.trim().toLowerCase())

const slugMatches = computed(
  () => props.confirmSlug.trim().toLowerCase() === normalizedSlug.value
)

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

watch(
  () => props.open,
  (open) => {
    if (import.meta.client && open) {
      document.body.style.overflow = "hidden"
      return
    }

    if (import.meta.client) {
      document.body.style.overflow = ""
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-login-modal-fade">
      <div
        v-if="open"
        class="admin-account-delete-modal"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div
          class="admin-account-delete-modal__panel"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-account-delete-modal-title"
          aria-describedby="admin-account-delete-modal-desc"
          @click.stop
        >
          <button
            type="button"
            class="admin-account-delete-modal__close"
            :disabled="loading"
            aria-label="Fermer"
            @click="emit('cancel')"
          >
            <X :size="18" />
          </button>

          <div class="admin-account-delete-modal__icon" aria-hidden="true">
            <AlertTriangle :size="28" stroke-width="1.75" />
          </div>

          <h3 id="admin-account-delete-modal-title" class="admin-account-delete-modal__title">
            Supprimer définitivement votre compte ?
          </h3>

          <p id="admin-account-delete-modal-desc" class="admin-account-delete-modal__lead">
            Cette action est irréversible. Les éléments suivants seront supprimés :
          </p>

          <ul class="admin-account-delete-modal__list">
            <li>Votre compte Hostiv et votre accès au backoffice</li>
            <li>Votre site <strong>/{{ slug }}</strong> et tous ses contenus</li>
            <li>Les fichiers et images associés</li>
            <li>Votre compte Stripe Connect</li>
            <li>L’historique des réservations enregistrées sur ce site</li>
          </ul>

          <div class="admin-account-delete-modal__confirm">
            <p class="admin-account-delete-modal__confirm-label">
              Pour confirmer, saisissez l’adresse de votre site :
            </p>
            <code class="admin-account-delete-modal__slug">{{ slug }}</code>
            <AdminField
              :model-value="confirmSlug"
              label="Confirmation"
              :placeholder="slug"
              full-width
              prevent-clipboard
              :disabled="loading"
              @update:model-value="emit('update:confirmSlug', String($event))"
              @keydown.enter.prevent="slugMatches && !loading && emit('confirm')"
            />
          </div>

          <p v-if="error" class="admin-account-delete-modal__error" role="alert">{{ error }}</p>

          <footer class="admin-account-delete-modal__footer">
            <button
              type="button"
              class="admin-btn admin-btn--secondary"
              :disabled="loading"
              @click="emit('cancel')"
            >
              Annuler
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--danger"
              :disabled="loading || !slugMatches"
              @click="emit('confirm')"
            >
              {{ loading ? "Suppression…" : "Supprimer mon compte" }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
