<script setup lang="ts">
import HostivAccountModal from "../../components/hostiv/HostivAccountModal.vue"
import HostivHero from "../../components/hostiv/HostivHero.vue"
import HostivLandingBody from "../../components/hostiv/HostivLandingBody.vue"
import HostivNav from "../../components/hostiv/HostivNav.vue"

const { landing } = useHostivLocale()

useHostivMarketingHead()

useSeoMeta({
  title: () => landing.value.seo.homeTitle,
  description: () => landing.value.seo.homeDescription,
  ogTitle: () => landing.value.seo.homeOgTitle,
  ogDescription: () => landing.value.seo.homeOgDescription,
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

<style src="../../../assets/css/pages/hostiv/hostiv.css"></style>
