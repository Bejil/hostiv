<script setup lang="ts">
import PlatformAdminApp from "../../components/platform-admin/PlatformAdminApp.vue"

definePageMeta({
  ssr: false
})

useAdminHead("Admin plateforme")

useHead({
  bodyAttrs: {
    class: "admin-route"
  }
})
</script>

<template>
  <PlatformAdminApp />
</template>

<style src="../../../assets/css/pages/admin/admin.css"></style>
<style src="../../../assets/css/pages/admin/platform-admin.css"></style>
