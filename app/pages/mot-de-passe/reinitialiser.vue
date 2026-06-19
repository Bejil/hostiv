<script setup lang="ts">
import HostivPasswordResetView from "../../components/hostiv/HostivPasswordResetView.vue"

const { landing } = useHostivLocale()

useHostivMarketingSeo({
  title: () => landing.value.passwordResetPage.seoTitle,
  description: () => landing.value.passwordResetPage.seoDescription,
  robots: "noindex, nofollow",
  path: "/mot-de-passe/reinitialiser"
})
</script>

<template>
  <HostivPasswordResetView />
</template>
