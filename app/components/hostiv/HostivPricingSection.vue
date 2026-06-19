<script setup lang="ts">
import { ArrowRight, Check, Sparkles, Star } from "@lucide/vue"

defineProps<{
  /** Page dédiée /tarifs (h1 + espacement header). */
  asPage?: boolean
}>()

const { landing } = useHostivLocale()
const { openSignup } = useHostivAccountModal()

const hostivPricing = computed(() => landing.value.pricing)
const starterPlan = computed(() => hostivPricing.value.plans[0])
const proPlan = computed(() => hostivPricing.value.plans[1])
const premiumAddon = computed(() => hostivPricing.value.premiumAddon)

function openSignupWithPlan(planId: "starter" | "pro") {
  openSignup(planId)
}
</script>

<template>
  <section
    id="tarifs"
    class="hostiv-section hostiv-section--green hostiv-section--pricing"
    :class="{ 'hostiv-section--pricing-page': asPage }"
    aria-labelledby="hostiv-pricing-title"
  >
    <div class="hostiv-container">
      <header
        class="hostiv-section__head hostiv-section__head--center"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ hostivPricing.eyebrow }}</p>
        <component
          :is="asPage ? 'h1' : 'h2'"
          id="hostiv-pricing-title"
          class="hostiv-h2"
        >
          {{ hostivPricing.title }}
        </component>
        <p class="hostiv-section__intro">{{ hostivPricing.intro }}</p>
      </header>

      <div class="hostiv-pricing__stage" v-scroll-reveal="{ delay: 40, rootMargin: '0px 0px -6% 0px' }">
        <div class="hostiv-pricing__main">
          <article
            v-scroll-reveal="{ delay: 60, rootMargin: '0px 0px -6% 0px' }"
            class="hostiv-pricing-card hostiv-pricing-card--starter"
          >
            <div class="hostiv-pricing-card__head">
              <span class="hostiv-pricing-card__tier hostiv-pricing-card__tier--green">
                <span class="hostiv-pricing-card__dot" aria-hidden="true" />
                {{ starterPlan.name }}
              </span>
              <p class="hostiv-pricing-card__price">
                <span class="hostiv-pricing-card__amount">{{ starterPlan.price }}€</span>
                <span class="hostiv-pricing-card__period">/ {{ starterPlan.period }}</span>
              </p>
            </div>

            <p class="hostiv-pricing-card__tagline">{{ starterPlan.tagline }}</p>

            <ul class="hostiv-pricing-card__features">
              <li v-for="feature in starterPlan.features" :key="feature">
                <Check :size="16" stroke-width="2.5" aria-hidden="true" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <p class="hostiv-pricing-card__positioning">{{ starterPlan.positioning }}</p>

            <button
              type="button"
              class="hostiv-btn hostiv-btn--secondary hostiv-pricing-card__cta"
              @click="openSignupWithPlan('starter')"
            >
              {{ starterPlan.cta }}
              <ArrowRight :size="18" />
            </button>
          </article>

          <article
            v-scroll-reveal="{ delay: 120, rootMargin: '0px 0px -6% 0px' }"
            class="hostiv-pricing-card hostiv-pricing-card--pro"
          >
            <span class="hostiv-pricing-card__ribbon">{{ proPlan.ribbon }}</span>
            <span class="hostiv-pricing-card__badge">{{ proPlan.badge }}</span>

            <div class="hostiv-pricing-card__head">
              <span class="hostiv-pricing-card__tier hostiv-pricing-card__tier--pro">
                <span class="hostiv-pricing-card__dot" aria-hidden="true" />
                {{ proPlan.name }}
                <Star class="hostiv-pricing-card__star" :size="14" stroke-width="2" aria-hidden="true" />
              </span>
              <p class="hostiv-pricing-card__price">
                <span class="hostiv-pricing-card__amount">{{ proPlan.price }}€</span>
                <span class="hostiv-pricing-card__period">/ {{ proPlan.period }}</span>
              </p>
            </div>

            <p class="hostiv-pricing-card__tagline">{{ proPlan.tagline }}</p>

            <ul class="hostiv-pricing-card__features">
              <li v-for="feature in starterPlan.features" :key="`pro-${feature}`">
                <Check :size="16" stroke-width="2.5" aria-hidden="true" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <p class="hostiv-pricing-card__includes">{{ proPlan.includesLabel }}</p>

            <ul class="hostiv-pricing-card__features hostiv-pricing-card__features--extra">
              <li v-for="feature in proPlan.extraFeatures" :key="feature">
                <Check :size="16" stroke-width="2.5" aria-hidden="true" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <p class="hostiv-pricing-card__positioning">{{ proPlan.positioning }}</p>

            <button
              type="button"
              class="hostiv-btn hostiv-btn--accent hostiv-pricing-card__cta"
              @click="openSignupWithPlan('pro')"
            >
              {{ proPlan.cta }}
              <ArrowRight :size="18" />
            </button>
          </article>
        </div>

        <aside
          v-scroll-reveal="{ delay: 160, rootMargin: '0px 0px -6% 0px' }"
          class="hostiv-pricing-addon"
          :aria-label="premiumAddon.ariaLabel"
        >
          <div class="hostiv-pricing-addon__main">
            <div class="hostiv-pricing-addon__head">
              <span class="hostiv-pricing-addon__tier">
                <span class="hostiv-pricing-addon__dot" aria-hidden="true" />
                {{ premiumAddon.name }}
              </span>
              <span class="hostiv-pricing-addon__label">{{ premiumAddon.label }}</span>
            </div>

            <p class="hostiv-pricing-addon__price">
              <span class="hostiv-pricing-addon__amount">
                {{ premiumAddon.pricePrefix }}{{ premiumAddon.price }}€
              </span>
              <span class="hostiv-pricing-addon__period">/ {{ premiumAddon.period }}</span>
            </p>

            <p class="hostiv-pricing-addon__tagline">{{ premiumAddon.tagline }}</p>

            <ul class="hostiv-pricing-addon__features">
              <li v-for="feature in premiumAddon.features" :key="feature">
                <span class="hostiv-pricing-addon__check" aria-hidden="true">
                  <Check :size="11" stroke-width="2.75" />
                </span>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div class="hostiv-pricing-addon__aside">
            <p class="hostiv-pricing-addon__note">{{ premiumAddon.note }}</p>
            <p class="hostiv-pricing-addon__nudge">
              <Sparkles :size="14" stroke-width="2" aria-hidden="true" />
              {{ premiumAddon.proNudge }}
            </p>
            <button
              type="button"
              class="hostiv-btn hostiv-btn--accent hostiv-pricing-addon__cta"
              @click="openSignupWithPlan('pro')"
            >
              {{ premiumAddon.chooseProCta }}
              <ArrowRight :size="16" />
            </button>
          </div>
        </aside>
      </div>

      <ul
        class="hostiv-pricing__trust"
        v-scroll-reveal="{ delay: 200, rootMargin: '0px 0px -6% 0px' }"
      >
        <li v-for="item in hostivPricing.trust" :key="item">{{ item }}</li>
      </ul>
    </div>
  </section>
</template>
