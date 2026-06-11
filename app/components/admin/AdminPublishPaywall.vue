<script setup lang="ts">
import { Loader2, X } from "@lucide/vue"
import { getHostivLanding, type HostivPricingPlanId } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import type { HostivSubscriptionPlan } from "../../utils/hostiv-subscription-plan"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import { startHostivSubscriptionCheckout } from "../../composables/useHostivSubscriptionCheckout"
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
  "plan-updated": [plan: HostivSubscriptionPlan]
}>()

const pricingPlans = computed(() => getHostivLanding(locale.value).pricing.plans)
const selectedPlanId = ref<HostivPricingPlanId>(props.access.plan)
const planSaving = ref(false)
const paying = ref(false)
const error = ref("")

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
    }
  }
)

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

async function selectPlan(planId: HostivPricingPlanId) {
  if (planId === selectedPlanId.value || planSaving.value) {
    return
  }

  const previous = selectedPlanId.value

  selectedPlanId.value = planId
  planSaving.value = true
  error.value = ""

  try {
    const response = await $fetch<{
      subscription_plan: HostivSubscriptionPlan
      subscription_access: HostivSubscriptionAccess
    }>(`/api/admin/${props.slug}/subscription-plan`, {
      method: "PUT",
      headers: await authHeaders(),
      body: { subscription_plan: planId }
    })

    selectedPlanId.value = response.subscription_plan
    emit("plan-updated", response.subscription_plan)
  } catch (err: unknown) {
    selectedPlanId.value = previous
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ext.value.publishPaywall.planChangeFailed
  } finally {
    planSaving.value = false
  }
}

async function onPay() {
  paying.value = true
  error.value = ""

  try {
    const headers = await authHeaders()
    const token = headers.Authorization?.replace(/^Bearer\s+/i, "")

    if (!token) {
      throw new Error(ext.value.publishPaywall.loginRequired)
    }

    await startHostivSubscriptionCheckout(token, selectedPlanId.value, props.slug)
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
                  :disabled="planSaving || paying"
                  @select="selectPlan(plan.id as HostivPricingPlanId)"
                />
                <Loader2
                  v-if="planSaving && selectedPlanId === plan.id"
                  :size="14"
                  class="admin-publish-paywall__plan-spinner"
                  aria-hidden="true"
                />
              </div>
            </div>
          </fieldset>

          <p v-if="expiredNotice" class="admin-publish-paywall__expired">
            {{ expiredNotice }}
          </p>

          <AdminAlert v-if="error" variant="error" :message="error" />

          <div class="admin-publish-paywall__actions">
            <button v-if="!isAccessGate" type="button" class="admin-btn admin-btn--ghost" @click="emit('close')">
              {{ ext.publishPaywall.continueDraft }}
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--primary"
              :disabled="paying || planSaving"
              @click="onPay"
            >
              {{
                paying
                  ? ext.publishPaywall.paying
                  : planSaving
                    ? ext.publishPaywall.planUpdating
                    : adminUiFormat(ext.publishPaywall.payCta, {
                        price: String(selectedPlan.price)
                      })
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
