<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import AdminNeighborhoodHighlightDeleteModal from "./AdminNeighborhoodHighlightDeleteModal.vue"
import AdminNeighborhoodHighlightEditModal from "./AdminNeighborhoodHighlightEditModal.vue"
import LocationHighlightIcon from "../LocationHighlightIcon.vue"
import { DEFAULT_LOCATION_HIGHLIGHT_ICON } from "../../data/location-highlight-icons"
import type { PropertyNeighborhoodHighlight } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyNeighborhoodHighlight[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyNeighborhoodHighlight[]]
}>()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptyItem(): PropertyNeighborhoodHighlight {
  return {
    icon: DEFAULT_LOCATION_HIGHLIGHT_ICON,
    title: "",
    text: ""
  }
}

const editingItem = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyItem()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyItem()
})

const deletingItem = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function itemTitle(item: PropertyNeighborhoodHighlight, index: number) {
  return item.title.trim() || `Point ${index + 1}`
}

function itemDescriptionPreview(item: PropertyNeighborhoodHighlight) {
  return item.text.trim() || "Aucune description"
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

function saveEdit(value: PropertyNeighborhoodHighlight) {
  if (!value.title.trim()) {
    return
  }

  const items = [...props.modelValue]

  if (isCreatingNew.value) {
    items.push(value)
  } else if (items[editingIndex.value]) {
    items[editingIndex.value] = value
  }

  emit("update:modelValue", items)
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

  const items = props.modelValue.filter((_, index) => index !== deletingIndex.value)

  emit("update:modelValue", items)
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

  const items = [...props.modelValue]
  const [moved] = items.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  items.splice(index, 0, moved)
  emit("update:modelValue", items)
  onDragEnd()
}
</script>

<template>
  <div class="admin-neighborhood-highlights">
    <div class="admin-subpanel__head admin-neighborhood-highlights__head">
      <h3>Points du quartier</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        Ajouter un point
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-neighborhood-highlights__empty">
      Aucun point. Utilisez « Ajouter un point » pour en créer un.
    </p>

    <ul v-else class="admin-neighborhood-highlights__list">
      <li
        v-for="(item, index) in modelValue"
        :key="`${index}-${item.title}-${item.icon}`"
        class="admin-neighborhood-highlights__item"
        :class="{
          'admin-neighborhood-highlights__item--dragging': dragIndex === index,
          'admin-neighborhood-highlights__item--drag-over':
            dragOverIndex === index && dragIndex !== index
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

        <div class="admin-neighborhood-highlights__item-icon" aria-hidden="true">
          <LocationHighlightIcon :name="item.icon" />
        </div>

        <div class="admin-neighborhood-highlights__item-body">
          <p class="admin-neighborhood-highlights__item-title">{{ itemTitle(item, index) }}</p>
          <p class="admin-neighborhood-highlights__item-text">{{ itemDescriptionPreview(item) }}</p>
        </div>

        <div class="admin-neighborhood-highlights__item-actions">
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

    <AdminNeighborhoodHighlightEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :item="editingItem"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminNeighborhoodHighlightDeleteModal
      :open="deleteModalOpen"
      :point-title="deletingItem ? itemTitle(deletingItem, deletingIndex ?? 0) : 'Ce point'"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
