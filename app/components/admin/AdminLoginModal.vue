<script setup lang="ts">
import { Loader2 } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"

const props = defineProps<{
  open: boolean
  checking: boolean
  submitting: boolean
  error: string | null
  brandLabel: string
  slug: string
  headerLogoUrl: string
  logoAlt: string
}>()

const email = defineModel<string>("email", { required: true })
const password = defineModel<string>("password", { required: true })

const emit = defineEmits<{
  submit: []
}>()

const { ui } = useAdminUi()

const modalTitle = computed(() =>
  props.checking ? ui.value.login.checkingTitle : ui.value.login.title
)

const modalSubtitle = computed(() => {
  if (props.checking) {
    return ui.value.login.checkingSubtitle
  }

  return adminUiFormat(ui.value.login.subtitle, {
    name: props.brandLabel,
    slug: props.slug
  })
})

watch(
  () => props.open,
  (isOpen) => {
    if (import.meta.server) {
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
  if (props.checking || props.submitting) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    return
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !props.checking && !props.submitting) {
    return
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--login"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--login"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-modal-title"
            aria-busy="checking || submitting"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img
                  v-if="headerLogoUrl"
                  :src="headerLogoUrl"
                  :alt="logoAlt"
                  width="40"
                  height="40"
                  class="hostiv-modal__logo-img hostiv-modal__logo-img--property"
                />
                <img
                  v-else
                  src="/hostiv/logo-mark.svg"
                  alt=""
                  width="40"
                  height="40"
                  class="hostiv-modal__logo-img"
                />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-login-modal-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">{{ modalSubtitle }}</p>
              </div>
            </header>

            <div v-if="checking" class="hostiv-modal__session-check" aria-live="polite">
              <Loader2 :size="28" stroke-width="1.75" class="hostiv-modal__submit-spinner" />
              <p>{{ ui.login.checkingSession }}</p>
            </div>

            <form v-else class="hostiv-modal__form" @submit.prevent="emit('submit')">
              <label class="hostiv-modal__field">
                <span>{{ ui.login.email }}</span>
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  :placeholder="ui.login.emailPlaceholder"
                  required
                />
              </label>
              <label class="hostiv-modal__field">
                <span>{{ ui.login.password }}</span>
                <input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  :placeholder="ui.login.passwordPlaceholder"
                  required
                />
              </label>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <button
                type="submit"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                :disabled="submitting"
              >
                <Loader2
                  v-if="submitting"
                  :size="18"
                  stroke-width="2"
                  class="hostiv-modal__submit-spinner"
                  aria-hidden="true"
                />
                {{ submitting ? ui.login.submitting : ui.login.submit }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
