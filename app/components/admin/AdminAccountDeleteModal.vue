<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"

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
</script>

<template>
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
          aria-labelledby="admin-account-delete-modal-title"
          aria-describedby="admin-account-delete-modal-desc"
          @click.stop
        >
          <span class="hostiv-modal__accent" aria-hidden="true" />
          <span class="hostiv-modal__glow" aria-hidden="true" />

          <button
            type="button"
            class="hostiv-modal__close"
            :disabled="loading"
            aria-label="Fermer"
            @click="emit('cancel')"
          >
            <span class="sr-only">Fermer</span>
            <X :size="18" stroke-width="2" />
          </button>

          <header class="hostiv-modal__head hostiv-modal__head--delete">
            <span class="hostiv-modal__danger-icon" aria-hidden="true">
              <AlertTriangle :size="26" stroke-width="1.75" />
            </span>
            <div class="hostiv-modal__head-text">
              <h2 id="admin-account-delete-modal-title" class="hostiv-modal__title">
                Supprimer définitivement votre compte ?
              </h2>
              <p id="admin-account-delete-modal-desc" class="hostiv-modal__subtitle">
                Cette action est irréversible. Les éléments suivants seront supprimés :
              </p>
            </div>
          </header>

          <ul class="hostiv-modal__danger-list">
            <li>Votre compte Hostiv et votre accès au backoffice</li>
            <li>
              Votre site <strong>/{{ slug }}</strong> et tous ses contenus
            </li>
            <li>Les fichiers et images associés</li>
            <li>Votre compte Stripe Connect</li>
            <li>L’historique des réservations enregistrées sur ce site</li>
          </ul>

          <div class="hostiv-modal__danger-confirm">
            <p class="hostiv-modal__danger-confirm-label">
              Pour confirmer, saisissez l’adresse de votre site :
            </p>
            <code class="hostiv-modal__danger-slug">{{ slug }}</code>
            <label class="hostiv-modal__field">
              <span>Confirmation</span>
              <input
                :value="confirmSlug"
                type="text"
                :placeholder="slug"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                :disabled="loading"
                @input="emit('update:confirmSlug', ($event.target as HTMLInputElement).value)"
                @keydown.enter.prevent="slugMatches && !loading && emit('confirm')"
                @paste.prevent
                @copy.prevent
                @cut.prevent
              />
            </label>
          </div>

          <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

          <footer class="hostiv-modal__danger-footer">
            <button
              type="button"
              class="hostiv-btn hostiv-btn--secondary"
              :disabled="loading"
              @click="emit('cancel')"
            >
              Annuler
            </button>
            <button
              type="button"
              class="hostiv-btn hostiv-btn--accent"
              :disabled="loading || !slugMatches"
              @click="emit('confirm')"
            >
              {{ loading ? "Suppression…" : "Supprimer mon compte" }}
            </button>
          </footer>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
