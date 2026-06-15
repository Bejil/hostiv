<script setup lang="ts">
import { Check, Sparkles } from "@lucide/vue"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import { formatHostivSubscriptionDate } from "../../utils/hostiv-subscription-access"
import { getHostivLanding } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import { startHostivPremiumToolsCheckout } from "../../composables/useHostivSubscriptionCheckout"
import AdminAlert from "./AdminAlert.vue"

const props = defineProps<{
  slug: string
  access: HostivSubscriptionAccess
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const landingPricing = computed(() => getHostivLanding(locale.value).pricing)
const plan = computed(
  () =>
    landingPricing.value.plans.find((item) => item.id === props.access.plan) ??
    landingPricing.value.plans[1]
)
const starterPlusAddon = computed(() => landingPricing.value.premiumAddon)

const showStarterPlusInsight = computed(
  () =>
    props.access.plan === "starter" &&
    props.access.active &&
    !props.access.has_starter_plus
)

const starterPlusInsightCta = computed(() =>
  adminUiFormat(ext.value.subscription.starterPlusInsightCta, {
    price: String(starterPlusAddon.value.price),
    period: starterPlusAddon.value.period
  })
)

const planTitle = computed(() => {
  if (props.access.has_starter_plus) {
    return `${plan.value.name} + ${starterPlusAddon.value.name}`
  }

  return plan.value.name
})

const statusLabel = computed(() => {
  if (!props.access.active) {
    if (props.access.paid_until) {
      return ext.value.subscription.statusExpired
    }

    return ext.value.subscription.statusInactive
  }

  if (props.access.has_starter_plus) {
    return ext.value.subscription.statusStarterPlusActive
  }

  return ext.value.subscription.statusActive
})

const statusClass = computed(() => {
  if (!props.access.active) {
    if (props.access.paid_until) {
      return "admin-general-status--warn"
    }

    return "admin-general-status--off"
  }

  return "admin-general-status--on"
})

function formatSubscriptionPeriod(
  start: string | null | undefined,
  end: string | null | undefined
) {
  const startLabel = formatHostivSubscriptionDate(start)
  const endLabel = formatHostivSubscriptionDate(end)

  if (startLabel === "—" && endLabel === "—") {
    return "—"
  }

  if (startLabel === "—") {
    return adminUiFormat(ext.value.subscription.periodUntil, { date: endLabel })
  }

  if (endLabel === "—") {
    return adminUiFormat(ext.value.subscription.periodSince, { date: startLabel })
  }

  return adminUiFormat(ext.value.subscription.periodRange, {
    start: startLabel,
    end: endLabel
  })
}

const footerNote = computed(() => {
  if (props.access.requires_payment && props.access.paid_until) {
    return ext.value.subscription.footerExpired
  }

  if (props.access.requires_payment) {
    return ext.value.subscription.footerNoPlan
  }

  if (showStarterPlusInsight.value) {
    return null
  }

  if (props.access.has_starter_plus) {
    return ext.value.subscription.footerStarterPlusActive
  }

  return null
})

const starterPlusPaying = ref(false)
const starterPlusError = ref("")

async function onActivateStarterPlus() {
  starterPlusPaying.value = true
  starterPlusError.value = ""

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

    starterPlusError.value =
      e.data?.message || e.message || ui.value.proUpgrade.paymentOpenFailed
    starterPlusPaying.value = false
  }
}
</script>

<template>
  <div
    class="admin-subpanel admin-general-card admin-general-card--subscription"
    :class="{ 'admin-general-card--subscription--inactive': !access.active }"
  >
    <div class="admin-general-subscription__top">
      <div class="admin-general-subscription__identity">
        <p class="admin-general-card__kicker">{{ ext.subscription.kicker }}</p>
        <p class="admin-general-subscription__plan-name">{{ planTitle }}</p>
        <p class="admin-general-subscription__plan-price">
          <span class="admin-general-subscription__price-main">
            {{ plan.price }}€<span>/ {{ plan.period }}</span>
          </span>
          <span
            v-if="access.has_starter_plus"
            class="admin-general-subscription__price-addon"
          >
            + {{ starterPlusAddon.price }}€ / {{ starterPlusAddon.period }}
          </span>
        </p>
      </div>

      <span class="admin-general-status admin-general-subscription__status" :class="statusClass">
        {{ statusLabel }}
      </span>
    </div>

    <div class="admin-general-subscription__periods">
      <article class="admin-general-subscription__period">
        <h4 class="admin-general-subscription__period-label">{{ plan.name }}</h4>
        <p class="admin-general-subscription__period-range">
          {{ formatSubscriptionPeriod(access.subscription_started_at, access.paid_until) }}
        </p>
      </article>

      <article
        v-if="access.has_starter_plus"
        class="admin-general-subscription__period admin-general-subscription__period--addon"
      >
        <h4 class="admin-general-subscription__period-label">
          {{ ext.subscription.starterPlusPeriodLabel }}
        </h4>
        <p class="admin-general-subscription__period-range">
          {{
            formatSubscriptionPeriod(
              access.premium_tools_started_at,
              access.premium_tools_until
            )
          }}
        </p>
      </article>
    </div>

    <article v-if="showStarterPlusInsight" class="admin-general-subscription__insight">
      <div class="admin-general-subscription__insight-head">
        <span class="admin-general-subscription__insight-icon" aria-hidden="true">
          <Sparkles :size="16" stroke-width="2" />
        </span>
        <div>
          <p class="admin-general-subscription__insight-kicker">
            {{ ext.subscription.starterPlusInsightKicker }}
          </p>
          <h4 class="admin-general-subscription__insight-title">
            {{ ext.subscription.starterPlusInsightTitle }}
          </h4>
        </div>
      </div>

      <p class="admin-general-subscription__insight-lead">{{ starterPlusAddon.tagline }}</p>

      <ul class="admin-general-subscription__insight-list">
        <li v-for="feature in starterPlusAddon.features" :key="feature">
          <Check :size="14" stroke-width="2.5" aria-hidden="true" />
          <span>{{ feature }}</span>
        </li>
      </ul>

      <AdminAlert v-if="starterPlusError" variant="error" :message="starterPlusError" />

      <button
        type="button"
        class="admin-btn admin-btn--primary admin-general-subscription__insight-cta"
        :disabled="starterPlusPaying"
        @click="onActivateStarterPlus"
      >
        {{ starterPlusPaying ? ui.proUpgrade.redirecting : starterPlusInsightCta }}
      </button>
    </article>

    <footer class="admin-general-subscription__footer">
      <p class="admin-general-subscription__renewal">
        {{ ext.subscription.renewalNote }}
      </p>
      <p
        v-if="footerNote"
        class="admin-general-subscription__note"
        :class="{ 'admin-general-subscription__note--alert': access.requires_payment }"
      >
        {{ footerNote }}
      </p>
    </footer>
  </div>
</template>
