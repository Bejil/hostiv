<script setup lang="ts">
import { computed } from "vue"
import AdminBenefitIcon from "./AdminBenefitIcon.vue"
import type { PropertyBenefitCard } from "../../types/property-site"

const props = defineProps<{
  cards: PropertyBenefitCard[]
  eyebrow: string
  title: string
}>()

const { ui } = useAdminUi()

const displayEyebrow = computed(
  () => props.eyebrow.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ui.value.previews.common.sectionTitle
)

const displayCards = computed(() =>
  props.cards
    .map((card) => ({
      ...card,
      title: card.title.trim() || ui.value.previews.benefits.cardTitle,
      text: card.text.trim() || ui.value.previews.benefits.cardText
    }))
    .filter((card) => card.title || card.text)
)
</script>

<template>
  <div class="admin-benefits-preview" :aria-label="ui.previews.benefits.ariaLabel">
    <p class="admin-benefits-preview__label">{{ ui.previews.common.label }}</p>
    <section class="admin-benefits-preview__section">
      <div class="admin-benefits-preview__head">
        <p class="admin-benefits-preview__eyebrow">{{ displayEyebrow }}</p>
        <h2 class="admin-benefits-preview__title">{{ displayTitle }}</h2>
      </div>

      <p v-if="!displayCards.length" class="admin-benefits-preview__empty">
        {{ ui.previews.common.emptyCard }}
      </p>

      <div v-else class="admin-benefits-preview__grid">
        <article
          v-for="(card, index) in displayCards"
          :key="`${card.title}-${index}`"
          class="admin-benefits-preview__card"
        >
          <span class="admin-benefits-preview__icon" aria-hidden="true">
            <AdminBenefitIcon :icon="card.icon" />
          </span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
