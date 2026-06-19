<script setup lang="ts">
import { Check, Loader2, Star, X } from "@lucide/vue"
import HostivSignupPlanCard from "../hostiv/HostivSignupPlanCard.vue"
import type { HostivPricingPlanId } from "../../data/hostivLanding"
import { useHostivPropertySlugCheck } from "../../composables/useHostivPropertySlugCheck"
import { startHostivPropertyAddCheckout } from "../../composables/useHostivSubscriptionCheckout"
import { useHostivPromoCode } from "../../composables/useHostivPromoCode"
import HostivPromoCodeField from "../HostivPromoCodeField.vue"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  open: boolean
  returnSlug: string
  proPlanOnly?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { ui } = useAdminUi()
const { landing } = useHostivLocale()
const modal = computed(() => landing.value.accountModal)
const pricingPlans = computed(() => {
  const plans = landing.value.pricing.plans

  if (props.proPlanOnly) {
    return plans.filter((plan) => plan.id === "pro")
  }

  return plans
})

const propertyName = ref("")
const selectedPlan = ref<HostivPricingPlanId>("pro")
const loading = ref(false)
const error = ref("")
const userEmail = ref("")

const checkoutPromo = useHostivPromoCode({
  context: "hostiv_property_add",
  email: userEmail,
  subscriptionPlan: selectedPlan
})

const {
  propertySlug,
  status: propertySlugStatus,
  formatValidity: propertySlugValidity,
  isSlugReady,
  runCheck: runPropertySlugCheck
} = useHostivPropertySlugCheck(propertyName)

const activePricingPlan = computed(
  () => pricingPlans.value.find((plan) => plan.id === selectedPlan.value) ?? pricingPlans.value[1]
)

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
  const price = checkoutPromo.finalAmountEur ?? plan.price

  if (props.proPlanOnly) {
    return formatModalCopy(ui.value.properties.addProOnlySubmit, {
      price
    })
  }

  return formatModalCopy(modal.value.buttons.pay, {
    price,
    period: plan.period,
    name: plan.name
  })
})

const modalTitle = computed(() =>
  props.proPlanOnly ? ui.value.properties.addProOnlyTitle : ui.value.properties.addTitle
)

const modalLead = computed(() =>
  props.proPlanOnly ? ui.value.properties.addProOnlyLead : ui.value.properties.addLead
)

const showPlanPicker = computed(() => props.proPlanOnly || pricingPlans.value.length > 1)

const plansLegend = computed(() =>
  props.proPlanOnly ? ui.value.properties.addProOnlyPlanLegend : modal.value.plans.legend
)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
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

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    error.value = ""
    loading.value = false
    propertyName.value = ""
    selectedPlan.value = "pro"
    checkoutPromo.resetPromoState()
    void loadUserEmail()
  }
)

async function loadUserEmail() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  userEmail.value = data.session?.user?.email?.trim() ?? ""
}

watch(
  () => selectedPlan.value,
  () => {
    checkoutPromo.clearPromo()
  }
)

watch(
  () => props.proPlanOnly,
  (proOnly) => {
    if (proOnly) {
      selectedPlan.value = "pro"
    }
  },
  { immediate: true }
)

function close() {
  if (loading.value) {
    return
  }

  emit("close")
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

async function onSubmit() {
  error.value = ""

  const trimmedProperty = propertyName.value.trim()

  if (!trimmedProperty) {
    error.value = modal.value.errors.propertyRequired
    return
  }

  if (propertySlugStatus.value === "checking") {
    await runPropertySlugCheck()
  }

  if (!isSlugReady.value) {
    error.value =
      propertySlugStatus.value === "taken"
        ? modal.value.errors.propertyTaken
        : modal.value.errors.propertyInvalid
    return
  }

  loading.value = true

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error(modal.value.errors.supabaseUnavailable)
    }

    await startHostivPropertyAddCheckout(token, {
      property_name: trimmedProperty,
      property_slug: propertySlug.value,
      subscription_plan: selectedPlan.value,
      return_slug: props.returnSlug,
      promo_code: checkoutPromo.promoCodeForCheckout || undefined
    })
  } catch (cause) {
    const err = cause as { data?: { message?: string }; message?: string }

    error.value = err.data?.message || err.message || modal.value.errors.checkoutFailed
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--add-property"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--signup hostiv-modal__panel--add-property"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-add-property-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :disabled="loading"
              :aria-label="ui.common.close"
              @click="close"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

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
                <h2 id="admin-add-property-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ modalLead }}
                </p>
              </div>
            </header>

            <form class="hostiv-modal__form" @submit.prevent="onSubmit">
              <aside
                v-if="proPlanOnly"
                class="hostiv-modal__pro-only-notice"
                role="status"
                aria-live="polite"
              >
                <span class="hostiv-modal__pro-only-notice-accent" aria-hidden="true" />

                <div class="hostiv-modal__pro-only-notice-head">
                  <span class="hostiv-modal__pro-only-notice-icon" aria-hidden="true">
                    <Star :size="15" stroke-width="2.25" />
                  </span>
                  <p class="hostiv-modal__pro-only-notice-kicker">
                    {{ ui.properties.addProOnlyNoticeKicker }}
                  </p>
                </div>

                <p class="hostiv-modal__pro-only-notice-lead">
                  {{ ui.properties.addProOnlyNoticeLead }}
                </p>
              </aside>

              <div class="hostiv-modal__field hostiv-modal__field--property">
                <label class="hostiv-modal__field-label" for="admin-add-property-name">
                  {{ modal.fields.propertyName }}
                </label>
                <input
                  id="admin-add-property-name"
                  v-model="propertyName"
                  type="text"
                  autocomplete="organization"
                  :placeholder="modal.fields.propertyPlaceholder"
                  required
                  aria-describedby="admin-add-property-slug-status"
                />

                <div
                  v-if="showPropertySlugStatus"
                  id="admin-add-property-slug-status"
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

              <fieldset v-if="showPlanPicker" class="hostiv-modal__plans">
                <legend class="hostiv-modal__plans-legend">{{ plansLegend }}</legend>
                <div
                  class="hostiv-modal__plans-grid hostiv-modal__plans-grid--detailed"
                  :class="{ 'hostiv-modal__plans-grid--single': proPlanOnly }"
                  role="radiogroup"
                  :aria-label="modal.plans.chooseAria"
                >
                  <HostivSignupPlanCard
                    v-for="plan in pricingPlans"
                    :key="plan.id"
                    :plan-id="plan.id"
                    :selected="selectedPlan === plan.id"
                    :disabled="loading"
                    @select="selectedPlan = plan.id as HostivPricingPlanId"
                  />
                </div>
                <p v-if="!proPlanOnly" class="hostiv-modal__plans-note">
                  {{ modal.plans.note }}
                </p>
              </fieldset>

              <p v-if="error" class="hostiv-modal__error" role="alert">{{ error }}</p>

              <HostivPromoCodeField
                context="hostiv_property_add"
                :email="userEmail"
                :subscription-plan="selectedPlan"
                :code="checkoutPromo.code"
                :applied-code="checkoutPromo.applied?.code ?? null"
                :validating="checkoutPromo.validating"
                :error="checkoutPromo.error"
                compact
                @update:code="checkoutPromo.code = $event"
                @apply="checkoutPromo.applyPromoCode()"
                @clear="checkoutPromo.clearPromo()"
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
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
