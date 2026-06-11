<script setup lang="ts">
import { ArrowRight, MapPin, Sparkles } from "@lucide/vue"

const config = useRuntimeConfig()
const { publicAsset } = usePublicAsset()
const { landing } = useHostivLocale()
const heroIllustrationSrc = publicAsset("/hostiv/hero-illustration.svg")

const { openSignup } = useHostivAccountModal()

const demoPath = computed(() => {
  const slug = String(config.public.demoPropertySlug || "thegrandappartement").replace(
    /^\/+|\/+$/g,
    ""
  )

  return `/${slug}`
})

const hero = computed(() => landing.value.heroContent)
const proofPoints = computed(() => landing.value.heroProofPoints)
</script>

<template>
  <section class="hostiv-hero" aria-labelledby="hostiv-hero-title">
    <div class="hostiv-hero__bg" aria-hidden="true">
      <span class="hostiv-hero__orb hostiv-hero__orb--mint" />
      <span class="hostiv-hero__orb hostiv-hero__orb--violet" />
      <span class="hostiv-hero__orb hostiv-hero__orb--sand" />
    </div>

    <div class="hostiv-container hostiv-hero__grid">
      <div class="hostiv-hero__copy" v-scroll-reveal="{ threshold: 0.05, delay: 0 }">
        <p class="hostiv-pill">
          <Sparkles :size="14" />
          {{ hero.pill }}
        </p>
        <h1 id="hostiv-hero-title" class="hostiv-h1">
          {{ hero.title }}
          <span class="hostiv-h1__accent">{{ hero.titleAccent }}</span>
        </h1>
        <p class="hostiv-lead">
          {{ hero.lead }}
        </p>
        <ul class="hostiv-hero__proof" :aria-label="hero.proofAriaLabel">
          <li v-for="point in proofPoints" :key="point">{{ point }}</li>
        </ul>
        <div class="hostiv-hero__cta">
          <button type="button" class="hostiv-btn hostiv-btn--primary" @click="openSignup">
            {{ hero.ctaPrimary }}
            <ArrowRight :size="18" />
          </button>
          <NuxtLink :to="demoPath" class="hostiv-btn hostiv-btn--secondary">{{ hero.ctaSecondary }}</NuxtLink>
        </div>
      </div>

      <div class="hostiv-hero__visual" v-scroll-reveal="{ threshold: 0.05, delay: 140 }">
        <figure class="hostiv-hero-illustration">
          <span class="hostiv-hero-illustration__glow" aria-hidden="true" />
          <img
            :src="heroIllustrationSrc"
            :alt="hero.illustrationAlt"
            class="hostiv-hero-illustration__img"
            width="800"
            height="610"
            loading="eager"
            fetchpriority="high"
          />
          <figcaption class="hostiv-hero-illustration__caption">
            <MapPin :size="13" />
            {{ hero.illustrationCaption }}
          </figcaption>
        </figure>

        <div class="hostiv-dream-card hostiv-dream-card--invite" aria-hidden="true">
          <span class="hostiv-dream-card__eyebrow">{{ hero.dreamCardEyebrow }}</span>
          <p class="hostiv-dream-card__quote">
            {{ hero.dreamCardQuote }}<br />
            <em>{{ hero.dreamCardQuoteEm }}</em>
          </p>
          <span class="hostiv-dream-card__stars">★★★★★</span>
        </div>

        <div class="hostiv-dream-card hostiv-dream-card--stay" aria-hidden="true">
          <span class="hostiv-dream-card__moon-icon">☾</span>
          <div>
            <strong>{{ hero.stayCardTitle }}</strong>
            <span>{{ hero.stayCardMeta }}</span>
          </div>
          <span class="hostiv-dream-card__badge">{{ hero.stayCardBadge }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
