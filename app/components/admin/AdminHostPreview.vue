<script setup lang="ts">
import { computed, toRef } from "vue"

const props = defineProps<{
  hostPhotoPath: string
  hostRevision: number
  caption: string
  eyebrow: string
  title: string
  quote: string
  intro1: string
  intro2: string
  cta: string
  previewUrl: (path: string) => string
}>()

const { ui } = useAdminUi()

const hostPhotoPathRef = toRef(props, "hostPhotoPath")
const hostRevisionRef = toRef(props, "hostRevision")

const photoSrc = computed(() => {
  const path = hostPhotoPathRef.value.trim()

  if (!path) {
    return ""
  }

  const base = props.previewUrl(path)
  const separator = base.includes("?") ? "&" : "?"

  return `${base}${separator}r=${hostRevisionRef.value}`
})

const displayCaption = computed(
  () => props.caption.trim() || ui.value.previews.host.photoCaption
)
const displayEyebrow = computed(
  () => props.eyebrow.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ui.value.previews.common.sectionTitle
)
const displayQuote = computed(
  () => props.quote.trim() || ui.value.previews.host.quote
)
const displayIntro1 = computed(
  () => props.intro1.trim() || ui.value.previews.host.intro1
)
const displayIntro2 = computed(
  () => props.intro2.trim() || ui.value.previews.host.intro2
)
const displayCta = computed(
  () => props.cta.trim() || ui.value.previews.common.book
)
const displayAlt = computed(
  () =>
    props.caption.trim() ||
    props.title.trim() ||
    ui.value.previews.host.photoAlt
)
</script>

<template>
  <div class="admin-host-preview" :aria-label="ui.previews.host.ariaLabel">
    <p class="admin-host-preview__label">{{ ui.previews.common.label }}</p>
    <section class="admin-host-preview__card">
      <div class="admin-host-preview__layout">
        <div class="admin-host-preview__media">
          <img
            v-if="photoSrc"
            :key="photoSrc"
            :src="photoSrc"
            :alt="displayAlt"
            class="admin-host-preview__photo"
          />
          <div v-else class="admin-host-preview__photo admin-host-preview__photo--empty" aria-hidden="true" />
          <p class="admin-host-preview__caption">{{ displayCaption }}</p>
        </div>
        <div class="admin-host-preview__copy">
          <p class="admin-host-preview__eyebrow">{{ displayEyebrow }}</p>
          <h2 class="admin-host-preview__title">{{ displayTitle }}</h2>
          <blockquote class="admin-host-preview__quote">{{ displayQuote }}</blockquote>
          <p class="admin-host-preview__intro admin-host-preview__intro--lead">{{ displayIntro1 }}</p>
          <p class="admin-host-preview__intro">{{ displayIntro2 }}</p>
          <span class="admin-host-preview__cta">{{ displayCta }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
