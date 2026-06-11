<script setup lang="ts">
import { Loader2 } from "@lucide/vue"
import type { GuestReviewFormContext } from "../../types/guest-review"
import { validatePropertySlugFormat } from "../../utils/property-slug"
import { formatLongDisplayDate } from "../../utils/input-date"

definePageMeta({
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length) {
      return false
    }

    if (slug.includes(".")) {
      return false
    }

    return validatePropertySlugFormat(slug).valid
  }
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || "").trim().toLowerCase())
const token = computed(() => String(route.query.token || "").trim())

const status = ref<"loading" | "ready" | "submitted" | "unavailable" | "error">("loading")
const context = ref<GuestReviewFormContext | null>(null)
const errorMessage = ref("")
const rating = ref(0)
const comment = ref("")
const submitting = ref(false)

const expiresLabel = computed(() =>
  context.value?.expiresOn ? formatLongDisplayDate(context.value.expiresOn) : ""
)

async function loadForm() {
  if (!token.value) {
    status.value = "error"
    errorMessage.value = "Lien incomplet. Utilisez le lien reçu par e-mail."
    return
  }

  status.value = "loading"

  try {
    const data = await $fetch<GuestReviewFormContext>("/api/guest-review/form", {
      query: {
        slug: slug.value,
        token: token.value
      }
    })

    context.value = data

    if (data.alreadySubmitted) {
      status.value = "submitted"
      return
    }

    if (data.expired) {
      status.value = "unavailable"
      return
    }

    status.value = "ready"
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    status.value = "error"
    errorMessage.value = e.data?.message || e.message || "Impossible de charger le formulaire."
  }
}

async function submitReview() {
  if (!rating.value || comment.value.trim().length < 10) {
    errorMessage.value = "Choisissez une note et rédigez au moins 10 caractères."
    return
  }

  submitting.value = true
  errorMessage.value = ""

  try {
    await $fetch("/api/guest-review/submit", {
      method: "POST",
      body: {
        slug: slug.value,
        token: token.value,
        rating: rating.value,
        comment: comment.value.trim()
      }
    })

    status.value = "submitted"
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    errorMessage.value = e.data?.message || e.message || "Envoi impossible. Réessayez."
  } finally {
    submitting.value = false
  }
}

watch([slug, token], () => {
  void loadForm()
}, { immediate: true })

useHead({
  title: computed(() =>
    context.value?.brandName ? `Votre avis — ${context.value.brandName}` : "Laisser un avis"
  ),
  meta: [{ name: "robots", content: "noindex, nofollow" }]
})
</script>

<template>
  <div class="guest-review-page">
    <main class="guest-review-card">
      <p v-if="status === 'loading'" class="guest-review-card__status">
        <Loader2 class="guest-review-card__spinner" aria-hidden="true" />
        Chargement...
      </p>

      <template v-else-if="status === 'ready' && context">
        <p class="guest-review-card__eyebrow">Merci pour votre séjour</p>
        <h1 class="guest-review-card__title">
          Partagez votre avis sur {{ context.brandName }}
        </h1>
        <p class="guest-review-card__lead">
          Bonjour {{ context.guestFirstName }}, votre retour aide les futurs voyageurs.
          Vous pouvez répondre jusqu’au {{ expiresLabel }}.
        </p>

        <form class="guest-review-form" @submit.prevent="submitReview">
          <fieldset class="guest-review-form__stars">
            <legend>Note</legend>
            <div class="guest-review-form__star-row">
              <button
                v-for="value in 5"
                :key="value"
                type="button"
                class="guest-review-form__star-btn"
                :class="{ 'guest-review-form__star-btn--active': value <= rating }"
                :aria-label="`${value} étoile${value > 1 ? 's' : ''}`"
                @click="rating = value"
              >
                {{ value <= rating ? "★" : "☆" }}
              </button>
            </div>
          </fieldset>

          <label class="guest-review-form__field">
            <span>Votre commentaire</span>
            <textarea
              v-model="comment"
              rows="6"
              maxlength="2000"
              required
              placeholder="Qu’avez-vous apprécié ? Que pourrait-on améliorer ?"
            />
          </label>

          <p v-if="errorMessage" class="guest-review-form__error" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="guest-review-form__submit" :disabled="submitting">
            {{ submitting ? "Envoi..." : "Envoyer mon avis" }}
          </button>
        </form>
      </template>

      <template v-else-if="status === 'submitted'">
        <h1 class="guest-review-card__title">Merci pour votre avis</h1>
        <p class="guest-review-card__lead">
          Votre retour a bien été enregistré. Nous vous remercions d’avoir pris le temps de partager votre expérience.
        </p>
      </template>

      <template v-else-if="status === 'unavailable'">
        <h1 class="guest-review-card__title">Délai dépassé</h1>
        <p class="guest-review-card__lead">
          Le délai de 7 jours après votre départ est écoulé. Il n’est plus possible de laisser un avis via ce lien.
        </p>
      </template>

      <template v-else>
        <h1 class="guest-review-card__title">Lien indisponible</h1>
        <p class="guest-review-card__lead">{{ errorMessage }}</p>
      </template>
    </main>
  </div>
</template>

<style scoped>
.guest-review-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: linear-gradient(180deg, #f4f8f4 0%, #ffffff 55%);
}

.guest-review-card {
  width: min(100%, 34rem);
  padding: 2rem;
  border-radius: 1.25rem;
  background: #fff;
  border: 1px solid #e4ebe4;
  box-shadow: 0 18px 48px rgba(18, 38, 24, 0.08);
}

.guest-review-card__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2f6b4f;
}

.guest-review-card__title {
  margin: 0 0 0.75rem;
  font-size: 1.6rem;
  line-height: 1.25;
  color: #142117;
}

.guest-review-card__lead {
  margin: 0 0 1.5rem;
  color: #4d5c52;
  line-height: 1.6;
}

.guest-review-card__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #4d5c52;
}

.guest-review-card__spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

.guest-review-form__stars {
  margin: 0 0 1.25rem;
  padding: 0;
  border: 0;
}

.guest-review-form__stars legend {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #142117;
}

.guest-review-form__star-row {
  display: flex;
  gap: 0.35rem;
}

.guest-review-form__star-btn {
  border: 0;
  background: transparent;
  font-size: 1.75rem;
  line-height: 1;
  color: #b8c5bb;
  cursor: pointer;
}

.guest-review-form__star-btn--active {
  color: #2f6b4f;
}

.guest-review-form__field {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.guest-review-form__field span {
  font-weight: 600;
  color: #142117;
}

.guest-review-form__field textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #d7e2da;
  font: inherit;
  resize: vertical;
}

.guest-review-form__error {
  margin: 0 0 1rem;
  color: #b42318;
  font-size: 0.92rem;
}

.guest-review-form__submit {
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 0.9rem 1.25rem;
  background: #2f6b4f;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.guest-review-form__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
