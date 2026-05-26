<script setup lang="ts">
import AdminAmenityIconPicker from "./AdminAmenityIconPicker.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import { DEFAULT_AMENITY_ICON } from "../../data/amenity-icons"
import { withAmenityPreviewHasMore } from "../../utils/amenity-preview"
import type { AmenityItem, AmenityPreviewSection } from "../../types/amenity"

const props = defineProps<{
  modelValue: AmenityPreviewSection[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: AmenityPreviewSection[]]
}>()

const activeSectionIndex = ref(0)

const sectionTabs = computed(() =>
  props.modelValue.map((section, index) => ({
    id: index,
    label: section.title.trim() || `Carte ${index + 1}`
  }))
)

const activeSection = computed(() => props.modelValue[activeSectionIndex.value])

const canRemoveActiveSection = computed(() => props.modelValue.length > 1)

function createAmenityId() {
  return `amenity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyItem(): AmenityItem {
  return {
    id: createAmenityId(),
    icon: DEFAULT_AMENITY_ICON,
    name: ""
  }
}

function createEmptySection(): AmenityPreviewSection {
  return {
    id: `preview-${Date.now()}`,
    title: "",
    items: [createEmptyItem()],
    hasMore: false
  }
}

function updateSections(sections: AmenityPreviewSection[]) {
  emit("update:modelValue", withAmenityPreviewHasMore(sections))
}

function updateActiveSection(partial: Partial<AmenityPreviewSection>) {
  const sections = [...props.modelValue]

  if (!sections[activeSectionIndex.value]) {
    return
  }

  sections[activeSectionIndex.value] = { ...sections[activeSectionIndex.value], ...partial }
  updateSections(sections)
}

function updateItem(itemIndex: number, partial: Partial<AmenityItem>) {
  const sections = [...props.modelValue]
  const section = sections[activeSectionIndex.value]

  if (!section?.items[itemIndex]) {
    return
  }

  const items = [...section.items]
  items[itemIndex] = { ...items[itemIndex], ...partial }
  sections[activeSectionIndex.value] = { ...section, items }
  updateSections(sections)
}

function selectSection(index: number) {
  activeSectionIndex.value = index
}

function addSection() {
  const sections = [...props.modelValue, createEmptySection()]
  updateSections(sections)
  activeSectionIndex.value = sections.length - 1
}

function removeActiveSection() {
  if (!canRemoveActiveSection.value) {
    return
  }

  const sections = props.modelValue.filter((_, index) => index !== activeSectionIndex.value)
  updateSections(sections)
  activeSectionIndex.value = Math.min(activeSectionIndex.value, sections.length - 1)
}

function addItem() {
  const sections = [...props.modelValue]
  const section = sections[activeSectionIndex.value]

  if (!section) {
    return
  }

  sections[activeSectionIndex.value] = {
    ...section,
    items: [...section.items, createEmptyItem()]
  }
  updateSections(sections)
}

function removeItem(itemIndex: number) {
  const sections = [...props.modelValue]
  const section = sections[activeSectionIndex.value]

  if (!section || section.items.length <= 1) {
    return
  }

  sections[activeSectionIndex.value] = {
    ...section,
    items: section.items.filter((_, index) => index !== itemIndex)
  }
  updateSections(sections)
}

watch(
  sectionTabs,
  (tabs) => {
    if (activeSectionIndex.value < tabs.length) {
      return
    }

    activeSectionIndex.value = Math.max(0, tabs.length - 1)
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-amenities-preview-editor">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Cartes équipements</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addSection">
          <AdminIcon name="plus" :size="16" />
          Ajouter une carte
        </button>
      </div>

      <p class="admin-amenities-preview-editor__lead">
        Grille affichée sur la page (2 colonnes). « Voir la suite » s’affiche automatiquement à partir de
        6 équipements dans une carte.
      </p>

      <p v-if="!modelValue.length" class="admin-amenities-preview-editor__empty">
        Aucune carte. Ajoutez au moins une carte pour l’aperçu.
      </p>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Cartes équipements">
            <button
              v-for="tab in sectionTabs"
              :key="String(tab.id)"
              type="button"
              role="tab"
              class="admin-tabs__btn"
              :class="{ 'admin-tabs__btn--active': activeSectionIndex === tab.id }"
              :aria-selected="activeSectionIndex === tab.id"
              @click="selectSection(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="activeSection" class="admin-amenities-preview-editor__panel" role="tabpanel">
          <header class="admin-amenities-preview-editor__panel-top">
            <div>
              <p class="admin-amenities-preview-editor__panel-kicker">Carte</p>
              <h4 class="admin-amenities-preview-editor__panel-title">
                {{ activeSection.title.trim() || "Sans titre" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveSection"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveSection"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <AdminField
            label="Titre de la carte"
            full-width
            :model-value="activeSection.title"
            @update:model-value="updateActiveSection({ title: $event as string })"
          />

          <div class="admin-amenities-preview-editor__items-head">
            <h5>Équipements</h5>
            <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addItem">
              <AdminIcon name="plus" :size="16" />
              Ajouter
            </button>
          </div>

          <ul class="admin-amenities-preview-editor__items">
            <li
              v-for="(item, itemIndex) in activeSection.items"
              :key="`${item.id}-${itemIndex}`"
              class="admin-amenities-preview-editor__item"
            >
              <div class="admin-amenities-preview-editor__item-row">
                <AdminAmenityIconPicker
                  inline
                  :model-value="item.icon"
                  @update:model-value="updateItem(itemIndex, { icon: $event as string })"
                />
                <input
                  class="admin-amenities-preview-editor__item-name"
                  type="text"
                  :value="item.name"
                  placeholder="Nom de l’équipement"
                  :aria-label="`Nom — ${item.name || 'équipement'}`"
                  @input="updateItem(itemIndex, { name: ($event.target as HTMLInputElement).value })"
                />
                <button
                  v-if="activeSection.items.length > 1"
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-amenities-preview-editor__item-remove"
                  :aria-label="`Supprimer ${item.name || 'équipement'}`"
                  @click="removeItem(itemIndex)"
                >
                  <AdminIcon name="trash" :size="16" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
