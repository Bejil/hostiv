<script setup lang="ts">
import HostivPricingSection from "./HostivPricingSection.vue"
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CalendarSync,
  Check,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Link2,
  Sparkles
} from "@lucide/vue"
const { landing } = useHostivLocale()
const { openSignup } = useHostivAccountModal()

const hostivCommissionCompare = computed(() => landing.value.commissionCompare)
const hostivCta = computed(() => landing.value.cta)
const hostivFeatures = computed(() => landing.value.features)
const hostivShowcaseExamples = computed(() => landing.value.showcaseExamples)
const hostivSteps = computed(() => landing.value.steps)
const landingSections = computed(() => landing.value.landingSections)
const { publicAsset } = usePublicAsset()
const ctaIllustrationSrc = publicAsset("/hostiv/cta-welcome.png")

const {
  rootRef: commissionCompareRef,
  revealed: commissionRevealed,
  displayPercent: commissionPlatformPercent
} = useHostivCommissionReveal(hostivCommissionCompare.value.platform.meterPercent)

const featureIcons = {
  Globe,
  CalendarSync,
  BadgePercent
} as const

const stepIcons = {
  LayoutTemplate,
  Link2,
  Sparkles
} as const

type FeatureIconKey = keyof typeof featureIcons
type StepIconKey = keyof typeof stepIcons
</script>

<template>
  <section id="fonctionnalites" class="hostiv-section hostiv-section--green">
    <div class="hostiv-container">
      <header
        class="hostiv-section__head hostiv-section__head--center"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ landingSections.features.eyebrow }}</p>
        <h2 class="hostiv-h2">
          {{ landingSections.features.title }}<br />{{ landingSections.features.titleLine2 }}
        </h2>
        <p class="hostiv-section__intro">
          {{ landingSections.features.intro }}
        </p>
      </header>

      <div class="hostiv-features">
        <article
          v-for="(feature, index) in hostivFeatures"
          :key="feature.title"
          v-scroll-reveal="{ delay: 60 + index * 75, rootMargin: '0px 0px -6% 0px' }"
          class="hostiv-feature-card"
          :class="`hostiv-feature-card--${index + 1}`"
        >
          <span class="hostiv-feature-card__accent" aria-hidden="true" />
          <div class="hostiv-feature-card__top">
            <span class="hostiv-feature-card__icon" aria-hidden="true">
              <component
                :is="featureIcons[feature.icon as FeatureIconKey]"
                :size="24"
                stroke-width="1.65"
              />
            </span>
            <span class="hostiv-feature-card__tag">{{ feature.tag }}</span>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <span class="hostiv-feature-card__num" aria-hidden="true">{{ String(index + 1).padStart(2, "0") }}</span>
        </article>
      </div>
    </div>
  </section>

  <section
    id="revenus"
    class="hostiv-section hostiv-section--light hostiv-section--revenue"
    aria-labelledby="hostiv-revenue-title"
  >
    <div class="hostiv-container">
      <div class="hostiv-section__glow" aria-hidden="true" />
      <div
        ref="commissionCompareRef"
        class="hostiv-commission-compare"
        :class="{ 'hostiv-commission-compare--animated': commissionRevealed }"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
          <header class="hostiv-commission-compare__head">
            <p class="hostiv-commission-compare__eyebrow">{{ hostivCommissionCompare.eyebrow }}</p>
            <h2 id="hostiv-revenue-title" class="hostiv-commission-compare__title">
              {{ hostivCommissionCompare.title }}
            </h2>
            <p class="hostiv-commission-compare__intro">{{ hostivCommissionCompare.intro }}</p>
          </header>

          <div class="hostiv-commission-compare__stage">
            <article class="hostiv-commission-card hostiv-commission-card--platform">
              <div class="hostiv-commission-card__icon" aria-hidden="true">
                <Building2 :size="22" stroke-width="1.75" />
              </div>
              <div class="hostiv-commission-card__copy">
                <span class="hostiv-commission-card__label">{{ hostivCommissionCompare.platform.label }}</span>
                <span class="hostiv-commission-card__examples">{{ hostivCommissionCompare.platform.examples }}</span>
                <p class="hostiv-commission-card__fee">
                  {{ landingSections.commission.feePrefix }}<span class="hostiv-commission-card__fee-number">{{ commissionPlatformPercent }}</span>
                  %
                </p>
                <div class="hostiv-commission-card__meter-wrap">
                  <div class="hostiv-commission-card__meter-labels">
                    <span>{{ hostivCommissionCompare.platform.meterLabel }}</span>
                    <span class="hostiv-commission-card__meter-value">
                      ~<span class="hostiv-commission-card__fee-number">{{ commissionPlatformPercent }}</span> %
                    </span>
                  </div>
                  <div
                    class="hostiv-commission-card__meter hostiv-commission-card__meter--platform"
                    role="presentation"
                  >
                    <span
                      class="hostiv-commission-card__meter-fill"
                      :style="{
                        '--meter-target': `${hostivCommissionCompare.platform.meterPercent}%`
                      }"
                    />
                  </div>
                </div>
                <p class="hostiv-commission-card__detail">{{ hostivCommissionCompare.platform.detail }}</p>
              </div>
            </article>

            <div class="hostiv-commission-compare__divider" aria-hidden="true">
              <span class="hostiv-commission-compare__vs">vs</span>
            </div>

            <article class="hostiv-commission-card hostiv-commission-card--hostiv">
              <span class="hostiv-commission-card__ribbon">{{ landingSections.commission.recommendedLabel }}</span>
              <div class="hostiv-commission-card__icon" aria-hidden="true">
                <BadgePercent :size="22" stroke-width="1.75" />
              </div>
              <div class="hostiv-commission-card__copy">
                <span class="hostiv-commission-card__label">{{ hostivCommissionCompare.hostiv.label }}</span>
                <p class="hostiv-commission-card__fee hostiv-commission-card__fee--hostiv">
                  <span class="hostiv-commission-card__fee-value">{{ hostivCommissionCompare.hostiv.fee }}</span>
                  <span class="hostiv-commission-card__fee-suffix">{{ hostivCommissionCompare.hostiv.feeSuffix }}</span>
                </p>
                <div class="hostiv-commission-card__meter-wrap">
                  <div class="hostiv-commission-card__meter-labels">
                    <span>{{ hostivCommissionCompare.hostiv.meterLabel }}</span>
                    <span class="hostiv-commission-card__meter-badge">
                      <Check :size="12" stroke-width="2.5" />
                      {{ hostivCommissionCompare.hostiv.meterPercent }} %
                    </span>
                  </div>
                  <div
                    class="hostiv-commission-card__meter hostiv-commission-card__meter--hostiv"
                    role="presentation"
                  >
                    <span
                      class="hostiv-commission-card__meter-fill"
                      :style="{
                        '--meter-target': `${Math.max(hostivCommissionCompare.hostiv.meterPercent, 4)}%`
                      }"
                    />
                  </div>
                </div>
                <p class="hostiv-commission-card__detail">{{ hostivCommissionCompare.hostiv.detail }}</p>
              </div>
            </article>
          </div>

          <p class="hostiv-commission-compare__footnote">{{ hostivCommissionCompare.footnote }}</p>
      </div>
    </div>
  </section>

  <section
    id="exemples"
    class="hostiv-section hostiv-section--green hostiv-section--showcase"
    aria-labelledby="hostiv-showcase-title"
  >
    <div class="hostiv-container">
      <div
        class="hostiv-showcase"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
        <header class="hostiv-showcase__head hostiv-section__head--center">
          <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ hostivShowcaseExamples.eyebrow }}</p>
          <h2 id="hostiv-showcase-title" class="hostiv-h2 hostiv-showcase__title">
            {{ hostivShowcaseExamples.title }}
          </h2>
          <p class="hostiv-section__intro hostiv-showcase__intro">{{ hostivShowcaseExamples.intro }}</p>
        </header>

        <div class="hostiv-showcase__grid">
          <figure
            v-for="(example, index) in hostivShowcaseExamples.items"
            :key="example.id"
            class="hostiv-showcase__item"
            v-scroll-reveal="{ delay: 80 + index * 80, rootMargin: '0px 0px -6% 0px' }"
          >
            <div class="hostiv-showcase__frame">
              <img
                v-if="example.imageSrc"
                :src="example.imageSrc"
                :alt="`${landingSections.showcase.imageAltPrefix} ${example.title}`"
                class="hostiv-showcase__img"
                :width="example.imageWidth"
                :height="example.imageHeight"
                loading="lazy"
                decoding="async"
              />
              <div v-else class="hostiv-showcase__placeholder" aria-hidden="true">
                <ImageIcon :size="28" stroke-width="1.5" />
                <span>{{ landingSections.showcase.placeholder }}</span>
              </div>
            </div>
            <figcaption class="hostiv-showcase__caption">
              <strong>{{ example.title }}</strong>
              <span>{{ example.caption }}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>

  <section id="comment" class="hostiv-section hostiv-section--light hostiv-section--steps">
    <div class="hostiv-container">
      <header
        class="hostiv-section__head hostiv-section__head--center"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ landingSections.steps.eyebrow }}</p>
        <h2 class="hostiv-h2">{{ landingSections.steps.title }}</h2>
        <p class="hostiv-section__intro">
          {{ landingSections.steps.intro }}
        </p>
      </header>

      <div class="hostiv-steps">
        <span class="hostiv-steps__track" aria-hidden="true" />

        <ol class="hostiv-steps__list">
          <li
            v-for="(step, index) in hostivSteps"
            :key="step.step"
            v-scroll-reveal="{ delay: 80 + index * 90, rootMargin: '0px 0px -6% 0px' }"
            class="hostiv-step-card"
          >
            <span v-if="index < hostivSteps.length - 1" class="hostiv-step-card__arrow" aria-hidden="true">
              <ArrowRight :size="18" stroke-width="2" />
            </span>

            <div class="hostiv-step-card__head">
              <span class="hostiv-step-card__index">{{ step.step }}</span>
              <span class="hostiv-step-card__icon" aria-hidden="true">
                <component :is="stepIcons[step.icon as StepIconKey]" :size="20" stroke-width="1.75" />
              </span>
            </div>

            <div class="hostiv-step-card__body">
              <div class="hostiv-step-card__title-row">
                <h3>{{ step.title }}</h3>
                <span class="hostiv-step-card__hint">{{ step.hint }}</span>
              </div>
              <p class="hostiv-step-card__lead">{{ step.description }}</p>
              <ul class="hostiv-step-card__details">
                <li v-for="detail in step.details" :key="detail">{{ detail }}</li>
              </ul>
              <p class="hostiv-step-card__outcome">
                <Sparkles :size="14" stroke-width="2" aria-hidden="true" />
                {{ step.outcome }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>

  <HostivPricingSection />

  <HostivFaqSection />

  <section id="cta" class="hostiv-section hostiv-section--green hostiv-section--cta">
    <div class="hostiv-container hostiv-cta" v-scroll-reveal="{ rootMargin: '0px 0px -8% 0px' }">
      <div class="hostiv-cta__grid">
        <div class="hostiv-cta__copy">
          <h2 class="hostiv-h2 hostiv-cta__title">{{ hostivCta.title }}</h2>
          <p class="hostiv-section__intro hostiv-cta__lead">{{ hostivCta.lead }}</p>
          <ul class="hostiv-cta__highlights">
            <li v-for="point in hostivCta.highlights" :key="point">{{ point }}</li>
          </ul>
          <button type="button" class="hostiv-btn hostiv-btn--accent" @click="openSignup">
            {{ hostivCta.button }}
            <ArrowRight :size="18" />
          </button>
        </div>

        <figure class="hostiv-cta__visual" aria-hidden="true">
          <img
            :src="ctaIllustrationSrc"
            alt=""
            class="hostiv-cta__img"
            width="943"
            height="796"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </div>
  </section>

  <HostivFooter />
</template>
