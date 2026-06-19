<script setup lang="ts">
import { Sparkles, X } from "@lucide/vue"
import { getAdminProFeatures, type AdminProFeatureId } from "../../data/admin-pro-features"
import { adminUiFormat } from "../../data/admin-ui"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import AdminAlert from "./AdminAlert.vue"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import { startHostivPremiumToolsCheckout, startHostivSubscriptionCheckout } from "../../composables/useHostivSubscriptionCheckout"
import { useHostivPromoCode } from "../../composables/useHostivPromoCode"
import HostivPromoCodeField from "../HostivPromoCodeField.vue"

const props = defineProps<{
  open: boolean
  featureId: AdminProFeatureId | null
  slug: string
  subscriptionAccess: HostivSubscriptionAccess | null
}>()

const emit = defineEmits<{
  close: []
}>()

const paying = ref(false)
const payingPlan = ref<"starter-plus" | "pro" | null>(null)
const error = ref("")
const userEmail = ref("")
const proPlanId = ref("pro")

const premiumPromo = useHostivPromoCode({
  context: "hostiv_premium_tools",
  email: userEmail
})

const proPromo = useHostivPromoCode({
  context: "hostiv_subscription",
  email: userEmail,
  subscriptionPlan: proPlanId
})

const { ui, locale } = useAdminUi()
const { landing } = useHostivLocale()

const premiumAddon = computed(() => landing.value.pricing.premiumAddon)
const proPlan = computed(() => landing.value.pricing.plans.find((plan) => plan.id === "pro") ?? null)

const feature = computed(() => {
  const id = props.featureId

  return id ? getAdminProFeatures(locale.value)[id] : null
})

const isCohostsFeature = computed(() => props.featureId === "cohosts")

const isVisible = computed(() => props.open && Boolean(feature.value))

const premiumPriceLabel = computed(() => {
  const price = premiumPromo.finalAmountEur ?? premiumAddon.value.price

  return `${premiumAddon.value.pricePrefix}${price}€`
})

const proPriceLabel = computed(() => {
  const price = proPromo.finalAmountEur ?? proPlan.value?.price ?? 99

  return `${price}€`
})

const starterPlusCtaLabel = computed(() => {
  const id = props.featureId

  if (!id) {
    return ""
  }

  const price =
    premiumPromo.finalAmountEur != null
      ? String(premiumPromo.finalAmountEur)
      : String(premiumAddon.value.price)

  return adminUiFormat(ui.value.proFeatures[id].starterPlusCta, { price })
})

const proCtaLabel = computed(() => {
  if (props.featureId !== "cohosts") {
    return feature.value?.proCta ?? ""
  }

  const proPrice =
    proPromo.finalAmountEur != null
      ? String(proPromo.finalAmountEur)
      : String(proPlan.value?.price ?? 99)

  return adminUiFormat(ui.value.proFeatures.cohosts.proCta, { proPrice })
})

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""

    if (isOpen) {
      error.value = ""
      paying.value = false
      payingPlan.value = null
      premiumPromo.resetPromoState()
      proPromo.resetPromoState()
      void loadUserEmail()
    }
  }
)

async function loadUserEmail() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()

  userEmail.value = data.session?.user?.email?.trim() ?? ""
}

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

async function onActivateStarterPlus() {
  paying.value = true
  payingPlan.value = "starter-plus"
  error.value = ""

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error(ui.value.proUpgrade.loginRequired)
    }

    await startHostivPremiumToolsCheckout(
      token,
      props.slug,
      premiumPromo.promoCodeForCheckout || undefined
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.proUpgrade.paymentOpenFailed
    paying.value = false
    payingPlan.value = null
  }
}

async function onUpgradeToPro() {
  paying.value = true
  payingPlan.value = "pro"
  error.value = ""

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error(ui.value.proUpgrade.loginRequired)
    }

    await startHostivSubscriptionCheckout(
      token,
      "pro",
      props.slug,
      proPromo.promoCodeForCheckout || undefined
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.proUpgrade.paymentOpenFailed
    paying.value = false
    payingPlan.value = null
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="isVisible"
        class="hostiv-modal hostiv-modal--pro-upgrade"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--pro-upgrade"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-pro-upgrade-title"
            aria-describedby="admin-pro-upgrade-desc"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :aria-label="ui.proUpgrade.close" @click="emit('close')">
              <span class="sr-only">{{ ui.proUpgrade.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo hostiv-modal__logo--icon" aria-hidden="true">
                <Sparkles :size="22" stroke-width="2" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 v-if="feature" id="admin-pro-upgrade-title" class="hostiv-modal__title">
                  {{ feature.title }}
                </h2>
                <p v-if="feature" id="admin-pro-upgrade-desc" class="hostiv-modal__subtitle">
                  {{ feature.lead }}
                </p>
              </div>
            </header>

            <template v-if="isCohostsFeature && feature">
              <p class="hostiv-modal__upgrade-options-intro">{{ feature.optionsIntro }}</p>
              <ul class="hostiv-modal__upgrade-options">
                <li>{{ feature.starterPlusOption }}</li>
                <li>{{ feature.proOption }}</li>
              </ul>

              <div class="hostiv-modal__pro-upgrade-plans">
                <article class="hostiv-modal__plan-offer hostiv-modal__plan-offer--premium">
                  <p class="hostiv-modal__plan-offer-kicker">
                    <Sparkles :size="13" stroke-width="2" aria-hidden="true" />
                    {{ premiumAddon.label }}
                  </p>
                  <div class="hostiv-modal__plan-card-head">
                    <span class="hostiv-modal__plan-card-tier hostiv-modal__plan-card-tier--starter">
                      <span class="hostiv-modal__plan-card-dot" aria-hidden="true" />
                      {{ premiumAddon.name }}
                    </span>
                    <p class="hostiv-modal__plan-card-price">
                      <span class="hostiv-modal__plan-card-amount">{{ premiumPriceLabel }}</span>
                      <span class="hostiv-modal__plan-card-period">/ {{ premiumAddon.period }}</span>
                    </p>
                  </div>
                  <HostivPromoCodeField
                    context="hostiv_premium_tools"
                    :email="userEmail"
                    :code="premiumPromo.code"
                    :applied-code="premiumPromo.applied?.code ?? null"
                    :validating="premiumPromo.validating"
                    :error="premiumPromo.error"
                    compact
                    @update:code="premiumPromo.code = $event"
                    @apply="premiumPromo.applyPromoCode()"
                    @clear="premiumPromo.clearPromo()"
                  />
                  <button
                    type="button"
                    class="hostiv-btn hostiv-btn--primary hostiv-modal__plan-offer-cta"
                    :disabled="paying"
                    @click="onActivateStarterPlus"
                  >
                    {{
                      paying && payingPlan === "starter-plus"
                        ? ui.proUpgrade.redirecting
                        : starterPlusCtaLabel
                    }}
                  </button>
                </article>

                <article v-if="proPlan" class="hostiv-modal__plan-offer hostiv-modal__plan-offer--pro">
                  <p class="hostiv-modal__plan-offer-kicker">{{ proPlan.recommended ? proPlan.badge : "Forfait" }}</p>
                  <div class="hostiv-modal__plan-card-head">
                    <span class="hostiv-modal__plan-card-tier hostiv-modal__plan-card-tier--pro">
                      <span class="hostiv-modal__plan-card-dot" aria-hidden="true" />
                      {{ proPlan.name }}
                    </span>
                    <p class="hostiv-modal__plan-card-price">
                      <span class="hostiv-modal__plan-card-amount">{{ proPriceLabel }}</span>
                      <span class="hostiv-modal__plan-card-period">/ {{ proPlan.period }}</span>
                    </p>
                  </div>
                  <p class="hostiv-modal__plan-card-tagline">{{ proPlan.includesLabel }}</p>
                  <HostivPromoCodeField
                    context="hostiv_subscription"
                    :email="userEmail"
                    subscription-plan="pro"
                    :code="proPromo.code"
                    :applied-code="proPromo.applied?.code ?? null"
                    :validating="proPromo.validating"
                    :error="proPromo.error"
                    compact
                    @update:code="proPromo.code = $event"
                    @apply="proPromo.applyPromoCode()"
                    @clear="proPromo.clearPromo()"
                  />
                  <button
                    type="button"
                    class="hostiv-btn hostiv-btn--accent hostiv-modal__plan-offer-cta"
                    :disabled="paying"
                    @click="onUpgradeToPro"
                  >
                    {{ paying && payingPlan === "pro" ? ui.proUpgrade.redirecting : proCtaLabel }}
                  </button>
                </article>
              </div>
            </template>

            <template v-else>
            <article class="hostiv-modal__plan-offer hostiv-modal__plan-offer--premium hostiv-modal__plan-offer--solo">
              <p class="hostiv-modal__plan-offer-kicker">
                <Sparkles :size="13" stroke-width="2" aria-hidden="true" />
                {{ premiumAddon.label }}
              </p>
              <div class="hostiv-modal__plan-card-head">
                <span class="hostiv-modal__plan-card-tier hostiv-modal__plan-card-tier--starter">
                  <span class="hostiv-modal__plan-card-dot" aria-hidden="true" />
                  {{ premiumAddon.name }}
                </span>
                <p class="hostiv-modal__plan-card-price">
                  <span class="hostiv-modal__plan-card-amount">{{ premiumPriceLabel }}</span>
                  <span class="hostiv-modal__plan-card-period">/ {{ premiumAddon.period }}</span>
                </p>
              </div>
              <p class="hostiv-modal__plan-card-tagline">{{ premiumAddon.tagline }}</p>
            </article>
            </template>

            <AdminAlert v-if="error" variant="error" :message="error" />

            <HostivPromoCodeField
              v-if="!isCohostsFeature"
              context="hostiv_premium_tools"
              :email="userEmail"
              :code="premiumPromo.code"
              :applied-code="premiumPromo.applied?.code ?? null"
              :validating="premiumPromo.validating"
              :error="premiumPromo.error"
              compact
              @update:code="premiumPromo.code = $event"
              @apply="premiumPromo.applyPromoCode()"
              @clear="premiumPromo.clearPromo()"
            />

            <div v-if="!isCohostsFeature" class="hostiv-modal__pro-upgrade-actions">
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="paying"
                @click="onActivateStarterPlus"
              >
                {{ paying ? ui.proUpgrade.redirecting : starterPlusCtaLabel }}
              </button>
            </div>

            <div class="hostiv-modal__pro-upgrade-actions hostiv-modal__pro-upgrade-actions--footer">
              <button
                type="button"
                class="hostiv-btn hostiv-btn--secondary"
                :disabled="paying"
                @click="emit('close')"
              >
                {{ ui.proUpgrade.later }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
