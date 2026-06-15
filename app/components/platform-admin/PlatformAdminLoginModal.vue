<script setup lang="ts">
import { Loader2 } from "@lucide/vue"

const props = defineProps<{
  open: boolean
  checking: boolean
  submitting: boolean
  error: string | null
}>()

const email = defineModel<string>("email", { required: true })
const password = defineModel<string>("password", { required: true })

const emit = defineEmits<{
  submit: []
}>()

const { ui } = usePlatformAdminUi()

const modalTitle = computed(() =>
  props.checking ? ui.value.login.checking : ui.value.login.title
)
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--login"
        data-backdrop="true"
        role="presentation"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--login"
            role="dialog"
            aria-modal="true"
            aria-labelledby="platform-admin-login-title"
            :aria-busy="checking || submitting"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img
                  src="/hostiv/logo-mark.svg"
                  alt=""
                  width="40"
                  height="40"
                  class="hostiv-modal__logo-img"
                />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="platform-admin-login-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">{{ ui.login.subtitle }}</p>
              </div>
            </header>

            <form class="hostiv-modal__body" @submit.prevent="emit('submit')">
              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <label class="hostiv-modal__field">
                <span class="hostiv-modal__label">{{ ui.login.email }}</span>
                <input
                  v-model="email"
                  type="email"
                  autocomplete="username"
                  required
                  :disabled="checking || submitting"
                  class="hostiv-modal__input"
                />
              </label>

              <label class="hostiv-modal__field">
                <span class="hostiv-modal__label">{{ ui.login.password }}</span>
                <input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  :disabled="checking || submitting"
                  class="hostiv-modal__input"
                />
              </label>

              <button
                type="submit"
                class="hostiv-modal__submit"
                :disabled="checking || submitting"
              >
                <Loader2 v-if="submitting" class="hostiv-modal__submit-icon" aria-hidden="true" />
                {{ ui.login.submit }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
