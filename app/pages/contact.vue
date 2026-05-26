<script setup lang="ts">
import { getHostivStaticPage } from "../data/hostivStaticPages"

const page = getHostivStaticPage("contact")
const { openContact } = useHostivContactModal()
</script>

<template>
  <HostivStaticPage :page="page">
    <template #actions>
      <button type="button" class="hostiv-btn hostiv-btn--primary" @click="openContact">
        Ouvrir le formulaire de contact
      </button>
    </template>
  </HostivStaticPage>
  <HostivContactModal />
</template>

<style src="../../assets/css/pages/hostiv/hostiv.css"></style>
