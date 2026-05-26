<script setup lang="ts">
import { getHostivStaticPage } from "../data/hostivStaticPages"

const page = getHostivStaticPage("politique-de-confidentialite")
</script>

<template>
  <HostivStaticPage :page="page" />
</template>

<style src="../../assets/css/pages/hostiv/hostiv.css"></style>
