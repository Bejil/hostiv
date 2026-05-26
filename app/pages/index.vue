<script setup lang="ts">
import HostivAccountModal from "../components/hostiv/HostivAccountModal.vue"
import HostivHero from "../components/hostiv/HostivHero.vue"
import HostivLandingBody from "../components/hostiv/HostivLandingBody.vue"
import HostivNav from "../components/hostiv/HostivNav.vue"

useHostivMarketingHead()

useSeoMeta({
  title: "Hostiv | Site de réservation directe pour hôtes",
  description:
    "Hostiv : site de réservation directe sans commission plateforme. Synchronisez vos calendriers et encaissez via Stripe — contrairement aux OTA.",
  ogTitle: "Hostiv — Réservation directe, 0 % de commission",
  ogDescription:
    "Passez au direct sans la part Airbnb ou Booking. Site, calendrier, paiements Stripe et admin.",
  twitterCard: "summary_large_image"
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main>
      <HostivHero />
      <HostivLandingBody />
    </main>
    <HostivAccountModal />
    <HostivScrollTop />
  </div>
</template>

<style src="../../assets/css/pages/hostiv/hostiv.css"></style>
