<script setup lang="ts">
const { landing } = useHostivLocale()

useHostivMarketingSeo({
  title: () => landing.value.seo.pricingPageTitle,
  description: () => landing.value.seo.pricingPageDescription,
  ogTitle: () => landing.value.seo.pricingPageOgTitle,
  ogDescription: () => landing.value.seo.pricingPageOgDescription
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main>
      <HostivPricingSection as-page />
    </main>
    <HostivFooter />
    <HostivAccountModal />
    <HostivScrollTop />
  </div>
</template>

<style src="../../assets/css/pages/hostiv/hostiv.css"></style>
