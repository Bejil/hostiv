<script setup lang="ts">
import AdminAlert from "./AdminAlert.vue"
import AdminField from "./AdminField.vue"

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
    <Transition name="admin-login-modal-fade">
      <div
        v-if="open"
        class="admin-login-modal"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div
          class="admin-login-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-login-modal-title"
          @click.stop
        >
          <form class="admin-login" @submit.prevent="emit('submit')">
              <p class="admin-login__badge">
                <img
                  v-if="headerLogoUrl"
                  :src="headerLogoUrl"
                  :alt="logoAlt"
                  class="admin-login__badge-logo"
                />
                Administration
              </p>
              <h2 id="admin-login-modal-title">Connexion</h2>
              <p>
                Accédez au backoffice de <strong>{{ brandLabel }}</strong>
                <span class="admin-login__slug">(/{{ slug }})</span> avec votre compte Hostiv.
              </p>

              <div v-if="checking" class="admin-login-modal__loading" aria-live="polite">
                <div class="admin-loading__spinner" aria-hidden="true" />
                <p>Vérification de la session…</p>
              </div>

              <template v-else>
                <div class="admin-login__fields">
                  <AdminField
                    v-model="email"
                    label="E-mail"
                    type="email"
                    placeholder="vous@exemple.com"
                  />
                  <AdminField v-model="password" label="Mot de passe" type="password" />
                </div>
                <button
                  type="submit"
                  class="admin-btn admin-btn--primary admin-login__submit"
                  :disabled="submitting"
                >
                  {{ submitting ? "Connexion…" : "Se connecter" }}
                </button>
                <AdminAlert v-if="error" variant="error" :message="error" />
              </template>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
