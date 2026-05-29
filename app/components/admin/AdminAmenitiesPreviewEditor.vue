<script setup lang="ts">
import AdminAmenitySectionDeleteModal from "./AdminAmenitySectionDeleteModal.vue"
import AdminAmenitySectionEditModal from "./AdminAmenitySectionEditModal.vue"
import AdminIcon from "./AdminIcon.vue"
import {
  AMENITY_CARD_VISIBLE_LIMIT,
  withAmenityPreviewHasMore
} from "../../utils/amenity-preview"
import type { AmenityPreviewSection } from "../../types/amenity"

const props = defineProps<{
  modelValue: AmenityPreviewSection[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: AmenityPreviewSection[]]
}>()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createSectionId() {
  return `preview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptySection(): AmenityPreviewSection {
  return {
    id: createSectionId(),
    title: "",
    items: [],
    hasMore: false
  }
}

const editingSection = computed(() => {
  if (isCreatingNew.value) {
    return createEmptySection()
  }

  return props.modelValue[editingIndex.value] ?? createEmptySection()
})

const deletingSection = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function updateSections(sections: AmenityPreviewSection[]) {
  emit("update:modelValue", withAmenityPreviewHasMore(sections))
}

function sectionTitle(section: AmenityPreviewSection, index: number) {
  return section.title.trim() || `Carte ${index + 1}`
}

function sectionMeta(section: AmenityPreviewSection) {
  const count = section.items.filter((item) => item.name.trim()).length

  if (!count) {
    return "Aucun équipement"
  }

  return count === 1 ? "1 équipement" : `${count} équipements`
}

function openAdd() {
  isCreatingNew.value = true
  editingIndex.value = props.modelValue.length
  editModalOpen.value = true
}

function openEdit(index: number) {
  isCreatingNew.value = false
  editingIndex.value = index
  editModalOpen.value = true
}

function closeEdit() {
  editModalOpen.value = false
  isCreatingNew.value = false
}

function saveEdit(value: AmenityPreviewSection) {
  if (!value.title.trim() || !value.items.some((item) => item.name.trim())) {
    return
  }

  const sections = [...props.modelValue]

  if (isCreatingNew.value) {
    sections.push(value)
  } else if (sections[editingIndex.value]) {
    sections[editingIndex.value] = value
  }

  updateSections(sections)
  closeEdit()
}

function openDelete(index: number) {
  deletingIndex.value = index
  deleteModalOpen.value = true
}

function closeDelete() {
  deleteModalOpen.value = false
  deletingIndex.value = null
}

function confirmDelete() {
  if (deletingIndex.value === null) {
    return
  }

  updateSections(props.modelValue.filter((_, index) => index !== deletingIndex.value))
  closeDelete()
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  dragOverIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(index))
  }
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }

  dragOverIndex.value = index
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()

  const from =
    dragIndex.value ?? Number.parseInt(event.dataTransfer?.getData("text/plain") ?? "", 10)

  if (!Number.isFinite(from) || from === index) {
    onDragEnd()
    return
  }

  const sections = [...props.modelValue]
  const [moved] = sections.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  sections.splice(index, 0, moved)
  updateSections(sections)
  onDragEnd()
}
</script>

<template>
  <div class="admin-amenities-sections">
    <div class="admin-subpanel__head admin-amenities-sections__head">
      <h3>Cartes équipements</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        Ajouter une carte
      </button>
    </div>

    <p class="admin-amenities-sections__lead">
      Grille affichée sur la page (2 colonnes). « Voir la suite » s’affiche automatiquement à partir de
      {{ AMENITY_CARD_VISIBLE_LIMIT + 1 }} équipements dans une carte.
    </p>

    <p v-if="!modelValue.length" class="admin-amenities-sections__empty">
      Aucune carte. Utilisez « Ajouter une carte » pour en créer une.
    </p>

    <ul v-else class="admin-amenities-sections__list">
      <li
        v-for="(section, index) in modelValue"
        :key="`${section.id}-${index}`"
        class="admin-amenities-sections__item"
        :class="{
          'admin-amenities-sections__item--dragging': dragIndex === index,
          'admin-amenities-sections__item--drag-over': dragOverIndex === index && dragIndex !== index
        }"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <button
          type="button"
          class="admin-sortable-list__drag-handle"
          aria-label="Glisser pour réordonner"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <div class="admin-amenities-sections__item-body">
          <p class="admin-amenities-sections__item-title">{{ sectionTitle(section, index) }}</p>
          <p class="admin-amenities-sections__item-meta">{{ sectionMeta(section) }}</p>
        </div>

        <div class="admin-amenities-sections__item-actions">
          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
            aria-label="Modifier"
            @click="openEdit(index)"
          >
            <AdminIcon name="pencil" :size="16" />
          </button>
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
            aria-label="Supprimer"
            @click="openDelete(index)"
          >
            <AdminIcon name="trash" :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <AdminAmenitySectionEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :section="editingSection"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminAmenitySectionDeleteModal
      :open="deleteModalOpen"
      :section-title="
        deletingSection ? sectionTitle(deletingSection, deletingIndex ?? 0) : 'Cette carte'
      "
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
