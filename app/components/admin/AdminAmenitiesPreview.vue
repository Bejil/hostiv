<script setup lang="ts">
import { computed } from "vue"
import AmenityIcon from "../AmenityIcon.vue"
import type { AmenityPreviewSection } from "../../types/amenity"
import {
  amenitySectionHasMore,
  visibleAmenityItems
} from "../../utils/amenity-preview"

const props = defineProps<{
  sections: AmenityPreviewSection[]
  eyebrow: string
  title: string
  intro: string
}>()

const displayEyebrow = computed(() => props.eyebrow.trim() || "Sur-titre")
const displayTitle = computed(() => props.title.trim() || "Titre de la section")
const displayIntro = computed(() => props.intro.trim() || "Introduction de la section.")

const displaySections = computed(() =>
  props.sections
    .map((section) => ({
      ...section,
      title: section.title.trim() || "Catégorie",
      items: section.items.map((item) => ({
        ...item,
        name: item.name.trim() || "Équipement"
      }))
    }))
    .filter((section) => section.title || section.items.length)
)
</script>

<template>
  <div class="admin-amenities-preview" aria-label="Aperçu section équipements">
    <p class="admin-amenities-preview__label">Aperçu</p>
    <section class="admin-amenities-preview__section">
      <div class="admin-amenities-preview__head">
        <p class="admin-amenities-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-amenities-preview__head-row">
          <h2 class="admin-amenities-preview__title">{{ displayTitle }}</h2>
          <p class="admin-amenities-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <p v-if="!displaySections.length" class="admin-amenities-preview__empty">
        Renseignez au moins une section d’aperçu pour afficher la grille.
      </p>

      <div v-else class="admin-amenities-preview__grid">
        <article
          v-for="section in displaySections"
          :key="section.id"
          class="admin-amenities-preview__card"
        >
          <h3>{{ section.title }}</h3>
          <ul class="admin-amenities-preview__list">
            <li
              v-for="item in visibleAmenityItems(section.items)"
              :key="item.id"
              class="admin-amenities-preview__item"
            >
              <span class="admin-amenities-preview__icon" aria-hidden="true">
                <AmenityIcon :name="item.icon" />
              </span>
              <span class="admin-amenities-preview__name">{{ item.name }}</span>
            </li>
          </ul>
          <span v-if="amenitySectionHasMore(section)" class="admin-amenities-preview__more">Voir la suite</span>
        </article>
      </div>
    </section>
  </div>
</template>
