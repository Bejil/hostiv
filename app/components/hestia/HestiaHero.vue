<script setup lang="ts">
import { ArrowRight, Star } from "@lucide/vue"

const heroImage =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
</script>

<template>
  <section class="hestia-hero" aria-labelledby="hestia-hero-title">
    <div class="hestia-container hestia-hero__grid">
      <div v-scroll-reveal>
        <p class="hestia-eyebrow">Le Shopify de la location saisonnière</p>
        <h1 id="hestia-hero-title" class="hestia-h1">
          Créez votre site de réservation directe en quelques minutes.
        </h1>
        <p class="hestia-lead">
          Hestia aide les hôtes Airbnb, Booking et Abritel à éviter les commissions, recevoir des
          réservations directes et piloter leurs calendriers depuis une seule plateforme.
        </p>
        <div class="hestia-hero__cta">
          <a href="#cta" class="hestia-btn hestia-btn--primary">
            Commencer gratuitement
            <ArrowRight :size="18" />
          </a>
          <a href="#cta" class="hestia-btn hestia-btn--secondary">Rejoindre la liste d’attente</a>
          <a href="#tarifs" class="hestia-btn hestia-btn--ghost">Réserver une démo</a>
        </div>
        <div class="hestia-hero__proof">
          <span class="hestia-hero__stars">
            <Star :size="16" fill="#94633c" stroke="#94633c" />
            4,9/5
          </span>
          <span>Adopté par 2 500+ hôtes dans 50 pays</span>
          <span>·</span>
          <span>Paiements Stripe · Sync iCal · Domaine perso</span>
        </div>
      </div>

      <div class="hestia-hero__visual" v-scroll-reveal="{ delay: 120 }">
        <div class="hestia-hero__glow" aria-hidden="true" />
        <article class="hestia-mockup" aria-label="Aperçu du tableau de bord Hestia">
          <div class="hestia-mockup__chrome" aria-hidden="true">
            <span class="hestia-mockup__dot" />
            <span class="hestia-mockup__dot" />
            <span class="hestia-mockup__dot" />
          </div>
          <div class="hestia-dashboard__layout" style="min-height: 320px">
            <aside class="hestia-dashboard__sidebar">
              <div class="hestia-dashboard__nav-item hestia-dashboard__nav-item--active">
                Tableau de bord
              </div>
              <div class="hestia-dashboard__nav-item">Réservations</div>
              <div class="hestia-dashboard__nav-item">Calendrier</div>
              <div class="hestia-dashboard__nav-item">Paiements</div>
            </aside>
            <div class="hestia-dashboard__main">
              <div class="hestia-dashboard__kpis">
                <div class="hestia-kpi">
                  <span>Revenus (30 j)</span>
                  <strong>€12 480</strong>
                </div>
                <div class="hestia-kpi">
                  <span>Taux d’occupation</span>
                  <strong>78 %</strong>
                </div>
                <div class="hestia-kpi">
                  <span>Réservations directes</span>
                  <strong>+34 %</strong>
                </div>
              </div>
              <img
                :src="heroImage"
                alt=""
                width="600"
                height="200"
                style="width: 100%; height: 140px; object-fit: cover; border-radius: 10px; opacity: 0.92"
              />
            </div>
          </div>
        </article>
        <div class="hestia-float-card hestia-float-card--booking">
          <strong>Nouvelle réservation</strong>
          <span>Villa Écrins · 5 nuits · €2 150</span>
        </div>
        <div class="hestia-float-card hestia-float-card--revenue">
          <strong>Commission économisée</strong>
          <span>€318 ce mois-ci</span>
        </div>
      </div>
    </div>
  </section>
</template>
