<script setup lang="ts">
import HestiaIcon from "./HestiaIcon.vue"
import {
  hestiaBenefits,
  hestiaExamples,
  hestiaFaqs,
  hestiaFeatures,
  hestiaLogos,
  hestiaPlans,
  hestiaStats,
  hestiaSteps,
  hestiaTestimonials
} from "../../data/hestiaLanding"

const demoPropertyPath = useDemoPropertyPath()
const billingYearly = ref(false)

const calendarCells = Array.from({ length: 28 }, (_, i) => i + 1)

function planPrice(plan: (typeof hestiaPlans)[number]) {
  return billingYearly.value ? plan.priceYearly : plan.priceMonthly
}
</script>

<template>
  <section class="hestia-section hestia-section--light" aria-label="Confiance">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Ils nous font confiance</p>
      <div class="hestia-stats">
        <article v-for="stat in hestiaStats" :key="stat.label" class="hestia-stat">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </article>
      </div>
      <p class="hestia-logos">
        <span v-for="logo in hestiaLogos" :key="logo">{{ logo }}</span>
      </p>
    </div>
  </section>

  <section id="fonctionnalites" class="hestia-section" aria-labelledby="hestia-features-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Fonctionnalités</p>
      <h2 id="hestia-features-title" class="hestia-h2">
        Tout ce qu’il faut pour vendre vos nuits en direct
      </h2>
      <p class="hestia-section-intro">
        Un seul outil pour publier, synchroniser, encaisser et analyser — sans empiler les
        abonnements.
      </p>
      <div class="hestia-features-grid">
        <article
          v-for="(feature, index) in hestiaFeatures"
          :key="feature.title"
          class="hestia-feature-card"
          v-scroll-reveal="{ delay: (index % 6) * 40 }"
        >
          <div class="hestia-feature-card__icon">
            <HestiaIcon :name="feature.icon" />
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </div>
  </section>

  <section
    id="comment-ca-marche"
    class="hestia-section hestia-section--sand"
    aria-labelledby="hestia-steps-title"
  >
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Comment ça marche</p>
      <h2 id="hestia-steps-title" class="hestia-h2">En ligne en trois étapes</h2>
      <p class="hestia-section-intro">
        De la création de votre page à la première réservation payée — le parcours le plus court du
        marché.
      </p>
      <div class="hestia-steps">
        <article v-for="step in hestiaSteps" :key="step.step" class="hestia-step">
          <span class="hestia-step__num">Étape {{ step.step }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </div>
  </section>

  <section id="exemples" class="hestia-section hestia-section--light" aria-labelledby="hestia-examples-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Exemples de sites</p>
      <h2 id="hestia-examples-title" class="hestia-h2">Des sites qui convertissent comme des marques premium</h2>
      <p class="hestia-section-intro">
        Chaque modèle est optimisé mobile, rapide et prêt pour Stripe. Voici un exemple réel
        hébergé sur cette stack.
      </p>
      <div class="hestia-examples">
        <NuxtLink
          v-for="example in hestiaExamples"
          :key="example.title"
          :to="demoPropertyPath"
          class="hestia-example-card"
        >
          <img :src="example.image" :alt="example.title" loading="lazy" width="450" height="338" />
          <div class="hestia-example-card__body">
            <p class="hestia-example-card__tag">{{ example.tag }}</p>
            <h3>{{ example.title }}</h3>
            <p>{{ example.location }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="hestia-section" aria-labelledby="hestia-dashboard-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Tableau de bord</p>
      <h2 id="hestia-dashboard-title" class="hestia-h2">Pilotez votre activité sans tableur</h2>
      <p class="hestia-section-intro">
        Réservations, calendrier, revenus et voyageurs — une vue claire pour décider vite.
      </p>
      <div class="hestia-dashboard" role="img" aria-label="Aperçu du tableau de bord Hestia">
        <div class="hestia-dashboard__layout">
          <aside class="hestia-dashboard__sidebar">
            <div class="hestia-dashboard__nav-item hestia-dashboard__nav-item--active">
              Vue d’ensemble
            </div>
            <div class="hestia-dashboard__nav-item">Réservations</div>
            <div class="hestia-dashboard__nav-item">Calendrier</div>
            <div class="hestia-dashboard__nav-item">Voyageurs</div>
            <div class="hestia-dashboard__nav-item">Paiements</div>
          </aside>
          <div class="hestia-dashboard__main">
            <div class="hestia-dashboard__kpis">
              <div class="hestia-kpi"><span>Revenus</span><strong>€24 890</strong></div>
              <div class="hestia-kpi"><span>Occupation</span><strong>82 %</strong></div>
              <div class="hestia-kpi"><span>Panier moyen</span><strong>€1 040</strong></div>
            </div>
            <div class="hestia-dashboard__grid">
              <div class="hestia-panel">
                <h4>Calendrier</h4>
                <div class="hestia-calendar-mini" aria-hidden="true">
                  <span
                    v-for="day in calendarCells"
                    :key="day"
                    :class="{ 'is-busy': day % 3 === 0 || day % 5 === 0 }"
                  />
                </div>
              </div>
              <div class="hestia-panel">
                <h4>Réservations récentes</h4>
                <div class="hestia-booking-row"><span>Loft Marais</span><span>Confirmée</span></div>
                <div class="hestia-booking-row"><span>Villa Écrins</span><span>En attente</span></div>
                <div class="hestia-booking-row"><span>Maison Lagon</span><span>Confirmée</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="hestia-section hestia-section--dark" aria-labelledby="hestia-benefits-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow" style="color: rgba(255, 214, 170, 0.9)">Pourquoi Hestia</p>
      <h2 id="hestia-benefits-title" class="hestia-h2">Reprenez le contrôle de votre activité</h2>
      <p class="hestia-section-intro">
        Moins de dépendance aux marketplaces, plus de marge et une relation directe avec vos
        voyageurs.
      </p>
      <div class="hestia-benefits-grid">
        <article v-for="benefit in hestiaBenefits" :key="benefit.title" class="hestia-benefit">
          <h3>{{ benefit.title }}</h3>
          <p>{{ benefit.description }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="hestia-section hestia-section--light" aria-labelledby="hestia-testimonials-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Témoignages</p>
      <h2 id="hestia-testimonials-title" class="hestia-h2">Ce que disent les hôtes</h2>
      <p class="hestia-section-intro">
        Des propriétaires, gestionnaires et conciergeries qui ont basculé une partie de leurs
        réservations en direct.
      </p>
      <div class="hestia-testimonials">
        <blockquote
          v-for="item in hestiaTestimonials"
          :key="item.name"
          class="hestia-testimonial"
        >
          <p>« {{ item.quote }} »</p>
          <footer class="hestia-testimonial__author">
            <span class="hestia-avatar" aria-hidden="true">{{ item.initials }}</span>
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.role }} · {{ item.country }}</span>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  </section>

  <section id="tarifs" class="hestia-section" aria-labelledby="hestia-pricing-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">Tarifs</p>
      <h2 id="hestia-pricing-title" class="hestia-h2">Des offres simples, qui grandissent avec vous</h2>
      <p class="hestia-section-intro">
        Commencez gratuitement, passez Pro quand le direct décolle, ou Business pour les
        portefeuilles.
      </p>
      <div class="hestia-billing-toggle" role="group" aria-label="Facturation">
        <button type="button" :class="{ 'is-active': !billingYearly }" @click="billingYearly = false">
          Mensuel
        </button>
        <button type="button" :class="{ 'is-active': billingYearly }" @click="billingYearly = true">
          Annuel (−20 %)
        </button>
      </div>
      <div class="hestia-pricing-grid">
        <article
          v-for="plan in hestiaPlans"
          :key="plan.id"
          class="hestia-price-card"
          :class="{ 'hestia-price-card--highlight': plan.highlighted }"
        >
          <h3>{{ plan.name }}</h3>
          <p class="hestia-section-intro" style="margin: 0; font-size: 0.9rem">{{ plan.description }}</p>
          <p class="hestia-price-card__amount">
            €{{ planPrice(plan) }}<small>/mois</small>
          </p>
          <ul>
            <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
          </ul>
          <a href="#cta" class="hestia-btn" :class="plan.highlighted ? 'hestia-btn--primary' : 'hestia-btn--secondary'">
            {{ plan.cta }}
          </a>
        </article>
      </div>
    </div>
  </section>

  <section id="faq" class="hestia-section hestia-section--sand" aria-labelledby="hestia-faq-title">
    <div class="hestia-container" v-scroll-reveal>
      <p class="hestia-eyebrow">FAQ</p>
      <h2 id="hestia-faq-title" class="hestia-h2">Questions fréquentes</h2>
      <div class="hestia-faq">
        <details v-for="faq in hestiaFaqs" :key="faq.question">
          <summary>{{ faq.question }}</summary>
          <p class="hestia-faq__answer">{{ faq.answer }}</p>
        </details>
      </div>
    </div>
  </section>

  <section id="cta" class="hestia-cta-band hestia-section--dark" aria-labelledby="hestia-cta-title">
    <div class="hestia-container" v-scroll-reveal>
      <h2 id="hestia-cta-title" class="hestia-h2">Commencez à recevoir des réservations directes aujourd’hui</h2>
      <p class="hestia-section-intro">
        Rejoignez la liste d’attente ou créez votre compte — votre site peut être en ligne avant la
        fin de la semaine.
      </p>
      <div class="hestia-cta-band__actions">
        <a href="#cta" class="hestia-btn hestia-btn--primary">Démarrer gratuitement</a>
        <a href="#tarifs" class="hestia-btn hestia-btn--secondary">Réserver une démo</a>
        <NuxtLink :to="demoPropertyPath" class="hestia-btn hestia-btn--ghost">
          Voir un site exemple
        </NuxtLink>
      </div>
    </div>
  </section>

  <footer class="hestia-footer">
    <div class="hestia-container hestia-footer__grid">
      <div class="hestia-footer__brand">
        <NuxtLink to="/" class="hestia-logo">
          <span class="hestia-logo__mark" aria-hidden="true">H</span>
          <span class="hestia-logo__text">Hestia</span>
        </NuxtLink>
        <p>
          La plateforme qui permet aux hôtes de location saisonnière de créer leur site de
          réservation directe — beau, fiable et prêt à encaisser.
        </p>
      </div>
      <div class="hestia-footer__cols">
        <div>
          <h4>Produit</h4>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#exemples">Exemples</a>
          <NuxtLink :to="demoPropertyPath">Site démo</NuxtLink>
        </div>
        <div>
          <h4>Entreprise</h4>
          <a href="#faq">FAQ</a>
          <a href="mailto:hello@hestia.app">Contact</a>
          <a href="#">Mentions légales</a>
          <a href="#">Confidentialité</a>
        </div>
      </div>
      <p class="hestia-footer__bottom">© {{ new Date().getFullYear() }} Hestia. Tous droits réservés.</p>
    </div>
  </footer>
</template>
