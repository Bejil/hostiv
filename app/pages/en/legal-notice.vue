<script setup lang="ts">
import { getHostivStaticPage } from "../../data/hostivStaticPages"

const page = getHostivStaticPage("mentions-legales", "en")
</script>

<template>
  <HostivStaticPage :page="page" />
</template>

<style src="../../../assets/css/pages/hostiv/hostiv.css"></style>
