<script setup lang="ts">
import { computed } from "vue"
import type { PropertyFeaturedSpace } from "../../types/property-site"

const props = defineProps<{
  spaces: PropertyFeaturedSpace[]
  eyebrow: string
  title: string
  intro: string
  imageRevision: number
  previewUrl: (path: string) => string
}>()

const displayEyebrow = computed(() => props.eyebrow.trim() || "Sur-titre")
const displayTitle = computed(() => props.title.trim() || "Titre de la section")
const displayIntro = computed(() => props.intro.trim() || "Introduction de la section.")

const displaySpaces = computed(() =>
  props.spaces
    .map((space) => ({
      ...space,
      title: space.title.trim() || "Titre de l’espace",
      text: space.text.trim() || "Description de l’espace.",
      tag: space.tag.trim() || "Tag",
      image: space.image.trim()
    }))
    .filter((space) => space.title || space.text || space.image)
)

const primarySpace = computed(() => displaySpaces.value[0] ?? null)
const secondarySpaces = computed(() => displaySpaces.value.slice(1))

function imageSrc(path: string) {
  const trimmed = path.trim()

  if (!trimmed) {
    return ""
  }

  const base = props.previewUrl(trimmed)
  const separator = base.includes("?") ? "&" : "?"

  return `${base}${separator}r=${props.imageRevision}`
}
</script>

<template>
  <div class="admin-featured-preview" aria-label="Aperçu des coups de cœur">
    <p class="admin-featured-preview__label">Aperçu</p>
    <section class="admin-featured-preview__section">
      <div class="admin-featured-preview__head">
        <p class="admin-featured-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-featured-preview__head-row">
          <h2 class="admin-featured-preview__title">{{ displayTitle }}</h2>
          <p class="admin-featured-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <p v-if="!displaySpaces.length" class="admin-featured-preview__empty">
        Renseignez au moins une carte pour afficher l’aperçu.
      </p>

      <div v-else class="admin-featured-preview__layout">
        <article
          v-if="primarySpace"
          class="admin-featured-preview__card admin-featured-preview__card--large"
        >
          <img
            v-if="imageSrc(primarySpace.image)"
            :key="imageSrc(primarySpace.image)"
            :src="imageSrc(primarySpace.image)"
            :alt="primarySpace.title"
            class="admin-featured-preview__image"
          />
          <div v-else class="admin-featured-preview__image admin-featured-preview__image--empty" aria-hidden="true" />
          <div class="admin-featured-preview__overlay" aria-hidden="true" />
          <div class="admin-featured-preview__content">
            <span class="admin-featured-preview__tag">{{ primarySpace.tag }}</span>
            <h3>{{ primarySpace.title }}</h3>
            <p>{{ primarySpace.text }}</p>
            <span class="admin-featured-preview__cta">Voir tous les espaces de vie ▸</span>
          </div>
        </article>

        <div v-if="secondarySpaces.length" class="admin-featured-preview__stack">
          <article
            v-for="(space, index) in secondarySpaces"
            :key="`${space.title}-${index}`"
            class="admin-featured-preview__card"
          >
            <img
              v-if="imageSrc(space.image)"
              :key="imageSrc(space.image)"
              :src="imageSrc(space.image)"
              :alt="space.title"
              class="admin-featured-preview__image"
            />
            <div v-else class="admin-featured-preview__image admin-featured-preview__image--empty" aria-hidden="true" />
            <div class="admin-featured-preview__overlay" aria-hidden="true" />
            <div class="admin-featured-preview__content">
              <span class="admin-featured-preview__tag">{{ space.tag }}</span>
              <h3>{{ space.title }}</h3>
              <p>{{ space.text }}</p>
              <span class="admin-featured-preview__cta">Voir tous les espaces de vie ▸</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
