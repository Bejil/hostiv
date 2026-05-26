<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import type { PropertyVisualCard } from "../../types/property-site"

const GALLERY_CTA_TAB_ID = "gallery-cta" as const

type VisualTabId = number | typeof GALLERY_CTA_TAB_ID

const props = defineProps<{
  modelValue: PropertyVisualCard[]
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyVisualCard[]]
}>()

const activeTabId = ref<VisualTabId>(0)

const visualTabs = computed(() => [
  ...props.modelValue.map((card, index) => ({
    id: index as VisualTabId,
    label: card.title.trim() || `Carte ${index + 1}`,
    isGalleryCta: false
  })),
  {
    id: GALLERY_CTA_TAB_ID,
    label: "Carte « Voir la galerie »",
    isGalleryCta: true
  }
])

const isCtaTabActive = computed(() => activeTabId.value === GALLERY_CTA_TAB_ID)

const activeCard = computed(() => {
  if (isCtaTabActive.value || typeof activeTabId.value !== "number") {
    return null
  }

  return props.modelValue[activeTabId.value] ?? null
})

const activeCardIndex = computed(() =>
  typeof activeTabId.value === "number" ? activeTabId.value : -1
)

const canRemoveActiveCard = computed(() => props.modelValue.length > 1)

function createEmptyCard(): PropertyVisualCard {
  return {
    title: "",
    text: "",
    image: ""
  }
}

function updateCard(index: number, partial: Partial<PropertyVisualCard>) {
  const cards = [...props.modelValue]

  if (!cards[index]) {
    return
  }

  cards[index] = { ...cards[index], ...partial }
  emit("update:modelValue", cards)
}

function selectTab(id: VisualTabId) {
  activeTabId.value = id
}

function addCard() {
  const cards = [...props.modelValue, createEmptyCard()]

  emit("update:modelValue", cards)
  activeTabId.value = cards.length - 1
}

function removeActiveCard() {
  if (!canRemoveActiveCard.value || typeof activeTabId.value !== "number") {
    return
  }

  const index = activeTabId.value
  const cards = props.modelValue.filter((_, cardIndex) => cardIndex !== index)

  emit("update:modelValue", cards)
  activeTabId.value = Math.min(index, cards.length - 1)
}

function defaultImagePath(index: number, current: string) {
  const trimmed = current.trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  return `gallery/espaces/carte-${index + 1}.jpeg`
}

watch(
  () => props.modelValue.length,
  (length) => {
    if (activeTabId.value === GALLERY_CTA_TAB_ID) {
      return
    }

    if (typeof activeTabId.value === "number" && activeTabId.value >= length) {
      activeTabId.value = length > 0 ? length - 1 : GALLERY_CTA_TAB_ID
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-visual-cards">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Cartes visuelles</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addCard">
          <AdminIcon name="plus" :size="16" />
          Ajouter une carte
        </button>
      </div>

      <div class="admin-tabs-shell">
        <div class="admin-tabs admin-tabs--visual" role="tablist" aria-label="Cartes visuelles">
          <button
            v-for="tab in visualTabs"
            :key="String(tab.id)"
            type="button"
            role="tab"
            class="admin-tabs__btn"
            :class="{
              'admin-tabs__btn--gallery-cta': tab.isGalleryCta,
              'admin-tabs__btn--active': activeTabId === tab.id
            }"
            :aria-selected="activeTabId === tab.id"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div
        v-if="isCtaTabActive"
        class="admin-visual-cards__panel admin-visual-cards__panel--cta"
        role="tabpanel"
      >
        <header class="admin-visual-cards__panel-top">
          <div>
            <p class="admin-visual-cards__panel-kicker admin-visual-cards__panel-kicker--cta">
              Carte spéciale
            </p>
            <h4 class="admin-visual-cards__panel-title">Carte « Voir la galerie »</h4>
            <p class="admin-visual-cards__panel-lead">
              Ouvre la galerie complète au clic. Cette carte reste toujours en dernière position sur le site.
            </p>
          </div>
        </header>

        <div class="admin-visual-cards__cta-fields">
          <slot name="cta-fields" />
        </div>
      </div>

      <div v-else-if="activeCard" class="admin-visual-cards__panel" role="tabpanel">
        <header class="admin-visual-cards__panel-top">
          <div>
            <p class="admin-visual-cards__panel-kicker">Carte visuelle</p>
            <h4 class="admin-visual-cards__panel-title">
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

        <div class="admin-featured-space-row">
          <AdminImageUpload
            cover
            label="Image"
            :model-value="activeCard.image"
            :default-path="defaultImagePath(activeCardIndex, activeCard.image)"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="updateCard(activeCardIndex, { image: $event as string })"
          />
          <div class="admin-featured-space-row__fields">
            <AdminField
              label="Titre"
              full-width
              :model-value="activeCard.title"
              @update:model-value="updateCard(activeCardIndex, { title: $event as string })"
            />
            <AdminField
              label="Texte"
              type="textarea"
              :rows="3"
              full-width
              :model-value="activeCard.text"
              @update:model-value="updateCard(activeCardIndex, { text: $event as string })"
            />
          </div>
        </div>
      </div>

      <p v-else class="admin-visual-cards__empty">
        Aucune carte visuelle. Utilisez « Ajouter une carte » ou éditez la carte galerie.
      </p>
    </div>
  </div>
</template>
