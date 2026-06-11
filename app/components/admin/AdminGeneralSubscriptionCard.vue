<script setup lang="ts">
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import { formatHostivSubscriptionDate } from "../../utils/hostiv-subscription-access"
import { getHostivLanding } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"

const props = defineProps<{
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

  if (props.access.plan === "starter" && props.access.active && !props.access.has_starter_plus) {
    return adminUiFormat(ext.value.subscription.footerStarterPlusUpsell, {
      price: String(starterPlusAddon.value.price),
      period: starterPlusAddon.value.period
    })
  }

  if (props.access.has_starter_plus) {
    return ext.value.subscription.footerStarterPlusActive
  }

  return null
})
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
