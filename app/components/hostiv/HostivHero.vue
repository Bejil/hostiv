<script setup lang="ts">
import { ArrowRight, MapPin, Sparkles } from "@lucide/vue"
import { hostivHeroProofPoints } from "../../data/hostivLanding"

const config = useRuntimeConfig()
const { publicAsset } = usePublicAsset()
const heroIllustrationSrc = publicAsset("/hostiv/hero-illustration.svg")

const { openSignup } = useHostivAccountModal()

const demoPath = computed(() => {
  const slug = String(config.public.demoPropertySlug || "thegrandappartement").replace(
    /^\/+|\/+$/g,
    ""
  )

  return `/${slug}`
})
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
          Réservation directe pour hôtes
        </p>
        <h1 id="hostiv-hero-title" class="hostiv-h1">
          Votre site de location,
          <span class="hostiv-h1__accent">sans commission</span>
        </h1>
        <p class="hostiv-lead">
          Passez au direct comme sur Airbnb ou Booking — mais sans leur part sur chaque nuit.
          Hostiv réunit site, calendrier, paiements Stripe et admin en un seul outil.
        </p>
        <ul class="hostiv-hero__proof" aria-label="Avantages Hostiv">
          <li v-for="point in hostivHeroProofPoints" :key="point">{{ point }}</li>
        </ul>
        <div class="hostiv-hero__cta">
          <button type="button" class="hostiv-btn hostiv-btn--primary" @click="openSignup">
            Commencer maintenant
            <ArrowRight :size="18" />
          </button>
          <NuxtLink :to="demoPath" class="hostiv-btn hostiv-btn--secondary">Voir un exemple</NuxtLink>
        </div>
      </div>

      <div class="hostiv-hero__visual" v-scroll-reveal="{ threshold: 0.05, delay: 140 }">
        <figure class="hostiv-hero-illustration">
          <span class="hostiv-hero-illustration__glow" aria-hidden="true" />
          <img
            :src="heroIllustrationSrc"
            alt="Illustration : voyageurs devant un immeuble de location"
            class="hostiv-hero-illustration__img"
            width="800"
            height="610"
            loading="eager"
            fetchpriority="high"
          />
          <figcaption class="hostiv-hero-illustration__caption">
            <MapPin :size="13" />
            Leur séjour commence sur votre site
          </figcaption>
        </figure>

        <div class="hostiv-dream-card hostiv-dream-card--invite" aria-hidden="true">
          <span class="hostiv-dream-card__eyebrow">Réservation directe</span>
          <p class="hostiv-dream-card__quote">
            « On a trouvé la maison parfaite —<br />
            <em>sans passer par une plateforme.</em> »
          </p>
          <span class="hostiv-dream-card__stars">★★★★★</span>
        </div>

        <div class="hostiv-dream-card hostiv-dream-card--stay" aria-hidden="true">
          <span class="hostiv-dream-card__moon-icon">☾</span>
          <div>
            <strong>Villa des Oliviers</strong>
            <span>5 nuits · arrivée demain</span>
          </div>
          <span class="hostiv-dream-card__badge">Confirmée</span>
        </div>
      </div>
    </div>
  </section>
</template>
