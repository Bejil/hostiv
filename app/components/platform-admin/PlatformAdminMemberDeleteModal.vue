<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"

const props = defineProps<{
  open: boolean
  email: string
  fullName?: string | null
  loading?: boolean
  error?: string | null
  confirmEmail: string
}>()

const emit = defineEmits<{
  "update:confirmEmail": [value: string]
  cancel: []
  confirm: []
}>()

const { ui } = usePlatformAdminUi()

const normalizedEmail = computed(() => props.email.trim().toLowerCase())

const emailMatches = computed(
  () => props.confirmEmail.trim().toLowerCase() === normalizedEmail.value
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
            aria-labelledby="platform-admin-member-delete-title"
            aria-describedby="platform-admin-member-delete-desc"
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
                <h2 id="platform-admin-member-delete-title" class="hostiv-modal__title">
                  {{ ui.members.deleteModal.title }}
                </h2>
                <p id="platform-admin-member-delete-desc" class="hostiv-modal__subtitle">
                  {{ ui.members.deleteModal.subtitle }}
                </p>
              </div>
            </header>

            <ul class="hostiv-modal__danger-list">
              <li v-for="(item, index) in ui.members.deleteModal.items" :key="index">{{ item }}</li>
            </ul>

            <div class="hostiv-modal__danger-confirm">
              <p class="hostiv-modal__danger-confirm-label">
                {{ ui.members.deleteModal.confirmLabel }}
              </p>
              <code class="hostiv-modal__danger-slug">{{ email }}</code>
              <label class="hostiv-modal__field">
                <span>{{ ui.members.deleteModal.confirmation }}</span>
                <input
                  :value="confirmEmail"
                  type="text"
                  :placeholder="email"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  :disabled="loading"
                  @input="emit('update:confirmEmail', ($event.target as HTMLInputElement).value)"
                  @keydown.enter.prevent="emailMatches && !loading && emit('confirm')"
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
                {{ ui.common.cancel }}
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--accent"
                :disabled="loading || !emailMatches"
                @click="emit('confirm')"
              >
                {{ loading ? ui.members.deleteModal.deleting : ui.members.deleteModal.confirmCta }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
