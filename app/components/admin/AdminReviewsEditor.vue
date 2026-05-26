<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import type { PropertyReview } from "../../types/property-site"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  modelValue: PropertyReview[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyReview[]]
}>()

const activeIndex = ref(0)

const tabs = computed(() =>
  props.modelValue.map((review, index) => ({
    id: index,
    label: review.author.trim() || `Avis ${index + 1}`
  }))
)

const activeReview = computed(() => props.modelValue[activeIndex.value])

const canRemoveActiveReview = computed(() => props.modelValue.length > 1)

const activeStars = computed(() => ratingToStars(activeReview.value?.rating ?? ""))

function createEmptyReview(): PropertyReview {
  return {
    id: `review-${Date.now()}`,
    author: "",
    date: "",
    quote: "",
    rating: "5/5"
  }
}

function updateRatingInput(value: string) {
  updateReview(activeIndex.value, { rating: value })
}

function updateReview(index: number, partial: Partial<PropertyReview>) {
  const reviews = [...props.modelValue]

  if (!reviews[index]) {
    return
  }

  reviews[index] = { ...reviews[index], ...partial }
  emit("update:modelValue", reviews)
}

function selectTab(index: number) {
  activeIndex.value = index
}

function addReview() {
  const reviews = [...props.modelValue, createEmptyReview()]

  emit("update:modelValue", reviews)
  activeIndex.value = reviews.length - 1
}

function removeActiveReview() {
  if (!canRemoveActiveReview.value) {
    return
  }

  const reviews = props.modelValue.filter((_, index) => index !== activeIndex.value)

  emit("update:modelValue", reviews)
  activeIndex.value = Math.min(activeIndex.value, reviews.length - 1)
}

watch(
  tabs,
  (items) => {
    if (activeIndex.value < items.length) {
      return
    }

    activeIndex.value = Math.max(0, items.length - 1)
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-reviews-editor">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Avis clients</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addReview">
          <AdminIcon name="plus" :size="16" />
          Ajouter un avis
        </button>
      </div>

      <p class="admin-reviews-editor__lead">
        Les avis défilent en carrousel sur la page. Au moins un avis est recommandé.
      </p>

      <p v-if="!modelValue.length" class="admin-reviews-editor__empty">
        Aucun avis. Ajoutez au moins un témoignage pour la section.
      </p>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Avis clients">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="admin-tabs__btn"
              :class="{ 'admin-tabs__btn--active': activeIndex === tab.id }"
              :aria-selected="activeIndex === tab.id"
              @click="selectTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="activeReview" class="admin-reviews-editor__panel" role="tabpanel">
          <header class="admin-reviews-editor__panel-top">
            <div>
              <p class="admin-reviews-editor__panel-kicker">Témoignage</p>
              <h4 class="admin-reviews-editor__panel-title">
                {{ activeReview.author.trim() || "Sans nom" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveReview"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveReview"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-reviews-editor__fields">
            <AdminField
              label="Auteur"
              full-width
              :model-value="activeReview.author"
              @update:model-value="updateReview(activeIndex, { author: $event as string })"
            />
            <AdminField
              label="Date affichée"
              full-width
              placeholder="ex. Mars 2025"
              :model-value="activeReview.date"
              @update:model-value="updateReview(activeIndex, { date: $event as string })"
            />
            <div class="admin-reviews-editor__rating-row">
              <div class="admin-reviews-editor__rating-field">
                <AdminField
                  label="Note"
                  hint="Toute note au format score / max (ex. 4,97/5, 5/10, 18/50) est convertie sur 5 étoiles"
                  placeholder="ex. 4,97/5"
                  :model-value="activeReview.rating"
                  @update:model-value="updateRatingInput($event as string)"
                />
                <p
                  class="admin-reviews-editor__stars-display"
                  :class="{ 'admin-reviews-editor__stars-display--empty': !activeStars }"
                  aria-label="Aperçu des étoiles"
                >
                  {{ activeStars || "☆☆☆☆☆" }}
                </p>
              </div>
            </div>
            <AdminField
              label="Citation"
              :model-value="activeReview.quote"
              type="textarea"
              :rows="4"
              full-width
              @update:model-value="updateReview(activeIndex, { quote: $event as string })"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
