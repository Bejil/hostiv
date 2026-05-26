<script setup lang="ts">
import AdminBenefitIconPicker from "./AdminBenefitIconPicker.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import { DEFAULT_BENEFIT_ICON } from "../../data/benefit-icons"
import type { BenefitIconId } from "../../data/benefit-icons"
import type { PropertyBenefitCard } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyBenefitCard[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyBenefitCard[]]
}>()

const activeIndex = ref(0)

const tabs = computed(() =>
  props.modelValue.map((card, index) => ({
    id: index,
    label: card.title.trim() || `Atout ${index + 1}`
  }))
)

const activeCard = computed(() => props.modelValue[activeIndex.value])

const canRemoveActiveCard = computed(() => props.modelValue.length > 1)

function createEmptyCard(): PropertyBenefitCard {
  return {
    icon: DEFAULT_BENEFIT_ICON,
    title: "",
    text: ""
  }
}

function updateCard(index: number, partial: Partial<PropertyBenefitCard>) {
  const cards = [...props.modelValue]

  if (!cards[index]) {
    return
  }

  cards[index] = { ...cards[index], ...partial }
  emit("update:modelValue", cards)
}

function selectTab(index: number) {
  activeIndex.value = index
}

function addCard() {
  const cards = [...props.modelValue, createEmptyCard()]

  emit("update:modelValue", cards)
  activeIndex.value = cards.length - 1
}

function removeActiveCard() {
  if (!canRemoveActiveCard.value) {
    return
  }

  const cards = props.modelValue.filter((_, index) => index !== activeIndex.value)

  emit("update:modelValue", cards)
  activeIndex.value = Math.min(activeIndex.value, cards.length - 1)
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
  <div class="admin-benefit-cards">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Cartes atouts</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addCard">
          <AdminIcon name="plus" :size="16" />
          Ajouter un atout
        </button>
      </div>

      <div v-if="!modelValue.length" class="admin-benefit-cards__empty">
        Aucune carte. Ajoutez au moins un atout pour l’afficher sur le site.
      </div>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Cartes atouts">
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

        <div v-if="activeCard" class="admin-benefit-cards__panel" role="tabpanel">
          <header class="admin-benefit-cards__panel-top">
            <div>
              <p class="admin-benefit-cards__panel-kicker">Carte atout</p>
              <h4 class="admin-benefit-cards__panel-title">
                {{ activeCard.title.trim() || "Sans titre" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveCard"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveCard"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-benefit-card-row">
            <AdminBenefitIconPicker
              :model-value="activeCard.icon"
              @update:model-value="updateCard(activeIndex, { icon: $event })"
            />
            <div class="admin-benefit-card-row__fields">
              <AdminField
                label="Titre"
                full-width
                :model-value="activeCard.title"
                @update:model-value="updateCard(activeIndex, { title: $event as string })"
              />
              <AdminField
                label="Texte"
                type="textarea"
                :rows="3"
                full-width
                :model-value="activeCard.text"
                @update:model-value="updateCard(activeIndex, { text: $event as string })"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
