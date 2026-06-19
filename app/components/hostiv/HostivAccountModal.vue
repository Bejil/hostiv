<script setup lang="ts">
import { Check, CheckCircle2, Loader2, X } from "@lucide/vue"
import type { HostivAccountModalMode } from "../../composables/useHostivAccountModal"
import type { HostivPricingPlanId } from "../../data/hostivLanding"
import { useHostivPropertySlugCheck } from "../../composables/useHostivPropertySlugCheck"
import { startHostivSignupCheckout } from "../../composables/useHostivSubscriptionCheckout"
import { useHostivPromoCode } from "../../composables/useHostivPromoCode"
import HostivPromoCodeField from "../HostivPromoCodeField.vue"
import { clearHostivSignupLoginCredentials } from "../../utils/hostiv-signup-session"
import { isHostivPasswordValid } from "../../utils/hostiv-password-rules"
import HostivPasswordRulesChecklist from "../HostivPasswordRulesChecklist.vue"
import HostivSignupPlanCard from "./HostivSignupPlanCard.vue"

const { open, mode, close, selectedPlan, setSelectedPlan } = useHostivAccountModal()
const { landing, locale } = useHostivLocale()
const modal = computed(() => landing.value.accountModal)

const pricingPlans = computed(() => landing.value.pricing.plans)

const activePricingPlan = computed(
  () => pricingPlans.value.find((plan) => plan.id === selectedPlan.value) ?? pricingPlans.value[1]
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

const showPasswordRules = computed(
  () =>
    passwordFieldFocused.value ||
    (password.value.length > 0 && !isHostivPasswordValid(password.value))
)

const error = ref("")
const success = ref("")
const showForgotPassword = ref(false)
const forgotSuccess = ref(false)
const modalPanelRef = ref<HTMLElement | null>(null)

const signupPromo = useHostivPromoCode({
  context: "hostiv_signup",
  email,
  subscriptionPlan: selectedPlan
})

function scrollSignupPasswordRulesIntoView() {
  const run = () => {
    const panel = modalPanelRef.value

    if (!panel || mode.value !== "signup") {
      return
    }

    const rules = panel.querySelector("#hostiv-signup-password-rules")

    if (!rules) {
      return
    }

    const panelRect = panel.getBoundingClientRect()
    const rulesRect = rules.getBoundingClientRect()
    const overflow = rulesRect.bottom - panelRect.bottom + 12

    if (overflow > 0) {
      panel.scrollTo({
        top: panel.scrollTop + overflow,
        behavior: "smooth"
      })
    }
  }

  nextTick(() => {
    requestAnimationFrame(run)
    window.setTimeout(run, 350)
  })
}

function onSignupPasswordFocus() {
  passwordFieldFocused.value = true
  scrollSignupPasswordRulesIntoView()
}

const title = computed(() => {
  if (showForgotPassword.value) {
    return modal.value.forgotPassword.title
  }

  return mode.value === "signup" ? modal.value.titles.signup : modal.value.titles.login
})

const subtitle = computed(() => {
  if (showForgotPassword.value) {
    return forgotSuccess.value ? modal.value.forgotPassword.success : modal.value.forgotPassword.subtitle
  }

  return mode.value === "signup" ? modal.value.subtitles.signup : modal.value.subtitles.login
})

const route = useRoute()
const router = useRouter()

const showPropertySlugStatus = computed(() => Boolean(propertyName.value.trim()))

function formatModalCopy(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  )
}

const propertySlugStatusMessage = computed(() => {
  if (!propertyName.value.trim()) {
    return ""
  }

  const slug = propertySlug.value
  const status = modal.value.slugStatus

  switch (propertySlugStatus.value) {
    case "checking":
      return status.checking
    case "available":
      return formatModalCopy(status.available, { slug })
    case "taken":
      return status.taken
    case "invalid": {
      const reason = propertySlugValidity.value.valid ? "" : propertySlugValidity.value.reason

      if (reason === "too_short") {
        return status.tooShort
      }

      if (reason === "reserved") {
        return status.reserved
      }

      if (reason === "invalid_format") {
        return status.invalidFormat
      }

      return status.invalid
    }
    case "error":
      return status.error
    default:
      return slug ? formatModalCopy(status.preview, { slug }) : status.hint
  }
})

const payButtonLabel = computed(() => {
  if (loading.value) {
    return modal.value.buttons.payLoading
  }

  const plan = activePricingPlan.value
  const price = signupPromo.finalAmountEur ?? plan.price

  return formatModalCopy(modal.value.buttons.pay, {
    price,
    period: plan.period,
    name: plan.name
  })
})

watch(open, (isOpen) => {
  if (isOpen) {
    error.value = ""
    success.value = ""
    showForgotPassword.value = false
    forgotSuccess.value = false
    passwordFieldFocused.value = false
    propertyFieldFocused.value = false
    document.body.style.overflow = "hidden"
    return
  }

  showForgotPassword.value = false
  forgotSuccess.value = false
  passwordFieldFocused.value = false
  propertyFieldFocused.value = false
  document.body.style.overflow = ""
})

watch(
  () => route.query.signup,
  (value) => {
    if (value !== "cancelled") {
      return
    }

    mode.value = "signup"
    open.value = true
    error.value = modal.value.errors.paymentCancelled
    clearHostivSignupLoginCredentials()

    const query = { ...route.query }

    delete query.signup
    void router.replace({ path: route.path, query })
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.style.overflow = ""
})

function switchMode(next: HostivAccountModalMode) {
  if (loading.value || mode.value === next) {
    return
  }

  mode.value = next
  showForgotPassword.value = false
  forgotSuccess.value = false
  error.value = ""
  success.value = ""
  passwordFieldFocused.value = false
  propertyFieldFocused.value = false
}

function openForgotPasswordView() {
  if (loading.value) {
    return
  }

  mode.value = "login"
  showForgotPassword.value = true
  forgotSuccess.value = false
  error.value = ""
}

function backToLoginView() {
  showForgotPassword.value = false
  forgotSuccess.value = false
  error.value = ""
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
  const errors = modal.value.errors

  if (!name || !mail) {
    error.value = errors.nameAndEmail
    return
  }

  if (!isHostivPasswordValid(pass)) {
    error.value = errors.passwordInvalid
    passwordFieldFocused.value = true
    scrollSignupPasswordRulesIntoView()
    return
  }

  const trimmedProperty = propertyName.value.trim()

  if (!trimmedProperty) {
    error.value = errors.propertyRequired
    propertyFieldFocused.value = true
    return
  }

  if (propertySlugStatus.value === "checking") {
    await runPropertySlugCheck()
  }

  if (!isSlugReady.value) {
    error.value =
      propertySlugStatus.value === "taken" ? errors.propertyTaken : errors.propertyInvalid
    propertyFieldFocused.value = true
    return
  }

  loading.value = true

  try {
    await startHostivSignupCheckout({
      full_name: name,
      email: mail,
      password: pass,
      property_name: trimmedProperty,
      property_slug: propertySlug.value,
      subscription_plan: selectedPlan.value,
      promo_code: signupPromo.promoCodeForCheckout || undefined
    })
  } catch (cause) {
    const err = cause as { data?: { message?: string }; message?: string }

    error.value =
      err.data?.message ||
      (cause instanceof Error ? cause.message : errors.checkoutFailed)
  } finally {
    loading.value = false
  }
}

async function onForgotPasswordSubmit() {
  error.value = ""

  const mail = email.value.trim()
  const forgot = modal.value.forgotPassword

  if (!mail) {
    error.value = forgot.errors.invalidEmail
    return
  }

  loading.value = true

  try {
    await $fetch("/api/hostiv/password-reset/request", {
      method: "POST",
      body: {
        email: mail,
        locale: locale.value
      }
    })

    forgotSuccess.value = true
    error.value = ""
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || forgot.errors.sendFailed
  } finally {
    loading.value = false
  }
}

async function onLoginSubmit() {
  error.value = ""
  success.value = ""

  const mail = email.value.trim()
  const pass = password.value
  const errors = modal.value.errors

  if (!mail || !pass) {
    error.value = errors.loginCredentials
    return
  }

  loading.value = true

  try {
    let supabase

    try {
      supabase = useSupabaseClient()
    } catch {
      throw new Error(errors.supabaseUnavailable)
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
      throw new Error(errors.noSite)
    }

    close()
    await navigateTo(adminPath)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : errors.loginFailed
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
            ref="modalPanelRef"
            class="hostiv-modal__panel"
            :class="{ 'hostiv-modal__panel--signup': mode === 'signup' }"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hostiv-modal-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :disabled="loading" @click="close">
              <span class="sr-only">{{ modal.close }}</span>
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

            <div
              v-if="!success && !showForgotPassword"
              class="hostiv-modal__tabs"
              role="tablist"
              :aria-label="modal.tabsAria"
            >
              <button
                type="button"
                role="tab"
                class="hostiv-modal__tab"
                :class="{ 'hostiv-modal__tab--active': mode === 'signup' }"
                :aria-selected="mode === 'signup'"
                @click="switchMode('signup')"
              >
                {{ modal.signupTab }}
              </button>
              <button
                type="button"
                role="tab"
                class="hostiv-modal__tab"
                :class="{ 'hostiv-modal__tab--active': mode === 'login' }"
                :aria-selected="mode === 'login'"
                @click="switchMode('login')"
              >
                {{ modal.loginTab }}
              </button>
            </div>

            <div v-if="success" class="hostiv-modal__success-box" role="status">
              <span class="hostiv-modal__success-icon" aria-hidden="true">
                <CheckCircle2 :size="28" stroke-width="1.75" />
              </span>
              <p class="hostiv-modal__success">{{ success }}</p>
              <button type="button" class="hostiv-btn hostiv-btn--primary hostiv-modal__submit" @click="close">
                {{ modal.close }}
              </button>
            </div>

            <form
              v-else-if="mode === 'signup' && !showForgotPassword"
              class="hostiv-modal__form"
              @submit.prevent="onSignupSubmit"
            >
              <fieldset class="hostiv-modal__plans">
                <legend class="hostiv-modal__plans-legend">{{ modal.plans.legend }}</legend>
                <div
                  class="hostiv-modal__plans-grid hostiv-modal__plans-grid--detailed"
                  role="radiogroup"
                  :aria-label="modal.plans.chooseAria"
                >
                  <HostivSignupPlanCard
                    v-for="plan in pricingPlans"
                    :key="plan.id"
                    :plan-id="plan.id"
                    :selected="selectedPlan === plan.id"
                    :disabled="loading"
                    @select="setSelectedPlan(plan.id as HostivPricingPlanId)"
                  />
                </div>
                <p class="hostiv-modal__plans-note">
                  {{ modal.plans.note }}
                </p>
              </fieldset>

              <label class="hostiv-modal__field">
                <span>{{ modal.fields.fullName }}</span>
                <input
                  v-model="fullName"
                  type="text"
                  autocomplete="name"
                  :placeholder="modal.fields.fullNamePlaceholder"
                  required
                />
              </label>
              <div class="hostiv-modal__field hostiv-modal__field--property">
                <label class="hostiv-modal__field-label" for="hostiv-signup-property">
                  {{ modal.fields.propertyName }}
                </label>
                <input
                  id="hostiv-signup-property"
                  v-model="propertyName"
                  type="text"
                  autocomplete="organization"
                  :placeholder="modal.fields.propertyPlaceholder"
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
                <span>{{ modal.fields.email }}</span>
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  :placeholder="modal.fields.emailPlaceholder"
                  required
                />
              </label>
              <div class="hostiv-modal__field hostiv-modal__field--password">
                <label class="hostiv-modal__field-label" for="hostiv-signup-password">
                  {{ modal.fields.password }}
                </label>
                <input
                  id="hostiv-signup-password"
                  v-model="password"
                  type="password"
                  autocomplete="new-password"
                  :placeholder="modal.fields.passwordPlaceholderSignup"
                  required
                  aria-describedby="hostiv-signup-password-rules"
                  @focus="onSignupPasswordFocus"
                  @blur="passwordFieldFocused = false"
                />

                <HostivPasswordRulesChecklist
                  :password="password"
                  :visible="showPasswordRules"
                  id="hostiv-signup-password-rules"
                />
              </div>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <HostivPromoCodeField
                context="hostiv_signup"
                :email="email"
                :subscription-plan="selectedPlan"
                :code="signupPromo.code"
                :applied-code="signupPromo.applied?.code ?? null"
                :validating="signupPromo.validating"
                :error="signupPromo.error"
                compact
                @update:code="signupPromo.code = $event"
                @apply="signupPromo.applyPromoCode()"
                @clear="signupPromo.clearPromo()"
              />

              <button
                type="submit"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                :disabled="loading"
                @mousedown.prevent
              >
                {{ payButtonLabel }}
              </button>
            </form>

            <form
              v-else-if="showForgotPassword"
              class="hostiv-modal__form"
              @submit.prevent="onForgotPasswordSubmit"
            >
              <template v-if="!forgotSuccess">
                <label class="hostiv-modal__field">
                  <span>{{ modal.fields.email }}</span>
                  <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    :placeholder="modal.fields.emailPlaceholder"
                    required
                  />
                </label>

                <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

                <button
                  type="submit"
                  class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                  :disabled="loading"
                >
                  {{ loading ? modal.forgotPassword.submitting : modal.forgotPassword.submit }}
                </button>
              </template>

              <button
                type="button"
                class="hostiv-btn hostiv-btn--secondary hostiv-modal__submit"
                @click="backToLoginView"
              >
                {{ modal.forgotPassword.backToLogin }}
              </button>
            </form>

            <form v-else class="hostiv-modal__form" @submit.prevent="onLoginSubmit">
              <label class="hostiv-modal__field">
                <span>{{ modal.fields.email }}</span>
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  :placeholder="modal.fields.emailPlaceholder"
                  required
                />
              </label>
              <label class="hostiv-modal__field">
                <span>{{ modal.fields.password }}</span>
                <input
                  v-model="password"
                  type="password"
                  autocomplete="current-password"
                  :placeholder="modal.fields.passwordPlaceholderLogin"
                  required
                />
              </label>

              <p class="hostiv-modal__forgot-wrap">
                <button type="button" class="hostiv-modal__forgot-link" @click="openForgotPasswordView">
                  {{ modal.forgotPasswordLink }}
                </button>
              </p>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <button
                type="submit"
                class="hostiv-btn hostiv-btn--primary hostiv-modal__submit"
                :disabled="loading"
              >
                {{ loading ? modal.buttons.loginLoading : modal.buttons.login }}
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
