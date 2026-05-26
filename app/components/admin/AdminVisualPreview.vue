<script setup lang="ts">
import { computed } from "vue"
import type { PropertyVisualCard } from "../../types/property-site"

const props = defineProps<{
  cards: PropertyVisualCard[]
  eyebrow: string
  title: string
  intro: string
  ctaEyebrow: string
  ctaTitle: string
  ctaText: string
  ctaAction: string
  imageRevision: number
  previewUrl: (path: string) => string
}>()

const displayEyebrow = computed(() => props.eyebrow.trim() || "Sur-titre")
const displayTitle = computed(() => props.title.trim() || "Titre de la section")
const displayIntro = computed(() => props.intro.trim() || "Introduction de la section.")

const displayCards = computed(() =>
  props.cards
    .map((card) => ({
      ...card,
      title: card.title.trim() || "Titre de la carte",
      text: card.text.trim() || "Description de la carte.",
      image: card.image.trim()
    }))
    .filter((card) => card.title || card.text || card.image)
)

const displayCtaEyebrow = computed(() => props.ctaEyebrow.trim() || "Sur-titre CTA")
const displayCtaTitle = computed(() => props.ctaTitle.trim() || "Titre CTA")
const displayCtaText = computed(() => props.ctaText.trim() || "Texte de la carte galerie.")
const displayCtaAction = computed(() => props.ctaAction.trim() || "Voir la galerie")

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
  <div class="admin-visual-preview" aria-label="Aperçu section images">
    <p class="admin-visual-preview__label">Aperçu</p>
    <section class="admin-visual-preview__section">
      <div class="admin-visual-preview__head">
        <p class="admin-visual-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-visual-preview__head-row">
          <h2 class="admin-visual-preview__title">{{ displayTitle }}</h2>
          <p class="admin-visual-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <p v-if="!displayCards.length" class="admin-visual-preview__empty">
        Renseignez au moins une carte visuelle pour afficher l’aperçu.
      </p>

      <div v-else class="admin-visual-preview__grid">
        <article
          v-for="(card, index) in displayCards"
          :key="`${card.title}-${index}`"
          class="admin-visual-preview__card"
        >
          <img
            v-if="imageSrc(card.image)"
            :key="imageSrc(card.image)"
            :src="imageSrc(card.image)"
            :alt="card.title"
            class="admin-visual-preview__image"
          />
          <div v-else class="admin-visual-preview__image admin-visual-preview__image--empty" aria-hidden="true" />
          <div class="admin-visual-preview__copy">
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
          </div>
        </article>

        <article class="admin-visual-preview__card admin-visual-preview__card--cta">
          <div class="admin-visual-preview__cta-body">
            <span class="admin-visual-preview__cta-eyebrow">{{ displayCtaEyebrow }}</span>
            <h3>{{ displayCtaTitle }}</h3>
            <p>{{ displayCtaText }}</p>
            <span class="admin-visual-preview__cta-action">{{ displayCtaAction }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
