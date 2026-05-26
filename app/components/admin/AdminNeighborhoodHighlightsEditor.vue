<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminLocationHighlightIconPicker from "./AdminLocationHighlightIconPicker.vue"
import { DEFAULT_LOCATION_HIGHLIGHT_ICON } from "../../data/location-highlight-icons"
import type { PropertyNeighborhoodHighlight } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyNeighborhoodHighlight[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyNeighborhoodHighlight[]]
}>()

const activeIndex = ref(0)

const tabs = computed(() =>
  props.modelValue.map((item, index) => ({
    id: index,
    label: item.title.trim() || `Point ${index + 1}`
  }))
)

const activeItem = computed(() => props.modelValue[activeIndex.value])

const canRemoveActiveItem = computed(() => props.modelValue.length > 1)

function createEmptyItem(): PropertyNeighborhoodHighlight {
  return {
    icon: DEFAULT_LOCATION_HIGHLIGHT_ICON,
    title: "",
    text: ""
  }
}

function updateItem(index: number, partial: Partial<PropertyNeighborhoodHighlight>) {
  const items = [...props.modelValue]

  if (!items[index]) {
    return
  }

  items[index] = { ...items[index], ...partial }
  emit("update:modelValue", items)
}

function selectTab(index: number) {
  activeIndex.value = index
}

function addItem() {
  const items = [...props.modelValue, createEmptyItem()]

  emit("update:modelValue", items)
  activeIndex.value = items.length - 1
}

function removeActiveItem() {
  if (!canRemoveActiveItem.value) {
    return
  }

  const items = props.modelValue.filter((_, index) => index !== activeIndex.value)

  emit("update:modelValue", items)
  activeIndex.value = Math.min(activeIndex.value, items.length - 1)
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
  <div class="admin-neighborhood-highlights">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Points du quartier</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addItem">
          <AdminIcon name="plus" :size="16" />
          Ajouter un point
        </button>
      </div>

      <p v-if="!modelValue.length" class="admin-neighborhood-highlights__empty">
        Aucun point. Ajoutez au moins un point pour l’afficher sur le site.
      </p>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Points du quartier">
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

        <div v-if="activeItem" class="admin-neighborhood-highlights__panel" role="tabpanel">
          <header class="admin-neighborhood-highlights__panel-top">
            <div>
              <p class="admin-neighborhood-highlights__panel-kicker">Point du quartier</p>
              <h4 class="admin-neighborhood-highlights__panel-title">
                {{ activeItem.title.trim() || "Sans titre" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveItem"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveItem"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-benefit-card-row">
            <AdminLocationHighlightIconPicker
              :model-value="activeItem.icon"
              @update:model-value="updateItem(activeIndex, { icon: $event })"
            />
            <div class="admin-benefit-card-row__fields">
              <AdminField
                label="Titre"
                full-width
                :model-value="activeItem.title"
                @update:model-value="updateItem(activeIndex, { title: $event as string })"
              />
              <AdminField
                label="Texte"
                type="textarea"
                :rows="3"
                full-width
                :model-value="activeItem.text"
                @update:model-value="updateItem(activeIndex, { text: $event as string })"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
