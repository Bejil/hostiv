<script setup lang="ts">
import { Loader2, X } from "@lucide/vue"
import { hostivPricing, type HostivPricingPlanId } from "../../data/hostivLanding"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import type { HostivSubscriptionPlan } from "../../utils/hostiv-subscription-plan"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  open: boolean
  access: HostivSubscriptionAccess
  slug: string
}>()

const emit = defineEmits<{
  close: []
  "plan-updated": [plan: HostivSubscriptionPlan]
}>()

const pricingPlans = hostivPricing.plans
const selectedPlanId = ref<HostivPricingPlanId>(props.access.plan)
const planSaving = ref(false)
const paying = ref(false)
const error = ref("")

const selectedPlan = computed(
  () => pricingPlans.find((item) => item.id === selectedPlanId.value) ?? pricingPlans[1]
)

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

    error.value = e.data?.message || e.message || "Impossible de changer de forfait."
  } finally {
    planSaving.value = false
  }
}

async function onPay() {
  error.value =
    "Le paiement en ligne sera disponible très prochainement. Contactez-nous à contact@hostiv.fr pour activer votre forfait."
  paying.value = false
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
          <button type="button" class="admin-publish-paywall__close" aria-label="Fermer" @click="emit('close')">
            <X :size="18" />
          </button>

          <p class="admin-publish-paywall__kicker">Publication</p>
          <h2 id="admin-publish-paywall-title" class="admin-publish-paywall__title">
            Activez votre forfait pour publier
          </h2>
          <p class="admin-publish-paywall__lead">
            Personnalisez votre site librement en brouillon. Choisissez le forfait à régler pour publier
            (12 mois, sans reconduction automatique).
          </p>

          <fieldset class="admin-publish-paywall__plans">
            <legend class="admin-publish-paywall__plans-legend">Choisir un forfait</legend>
            <div class="admin-publish-paywall__plans-grid" role="radiogroup" aria-label="Forfait Hostiv">
              <button
                v-for="plan in pricingPlans"
                :key="plan.id"
                type="button"
                role="radio"
                class="admin-publish-paywall__plan-card"
                :class="{
                  'admin-publish-paywall__plan-card--active': selectedPlanId === plan.id,
                  'admin-publish-paywall__plan-card--pro': plan.id === 'pro'
                }"
                :aria-checked="selectedPlanId === plan.id"
                :disabled="planSaving"
                @click="selectPlan(plan.id as HostivPricingPlanId)"
              >
                <span v-if="plan.recommended" class="admin-publish-paywall__plan-badge">
                  {{ plan.badge }}
                </span>
                <span class="admin-publish-paywall__plan-card-name">{{ plan.name }}</span>
                <span class="admin-publish-paywall__plan-card-price">
                  {{ plan.price }}€<span>/ {{ plan.period }}</span>
                </span>
                <Loader2
                  v-if="planSaving && selectedPlanId === plan.id"
                  :size="14"
                  class="admin-publish-paywall__plan-spinner"
                  aria-hidden="true"
                />
              </button>
            </div>
          </fieldset>

          <div class="admin-publish-paywall__summary">
            <p class="admin-publish-paywall__summary-label">Forfait sélectionné</p>
            <p class="admin-publish-paywall__summary-title">{{ selectedPlan.name }}</p>
            <p class="admin-publish-paywall__summary-note">{{ selectedPlan.tagline }}</p>
          </div>

          <p v-if="access.paid_until" class="admin-publish-paywall__expired">
            Votre précédente période a expiré le
            {{ new Date(access.paid_until).toLocaleDateString("fr-FR") }} — le site a été remis en brouillon.
          </p>

          <AdminAlert v-if="error" variant="info" :message="error" />

          <div class="admin-publish-paywall__actions">
            <button type="button" class="admin-btn admin-btn--ghost" @click="emit('close')">
              Continuer en brouillon
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--primary"
              :disabled="paying || planSaving"
              @click="onPay"
            >
              {{
                paying
                  ? "Redirection…"
                  : planSaving
                    ? "Mise à jour…"
                    : `Payer ${selectedPlan.price}€ / an`
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
