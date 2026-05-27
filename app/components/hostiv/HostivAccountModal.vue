<script setup lang="ts">
import { Check, CheckCircle2, Loader2, X } from "@lucide/vue"
import type { HostivAccountModalMode } from "../../composables/useHostivAccountModal"
import { hostivPricing, type HostivPricingPlanId } from "../../data/hostivLanding"
import { useHostivPropertySlugCheck } from "../../composables/useHostivPropertySlugCheck"
import {
  evaluateHostivPassword,
  isHostivPasswordValid,
  hostivPasswordRuleLabels,
  type HostivPasswordRuleKey
} from "../../utils/hostiv-password-rules"

const { open, mode, close, selectedPlan, setSelectedPlan } = useHostivAccountModal()

const pricingPlans = hostivPricing.plans

const activePricingPlan = computed(() =>
  pricingPlans.find((plan) => plan.id === selectedPlan.value) ?? pricingPlans[1]
)

const fullName = ref("")
const propertyName = ref("")
const email = ref("")
const password = ref("")
const passwordFieldFocused = ref(false)
const propertyFieldFocused = ref(false)
const loading = ref(false)

const {
  propertySlug,
  status: propertySlugStatus,
  formatValidity: propertySlugValidity,
  isSlugReady,
  runCheck: runPropertySlugCheck
} = useHostivPropertySlugCheck(propertyName)

const passwordRuleKeys: HostivPasswordRuleKey[] = [
  "length",
  "lowercase",
  "uppercase",
  "digit",
  "special"
]

const passwordRules = computed(() => evaluateHostivPassword(password.value))

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (password.value.length > 0 && !isHostivPasswordValid(password.value))
)

const error = ref("")
const success = ref("")

const title = computed(() =>
  mode.value === "signup" ? "Créer votre compte" : "Bon retour"
)

const subtitle = computed(() =>
  mode.value === "signup"
    ? "Créez votre compte et accédez tout de suite à votre backoffice (site en brouillon)."
    : "Connectez-vous pour gérer votre site et vos réservations."
)

const showPropertySlugStatus = computed(() => Boolean(propertyName.value.trim()))

const propertySlugStatusMessage = computed(() => {
  if (!propertyName.value.trim()) {
    return ""
  }

  switch (propertySlugStatus.value) {
    case "checking":
      return "Vérification de la disponibilité…"
    case "available":
      return `Nom disponible — votre site sera accessible sur /${propertySlug.value}`
    case "taken":
      return "Ce nom est déjà utilisé. Choisissez un autre nom de bien."
    case "invalid": {
      const reason = propertySlugValidity.value.valid ? "" : propertySlugValidity.value.reason

      if (reason === "too_short") {
        return "Nom trop court (au moins 3 caractères une fois converti en adresse web)."
      }

      if (reason === "reserved") {
        return "Ce nom est réservé et ne peut pas être utilisé."
      }

      if (reason === "invalid_format") {
        return "Le nom ne peut contenir que des lettres et des chiffres."
      }

      return "Nom invalide pour l’adresse de votre site."
    }
    case "error":
      return "Impossible de vérifier ce nom pour le moment."
    default:
      return propertySlug.value
        ? `Adresse prévue : /${propertySlug.value}`
        : "Saisissez un nom pour générer l’adresse de votre site."
  }
})

watch(open, (isOpen) => {
  if (isOpen) {
    error.value = ""
    success.value = ""
    passwordFieldFocused.value = false
    propertyFieldFocused.value = false
    document.body.style.overflow = "hidden"
    return
  }

  passwordFieldFocused.value = false
  propertyFieldFocused.value = false
  document.body.style.overflow = ""
})

onUnmounted(() => {
  document.body.style.overflow = ""
})

function switchMode(next: HostivAccountModalMode) {
  if (loading.value || mode.value === next) {
    return
  }

  mode.value = next
  error.value = ""
  success.value = ""
  passwordFieldFocused.value = false
  propertyFieldFocused.value = false
}

function onBackdropClick(event: MouseEvent) {
  if (loading.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && !loading.value) {
    close()
  }
}

async function onSignupSubmit() {
  error.value = ""
  success.value = ""

  const name = fullName.value.trim()
  const mail = email.value.trim()
  const pass = password.value

  if (!name || !mail) {
    error.value = "Renseignez votre nom et un e-mail valide."
    return
  }

  if (!isHostivPasswordValid(pass)) {
    error.value = "Choisissez un mot de passe qui respecte tous les critères de sécurité."
    passwordFieldFocused.value = true
    return
  }

  const trimmedProperty = propertyName.value.trim()

  if (!trimmedProperty) {
    error.value = "Indiquez le nom de votre bien pour créer votre site."
    propertyFieldFocused.value = true
    return
  }

  if (propertySlugStatus.value === "checking") {
    await runPropertySlugCheck()
  }

  if (!isSlugReady.value) {
    error.value =
      propertySlugStatus.value === "taken"
        ? "Ce nom de bien est déjà utilisé. Modifiez-le pour continuer."
        : "Choisissez un nom de bien valide et disponible."
    propertyFieldFocused.value = true
    return
  }

  loading.value = true

  try {
    let supabase

    try {
      supabase = useSupabaseClient()
    } catch {
      throw new Error("Inscription indisponible : Supabase n’est pas configuré sur cet environnement.")
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: mail,
      password: pass,
      options: {
        data: {
          full_name: name,
          property_name: trimmedProperty,
          property_slug: propertySlug.value,
          subscription_plan: selectedPlan.value
        }
      }
    })

    if (signUpError) {
      throw signUpError
    }

    let session = signUpData.session

    if (!session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: mail,
        password: pass
      })

      if (signInError) {
        throw new Error(
          "Compte créé. Connectez-vous avec votre e-mail et votre mot de passe pour accéder à votre backoffice."
        )
      }

      session = signInData.session
    }

    if (!session?.access_token) {
      throw new Error("Compte créé mais session indisponible. Essayez de vous connecter.")
    }

    const provision = await $fetch<{ slug: string }>("/api/hostiv/provision", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        property_name: trimmedProperty,
        property_slug: propertySlug.value,
        subscription_plan: selectedPlan.value
      }
    })

    password.value = ""
    close()
    await navigateTo(`/${provision.slug}/admin?onboarding=1`)
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : "Impossible de créer le compte. Réessayez plus tard."
  } finally {
    loading.value = false
  }
}

async function onLoginSubmit() {
  error.value = ""
  success.value = ""

  const mail = email.value.trim()
  const pass = password.value

  if (!mail || !pass) {
    error.value = "Indiquez votre e-mail et votre mot de passe."
    return
  }

  loading.value = true

  try {
    let supabase

    try {
      supabase = useSupabaseClient()
    } catch {
      throw new Error("Connexion indisponible : Supabase n’est pas configuré sur cet environnement.")
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: mail,
      password: pass
    })

    if (signInError) {
      throw signInError
    }

    const adminPath = await resolveHostivAdminPath(signInData.session)

    if (!adminPath) {
      throw new Error(
        "Connexion réussie, mais aucun site n’est associé à ce compte. Contactez-nous si le problème persiste."
      )
    }

    close()
    await navigateTo(adminPath)
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : "Connexion impossible. Vérifiez vos identifiants."
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
            class="hostiv-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostiv-modal-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :disabled="loading" @click="close">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img src="/hostiv/logo-mark.svg" alt="" width="40" height="40" class="hostiv-modal__logo-img" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="hostiv-modal-title" class="hostiv-modal__title">{{ title }}</h2>
                <p class="hostiv-modal__subtitle">{{ subtitle }}</p>
              </div>
            </header>

            <div v-if="!success" class="hostiv-modal__tabs" role="tablist" aria-label="Type de compte">
              <button
                type="button"
                role="tab"
                class="hostiv-modal__tab"
                :class="{ 'hostiv-modal__tab--active': mode === 'signup' }"
                :aria-selected="mode === 'signup'"
                @click="switchMode('signup')"
              >
                Inscription
              </button>
              <button
                type="button"
                role="tab"
                class="hostiv-modal__tab"
                :class="{ 'hostiv-modal__tab--active': mode === 'login' }"
                :aria-selected="mode === 'login'"
                @click="switchMode('login')"
              >
                Connexion
              </button>
            </div>

            <div v-if="success" class="hostiv-modal__success-box" role="status">
              <span class="hostiv-modal__success-icon" aria-hidden="true">
                <CheckCircle2 :size="28" stroke-width="1.75" />
              </span>
              <p class="hostiv-modal__success">{{ success }}</p>
              <button type="button" class="hostiv-btn hostiv-btn--primary hostiv-modal__submit" @click="close">
                Fermer
              </button>
            </div>

            <form
              v-else-if="mode === 'signup'"
              class="hostiv-modal__form"
              @submit.prevent="onSignupSubmit"
            >
              <fieldset class="hostiv-modal__plans">
                <legend class="hostiv-modal__plans-legend">Forfait</legend>
                <div class="hostiv-modal__plans-grid" role="radiogroup" aria-label="Choisir un forfait">
                  <button
                    v-for="plan in pricingPlans"
                    :key="plan.id"
                    type="button"
                    role="radio"
                    class="hostiv-modal__plan"
                    :class="{
                      'hostiv-modal__plan--active': selectedPlan === plan.id,
                      'hostiv-modal__plan--pro': plan.id === 'pro'
                    }"
                    :aria-checked="selectedPlan === plan.id"
                    @click="setSelectedPlan(plan.id as HostivPricingPlanId)"
                  >
                    <span
                      v-if="plan.recommended"
                      class="hostiv-modal__plan-badge"
                    >
                      {{ plan.badge }}
                    </span>
                    <span class="hostiv-modal__plan-name">{{ plan.name }}</span>
                    <span class="hostiv-modal__plan-price">
                      {{ plan.price }}€<span class="hostiv-modal__plan-period">/ {{ plan.period }}</span>
                    </span>
                  </button>
                </div>
              </fieldset>

              <label class="hostiv-modal__field">
                <span>Nom complet</span>
                <input v-model="fullName" type="text" autocomplete="name" placeholder="Marie Dupont" required />
              </label>
              <div class="hostiv-modal__field hostiv-modal__field--property">
                <label class="hostiv-modal__field-label" for="hostiv-signup-property">Nom du bien</label>
                <input
                  id="hostiv-signup-property"
                  v-model="propertyName"
                  type="text"
                  autocomplete="organization"
                  placeholder="Villa des Oliviers"
                  required
                  aria-describedby="hostiv-property-slug-status"
                  @focus="propertyFieldFocused = true"
                  @blur="propertyFieldFocused = false"
                />

                <div
                  v-if="showPropertySlugStatus"
                  id="hostiv-property-slug-status"
                  class="hostiv-modal__slug-status"
                  :class="`hostiv-modal__slug-status--${propertySlugStatus}`"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    class="hostiv-modal__slug-status-icon"
                    :class="{
                      'hostiv-modal__slug-status-icon--pending':
                        propertySlugStatus === 'idle' || propertySlugStatus === 'checking',
                      'hostiv-modal__slug-status-icon--ok': propertySlugStatus === 'available',
                      'hostiv-modal__slug-status-icon--bad':
                        propertySlugStatus === 'taken' ||
                        propertySlugStatus === 'invalid' ||
                        propertySlugStatus === 'error'
                    }"
                    aria-hidden="true"
                  >
                    <Loader2
                      v-if="propertySlugStatus === 'checking'"
                      :size="12"
                      class="hostiv-modal__slug-status-spinner"
                      stroke-width="2.5"
                    />
                    <Check v-else-if="propertySlugStatus === 'available'" :size="12" stroke-width="2.5" />
                    <X
                      v-else-if="
                        propertySlugStatus === 'taken' ||
                        propertySlugStatus === 'invalid' ||
                        propertySlugStatus === 'error'
                      "
                      :size="12"
                      stroke-width="2.5"
                    />
                  </span>
                  <span>{{ propertySlugStatusMessage }}</span>
                </div>
              </div>
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
              <div class="hostiv-modal__field hostiv-modal__field--password">
                <label class="hostiv-modal__field-label" for="hostiv-signup-password">Mot de passe</label>
                <input
                  id="hostiv-signup-password"
                  v-model="password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Créez un mot de passe sécurisé"
                  required
                  aria-describedby="hostiv-password-rules"
                  @focus="passwordFieldFocused = true"
                  @blur="passwordFieldFocused = false"
                />

                <div
                  v-if="showPasswordRules"
                  id="hostiv-password-rules"
                  class="hostiv-modal__password-rules"
                  role="status"
                  aria-live="polite"
                >
                  <p class="hostiv-modal__password-rules-intro">
                    Votre mot de passe doit être suffisamment long et complexe en intégrant des
                    lettres (majuscules et minuscules), des chiffres, de la ponctuation et des
                    caractères spéciaux :
                  </p>
                  <ul class="hostiv-modal__password-rules-list">
                    <li
                      v-for="key in passwordRuleKeys"
                      :key="key"
                      class="hostiv-modal__password-rule"
                      :class="{ 'hostiv-modal__password-rule--met': passwordRules[key] }"
                    >
                      <span class="hostiv-modal__password-rule-icon" aria-hidden="true">
                        <Check v-if="passwordRules[key]" :size="12" stroke-width="2.5" />
                      </span>
                      {{ hostivPasswordRuleLabels[key] }}
                    </li>
                  </ul>
                </div>
              </div>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <button
                type="submit"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                :disabled="loading"
                @mousedown.prevent
              >
                {{
                  loading
                    ? "Création…"
                    : `Créer mon compte — ${activePricingPlan.name}`
                }}
              </button>
            </form>

            <form v-else class="hostiv-modal__form" @submit.prevent="onLoginSubmit">
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
                :disabled="loading"
              >
                {{ loading ? "Connexion…" : "Se connecter" }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
