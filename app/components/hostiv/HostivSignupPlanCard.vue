<script setup lang="ts">
import { Check, Star } from "@lucide/vue"
import type { HostivPricingPlanId } from "../../data/hostivLanding"

const props = defineProps<{
  planId: HostivPricingPlanId
  selected: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const { landing } = useHostivLocale()

const plan = computed(
  () => landing.value.pricing.plans.find((entry) => entry.id === props.planId) ?? landing.value.pricing.plans[1]
)
const starterFeatures = computed(() => landing.value.pricing.plans[0].features)
</script>

<template>
  <button
    type="button"
    role="radio"
    class="hostiv-modal__plan-card"
    :class="{
      'hostiv-modal__plan-card--active': selected,
      'hostiv-modal__plan-card--pro': planId === 'pro'
    }"
    :aria-checked="selected"
    :disabled="disabled"
    @click="emit('select')"
  >
    <span v-if="plan.recommended" class="hostiv-modal__plan-card-badge">
      {{ plan.badge }}
    </span>

    <div class="hostiv-modal__plan-card-head">
      <span
        class="hostiv-modal__plan-card-tier"
        :class="
          planId === 'pro'
            ? 'hostiv-modal__plan-card-tier--pro'
            : 'hostiv-modal__plan-card-tier--starter'
        "
      >
        <span class="hostiv-modal__plan-card-dot" aria-hidden="true" />
        {{ plan.name }}
        <Star v-if="planId === 'pro'" :size="13" stroke-width="2" aria-hidden="true" />
      </span>
      <p class="hostiv-modal__plan-card-price">
        <span class="hostiv-modal__plan-card-amount">{{ plan.price }}€</span>
        <span class="hostiv-modal__plan-card-period">/ {{ plan.period }}</span>
      </p>
    </div>

    <p class="hostiv-modal__plan-card-tagline">{{ plan.tagline }}</p>

    <ul class="hostiv-modal__plan-card-features">
      <li v-for="feature in starterFeatures" :key="`${planId}-${feature}`">
        <Check :size="14" stroke-width="2.5" aria-hidden="true" />
        <span>{{ feature }}</span>
      </li>
    </ul>

    <template v-if="planId === 'pro' && 'includesLabel' in plan">
      <p class="hostiv-modal__plan-card-includes">{{ plan.includesLabel }}</p>
      <ul class="hostiv-modal__plan-card-features hostiv-modal__plan-card-features--extra">
        <li v-for="feature in plan.extraFeatures" :key="feature">
          <Check :size="14" stroke-width="2.5" aria-hidden="true" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </template>

    <p class="hostiv-modal__plan-card-positioning">{{ plan.positioning }}</p>
  </button>
</template>
