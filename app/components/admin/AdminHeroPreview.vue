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

const { ui } = useAdminUi()

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

const displayEyebrow = computed(
  () => eyebrowRef.value.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => titleRef.value.trim() || ui.value.previews.hero.mainTitle
)
const displayText = computed(
  () => textRef.value.trim() || ui.value.previews.hero.introText
)
const displayAlt = computed(
  () => titleRef.value.trim() || ui.value.previews.hero.imageAlt
)
</script>

<template>
  <div class="admin-hero-preview" :aria-label="ui.previews.hero.ariaLabel">
    <p class="admin-hero-preview__label">{{ ui.previews.common.label }}</p>
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
          <span>{{ ui.previews.hero.dates }}</span>
          <strong>{{ ui.previews.hero.choose }}</strong>
        </span>
        <span class="admin-hero-preview__booking-item">
          <span>{{ ui.previews.hero.guests }}</span>
          <strong>4</strong>
        </span>
        <span class="admin-hero-preview__booking-cta">{{ ui.previews.common.book }}</span>
      </div>
    </section>
  </div>
</template>
