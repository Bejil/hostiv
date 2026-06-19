<script setup lang="ts">
import { X } from "@lucide/vue"
import { getHostivLanding, type HostivPricingPlanId } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import { startHostivSubscriptionCheckout } from "../../composables/useHostivSubscriptionCheckout"
import { useHostivPromoCode } from "../../composables/useHostivPromoCode"
import HostivPromoCodeField from "../HostivPromoCodeField.vue"
import HostivSignupPlanCard from "../hostiv/HostivSignupPlanCard.vue"

const props = withDefaults(
  defineProps<{
    open: boolean
    access: HostivSubscriptionAccess
    slug: string
    /** publish = modale au clic Publier ; access = accès backoffice bloqué (forfait expiré / absent) */
    variant?: "publish" | "access"
  }>(),
  {
    variant: "publish"
  }
)

const { ui, locale, formatDate } = useAdminUi()
const ext = computed(() => ui.value.extended)

const isAccessGate = computed(() => props.variant === "access")

const emit = defineEmits<{
  close: []
}>()

const pricingPlans = computed(() => getHostivLanding(locale.value).pricing.plans)
const selectedPlanId = ref<HostivPricingPlanId>(props.access.plan)
const paying = ref(false)
const error = ref("")
const userEmail = ref("")

const promo = useHostivPromoCode({
  context: "hostiv_subscription",
  email: userEmail,
  subscriptionPlan: selectedPlanId
})

const selectedPlan = computed(
  () => pricingPlans.value.find((item) => item.id === selectedPlanId.value) ?? pricingPlans.value[1]
)

const expiredNotice = computed(() => {
  if (!props.access.paid_until) {
    return ""
  }

  return adminUiFormat(ext.value.publishPaywall.expiredNotice, {
    date: formatDate(props.access.paid_until, { dateStyle: "medium" })
  })
})

watch(
  () => props.access.plan,
  (plan) => {
    selectedPlanId.value = plan
  }
)

watch(
  () => props.open,
  (isOpen) => {
    if (import.meta.server) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""

    if (isOpen) {
      selectedPlanId.value = props.access.plan
      error.value = ""
      promo.resetPromoState()
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
  if (isAccessGate.value) {
    return
  }

  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

function selectPlan(planId: HostivPricingPlanId) {
  if (planId === selectedPlanId.value || paying.value) {
    return
  }

  selectedPlanId.value = planId
  error.value = ""
  promo.clearPromo()
}

const payPriceLabel = computed(() => {
  if (promo.finalAmountEur != null) {
    return String(promo.finalAmountEur)
  }

  return String(selectedPlan.value.price)
})

async function onPay() {
  paying.value = true
  error.value = ""

  try {
    const headers = await authHeaders()
    const token = headers.Authorization?.replace(/^Bearer\s+/i, "")

    if (!token) {
      throw new Error(ext.value.publishPaywall.loginRequired)
    }

    await startHostivSubscriptionCheckout(
      token,
      selectedPlanId.value,
      props.slug,
      promo.promoCodeForCheckout || undefined
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.publishPaywall.paymentOpenFailed
    paying.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-login-modal-fade">
      <div
        v-if="open"
        class="admin-login-modal admin-publish-paywall"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
      >
        <div
          class="admin-login-modal__panel admin-publish-paywall__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-publish-paywall-title"
          @click.stop
        >
          <button
            v-if="!isAccessGate"
            type="button"
            class="admin-publish-paywall__close"
            :aria-label="ui.common.close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

          <p class="admin-publish-paywall__kicker">
            {{ isAccessGate ? ext.publishPaywall.kickerAccess : ext.publishPaywall.kickerPublish }}
          </p>
          <h2 id="admin-publish-paywall-title" class="admin-publish-paywall__title">
            {{
              isAccessGate ? ext.publishPaywall.titleAccess : ext.publishPaywall.titlePublish
            }}
          </h2>
          <p class="admin-publish-paywall__lead">
            {{ isAccessGate ? ext.publishPaywall.leadAccess : ext.publishPaywall.leadPublish }}
          </p>

          <fieldset class="admin-publish-paywall__plans">
            <legend class="admin-publish-paywall__plans-legend">
              {{ ext.publishPaywall.plansLegend }}
            </legend>
            <div
              class="admin-publish-paywall__plans-grid admin-publish-paywall__plans-grid--detailed"
              role="radiogroup"
              :aria-label="ext.publishPaywall.plansAriaLabel"
            >
              <div
                v-for="plan in pricingPlans"
                :key="plan.id"
                class="admin-publish-paywall__plan-wrap"
              >
                <HostivSignupPlanCard
                  :plan-id="plan.id"
                  :selected="selectedPlanId === plan.id"
                  :disabled="paying"
                  @select="selectPlan(plan.id as HostivPricingPlanId)"
                />
              </div>
            </div>
          </fieldset>

          <p v-if="expiredNotice" class="admin-publish-paywall__expired">
            {{ expiredNotice }}
          </p>

          <AdminAlert v-if="error" variant="error" :message="error" />

          <HostivPromoCodeField
            context="hostiv_subscription"
            :email="userEmail"
            :subscription-plan="selectedPlanId"
            :code="promo.code"
            :applied-code="promo.applied?.code ?? null"
            :validating="promo.validating"
            :error="promo.error"
            @update:code="promo.code = $event"
            @apply="promo.applyPromoCode()"
            @clear="promo.clearPromo()"
          />

          <div class="admin-publish-paywall__actions">
            <button v-if="!isAccessGate" type="button" class="admin-btn admin-btn--ghost" @click="emit('close')">
              {{ ext.publishPaywall.continueDraft }}
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--primary"
              :disabled="paying"
              @click="onPay"
            >
              {{
                paying
                  ? ext.publishPaywall.paying
                  : adminUiFormat(ext.publishPaywall.payCta, {
                        price: payPriceLabel
                      })
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
