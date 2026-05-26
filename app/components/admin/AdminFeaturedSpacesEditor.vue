<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import type { PropertyFeaturedSpace } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyFeaturedSpace[]
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyFeaturedSpace[]]
}>()

/** Les 3 premières cartes (principale + 2 secondaires) ne peuvent pas être supprimées. */
const PROTECTED_FEATURED_COUNT = 3

const activeIndex = ref(0)

const tabs = computed(() =>
  props.modelValue.map((space, index) => ({
    id: index,
    label: space.tag.trim() || `Carte ${index + 1}`
  }))
)

const activeSpace = computed(() => props.modelValue[activeIndex.value])

const isMainCard = computed(() => activeIndex.value === 0)

const canRemoveActiveSpace = computed(() => activeIndex.value >= PROTECTED_FEATURED_COUNT)

function createEmptySpace(): PropertyFeaturedSpace {
  return {
    title: "",
    text: "",
    image: "",
    tag: "",
    gallery_category_id: ""
  }
}

function updateSpace(index: number, partial: Partial<PropertyFeaturedSpace>) {
  const spaces = [...props.modelValue]

  if (!spaces[index]) {
    return
  }

  spaces[index] = { ...spaces[index], ...partial }
  emit("update:modelValue", spaces)
}

function selectTab(index: number) {
  activeIndex.value = index
}

function addSpace() {
  const spaces = [...props.modelValue, createEmptySpace()]

  emit("update:modelValue", spaces)
  activeIndex.value = spaces.length - 1
}

function removeActiveSpace() {
  if (!canRemoveActiveSpace.value) {
    return
  }

  const spaces = props.modelValue.filter((_, index) => index !== activeIndex.value)

  emit("update:modelValue", spaces)
  activeIndex.value = Math.min(activeIndex.value, spaces.length - 1)
}

function defaultImagePath(index: number, current: string) {
  const trimmed = current.trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  return `gallery/featured-${index + 1}.jpeg`
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
  <div class="admin-featured-spaces">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Espaces mis en avant</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addSpace">
          <AdminIcon name="plus" :size="16" />
          Ajouter une carte
        </button>
      </div>

      <div v-if="!modelValue.length" class="admin-featured-spaces__empty">
        Aucune carte. Ajoutez au moins un espace pour l’afficher sur le site.
      </div>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Cartes espaces">
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

        <div v-if="activeSpace" class="admin-featured-spaces__panel" role="tabpanel">
          <header class="admin-featured-spaces__panel-top">
            <div>
              <p class="admin-featured-spaces__panel-kicker">
                {{ isMainCard ? "Grande carte" : "Carte secondaire" }}
              </p>
              <h4 class="admin-featured-spaces__panel-title">
                {{ activeSpace.title.trim() || "Sans titre" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveSpace"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveSpace"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-featured-space-row">
            <AdminImageUpload
              cover
              label="Image"
              :model-value="activeSpace.image"
              :default-path="defaultImagePath(activeIndex, activeSpace.image)"
              :upload="upload"
              :preview-url="previewUrl"
              @update:model-value="updateSpace(activeIndex, { image: $event as string })"
            />
            <div class="admin-featured-space-row__fields">
              <div class="admin-grid admin-grid--2 admin-featured-space-row__pair">
                <AdminField
                  label="Tag"
                  :model-value="activeSpace.tag"
                  @update:model-value="updateSpace(activeIndex, { tag: $event as string })"
                />
                <AdminField
                  label="Titre"
                  :model-value="activeSpace.title"
                  @update:model-value="updateSpace(activeIndex, { title: $event as string })"
                />
              </div>
              <AdminField
                label="Texte"
                type="textarea"
                :rows="3"
                full-width
                :model-value="activeSpace.text"
                @update:model-value="updateSpace(activeIndex, { text: $event as string })"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
