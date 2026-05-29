<script setup lang="ts">
import { Loader2 } from "@lucide/vue"

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

const modalTitle = computed(() =>
  props.checking ? "Vérification de la session" : "Connexion"
)

const modalSubtitle = computed(() => {
  if (props.checking) {
    return "Nous vérifions que vous êtes toujours connecté…"
  }

  return `Accédez au backoffice de ${props.brandLabel} (/${props.slug}) avec votre compte Hostiv.`
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
              <p>Vérification de la session…</p>
            </div>

            <form v-else class="hostiv-modal__form" @submit.prevent="emit('submit')">
              <label class="hostiv-modal__field">
                <span>E-mail</span>
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="vous@exemple.com"
                  required
                />
              </label>
              <label class="hostiv-modal__field">
                <span>Mot de passe</span>
                <input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Votre mot de passe"
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
                {{ submitting ? "Connexion…" : "Se connecter" }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
