<script setup lang="ts">
import { computed, toRef } from "vue"

const props = defineProps<{
  heroImagePath: string
  heroRevision: number
  eyebrow: string
  title: string
  text: string
  previewUrl: (path: string) => string
}>()

const heroImagePathRef = toRef(props, "heroImagePath")
const heroRevisionRef = toRef(props, "heroRevision")
const eyebrowRef = toRef(props, "eyebrow")
const titleRef = toRef(props, "title")
const textRef = toRef(props, "text")

const imageSrc = computed(() => {
  const path = heroImagePathRef.value.trim()

  if (!path) {
    return ""
  }

  const base = props.previewUrl(path)
  const separator = base.includes("?") ? "&" : "?"

  return `${base}${separator}r=${heroRevisionRef.value}`
})

const displayEyebrow = computed(() => eyebrowRef.value.trim() || "Sur-titre")
const displayTitle = computed(() => titleRef.value.trim() || "Titre principal")
const displayText = computed(() => textRef.value.trim() || "Texte d’introduction du hero.")
const displayAlt = computed(() => titleRef.value.trim() || "Image hero")
</script>

<template>
  <div class="admin-hero-preview" aria-label="Aperçu du moteur de recherche">
    <p class="admin-hero-preview__label">Aperçu</p>
    <section class="admin-hero-preview__card">
      <div class="admin-hero-preview__media" aria-hidden="true">
        <img
          v-if="imageSrc"
          :key="imageSrc"
          :src="imageSrc"
          :alt="displayAlt"
          class="admin-hero-preview__image"
        />
        <div v-else class="admin-hero-preview__image admin-hero-preview__image--empty" />
        <div class="admin-hero-preview__overlay" />
      </div>

      <div class="admin-hero-preview__content">
        <p class="admin-hero-preview__eyebrow">{{ displayEyebrow }}</p>
        <h2 class="admin-hero-preview__title">{{ displayTitle }}</h2>
        <p class="admin-hero-preview__text">{{ displayText }}</p>
      </div>

      <div class="admin-hero-preview__booking" aria-hidden="true">
        <span class="admin-hero-preview__booking-item">
          <span>Dates</span>
          <strong>Choisir</strong>
        </span>
        <span class="admin-hero-preview__booking-item">
          <span>Voyageurs</span>
          <strong>4</strong>
        </span>
        <span class="admin-hero-preview__booking-cta">Réserver</span>
      </div>
    </section>
  </div>
</template>
