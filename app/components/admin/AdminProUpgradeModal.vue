<script setup lang="ts">
import { Sparkles, X } from "@lucide/vue"
import { getAdminProFeatures, type AdminProFeatureId } from "../../data/admin-pro-features"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import AdminAlert from "./AdminAlert.vue"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import { startHostivPremiumToolsCheckout } from "../../composables/useHostivSubscriptionCheckout"

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
const error = ref("")

const { ui, locale } = useAdminUi()
const { landing } = useHostivLocale()

const premiumAddon = computed(() => landing.value.pricing.premiumAddon)

const feature = computed(() => {
  const id = props.featureId

  return id ? getAdminProFeatures(locale.value)[id] : null
})

const isVisible = computed(() => props.open && Boolean(feature.value))

const premiumPriceLabel = computed(
  () => `${premiumAddon.value.pricePrefix}${premiumAddon.value.price}€`
)

const starterPlusCtaLabel = computed(() => feature.value?.starterPlusCta ?? "")

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

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

async function onActivateStarterPlus() {
  paying.value = true
  error.value = ""

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error(ui.value.proUpgrade.loginRequired)
    }

    await startHostivPremiumToolsCheckout(token, props.slug)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    error.value = e.data?.message || e.message || ui.value.proUpgrade.paymentOpenFailed
    paying.value = false
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

            <AdminAlert v-if="error" variant="error" :message="error" />

            <div class="hostiv-modal__pro-upgrade-actions">
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="paying"
                @click="onActivateStarterPlus"
              >
                {{ paying ? ui.proUpgrade.redirecting : starterPlusCtaLabel }}
              </button>
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
