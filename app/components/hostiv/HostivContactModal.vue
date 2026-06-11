<script setup lang="ts">
import { CheckCircle2, Loader2, Send, X } from "@lucide/vue"

const { open, closeContact } = useHostivContactModal()

const name = ref("")
const email = ref("")
const subject = ref("Question générale")
const message = ref("")
const website = ref("")
const loading = ref(false)
const error = ref("")
const success = ref("")

const subjectOptions = [
  "Question générale",
  "Compte et abonnement",
  "Site et réservations",
  "Stripe et paiements",
  "Autre"
] as const

watch(open, (isOpen) => {
  if (isOpen) {
    error.value = ""
    success.value = ""
    document.body.style.overflow = "hidden"
    return
  }

  document.body.style.overflow = ""
})

onUnmounted(() => {
  document.body.style.overflow = ""
})

function resetForm() {
  name.value = ""
  email.value = ""
  subject.value = "Question générale"
  message.value = ""
  website.value = ""
}

function onBackdropClick(event: MouseEvent) {
  if (loading.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    closeContact()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !loading.value) {
    closeContact()
  }
}

async function onSubmit() {
  error.value = ""
  success.value = ""

  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    error.value = "Renseignez tous les champs obligatoires."
    return
  }

  loading.value = true

  try {
    await $fetch("/api/hostiv/contact", {
      method: "POST",
      body: {
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value,
        website: website.value
      }
    })

    success.value =
      "Message envoyé. Un e-mail de confirmation vous a été adressé — nous vous répondrons sous 2 jours ouvrés en général."
    resetForm()
  } catch (cause) {
    const fetchError = cause as { data?: { message?: string }; message?: string }

    error.value =
      fetchError.data?.message ||
      fetchError.message ||
      "Impossible d’envoyer votre message. Réessayez plus tard."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal"
        data-backdrop="true"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--contact"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostiv-contact-modal-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :disabled="loading" @click="closeContact">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img src="/hostiv/logo-mark.svg" alt="" width="40" height="40" class="hostiv-modal__logo-img" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="hostiv-contact-modal-title" class="hostiv-modal__title">Nous contacter</h2>
                <p class="hostiv-modal__subtitle">
                  Décrivez votre demande — nous vous répondons par e-mail.
                </p>
              </div>
            </header>

            <div v-if="success" class="hostiv-modal__success-box" role="status">
              <span class="hostiv-modal__success-icon" aria-hidden="true">
                <CheckCircle2 :size="28" stroke-width="1.75" />
              </span>
              <p class="hostiv-modal__success">{{ success }}</p>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                @click="closeContact"
              >
                Fermer
              </button>
            </div>

            <form v-else class="hostiv-modal__form" @submit.prevent="onSubmit">
              <label class="hostiv-modal__field">
                <span>Nom complet</span>
                <input v-model="name" type="text" autocomplete="name" required />
              </label>

              <label class="hostiv-modal__field">
                <span>E-mail</span>
                <input v-model="email" type="email" autocomplete="email" required />
              </label>

              <label class="hostiv-modal__field">
                <span>Sujet</span>
                <select v-model="subject" class="hostiv-modal__select">
                  <option v-for="option in subjectOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="hostiv-modal__field">
                <span>Message</span>
                <textarea
                  v-model="message"
                  class="hostiv-modal__textarea"
                  rows="5"
                  required
                  placeholder="Décrivez votre question ou votre situation…"
                />
              </label>

              <div class="hostiv-modal__honeypot" aria-hidden="true">
                <label>
                  Site web
                  <input v-model="website" type="text" tabindex="-1" autocomplete="off" />
                </label>
              </div>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <button
                type="submit"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                :disabled="loading"
              >
                {{ loading ? "Envoi…" : "Envoyer le message" }}
                <Loader2 v-if="loading" :size="18" class="hostiv-modal__submit-spinner" />
                <Send v-else :size="18" />
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
