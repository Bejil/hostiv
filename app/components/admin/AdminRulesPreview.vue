<script setup lang="ts">
import { computed } from "vue"
import type { PropertyHouseRule } from "../../types/property-site"

const props = defineProps<{
  houseRules: PropertyHouseRule[]
  eyebrow: string
  title: string
  intro: string
  checkInLabel: string
  checkInTime: string
  checkOutLabel: string
  checkOutTime: string
}>()

const displayEyebrow = computed(() => props.eyebrow.trim() || "Sur-titre")
const displayTitle = computed(() => props.title.trim() || "Titre de la section")
const displayIntro = computed(() => props.intro.trim() || "Introduction de la section.")

const displayRules = computed(() =>
  props.houseRules
    .map((rule) => ({
      ...rule,
      title: rule.title.trim() || "Règle",
      text: rule.text.trim() || "Description de la règle."
    }))
    .filter((rule) => rule.title || rule.text)
)
</script>

<template>
  <div class="admin-rules-preview" aria-label="Aperçu section règlement">
    <p class="admin-rules-preview__label">Aperçu</p>
    <section class="admin-rules-preview__section">
      <div class="admin-rules-preview__head">
        <p class="admin-rules-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-rules-preview__head-row">
          <h2 class="admin-rules-preview__title">{{ displayTitle }}</h2>
          <p class="admin-rules-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <div class="admin-rules-preview__schedule">
        <article class="admin-rules-preview__schedule-item">
          <span>{{ checkInLabel.trim() || "Arrivée" }}</span>
          <strong>{{ checkInTime.trim() || "—" }}</strong>
        </article>
        <article class="admin-rules-preview__schedule-item">
          <span>{{ checkOutLabel.trim() || "Départ" }}</span>
          <strong>{{ checkOutTime.trim() || "—" }}</strong>
        </article>
      </div>

      <p v-if="!displayRules.length" class="admin-rules-preview__empty">
        Renseignez au moins une règle pour afficher la grille.
      </p>

      <div v-else class="admin-rules-preview__grid">
        <article
          v-for="(rule, index) in displayRules"
          :key="`${rule.title}-${index}`"
          class="admin-rules-preview__card"
        >
          <h3>{{ rule.title }}</h3>
          <p>{{ rule.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
