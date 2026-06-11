<script setup lang="ts">
import { getHostivStaticPage } from "../data/hostivStaticPages"

const { landing } = useHostivLocale()
const page = getHostivStaticPage("contact", "fr")
const { openContact } = useHostivContactModal()
</script>

<template>
  <HostivStaticPage :page="page">
    <template #actions>
      <button type="button" class="hostiv-btn hostiv-btn--primary" @click="openContact">
        {{ landing.staticUi.contactFormCta }}
      </button>
    </template>
  </HostivStaticPage>
  <HostivContactModal />
</template>

<style src="../../assets/css/pages/hostiv/hostiv.css"></style>
