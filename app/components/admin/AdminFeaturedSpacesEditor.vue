<script setup lang="ts">
import AdminFeaturedSpaceDeleteModal from "./AdminFeaturedSpaceDeleteModal.vue"
import AdminFeaturedSpaceEditModal from "./AdminFeaturedSpaceEditModal.vue"
import AdminIcon from "./AdminIcon.vue"
import { adminUiFormat } from "../../data/admin-ui"
import type { PropertyFeaturedSpace } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyFeaturedSpace[]
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyFeaturedSpace[]]
}>()

const { ui } = useAdminUi()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptySpace(): PropertyFeaturedSpace {
  return {
    title: "",
    text: "",
    image: "",
    tag: "",
    gallery_category_id: ""
  }
}

const editingSpace = computed(() => {
  if (isCreatingNew.value) {
    return createEmptySpace()
  }

  return props.modelValue[editingIndex.value] ?? createEmptySpace()
})

const deletingSpace = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function defaultImagePath(index: number, current: string) {
  const trimmed = current.trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  return `gallery/featured-${index + 1}.jpeg`
}

function cardImageSrc(space: PropertyFeaturedSpace, index: number) {
  const path = defaultImagePath(index, space.image)

  return path ? props.previewUrl(path) : ""
}

function cardTitle(space: PropertyFeaturedSpace, index: number) {
  return (
    space.title.trim() ||
    adminUiFormat(ui.value.editors.shared.cardFallback, { index: index + 1 })
  )
}

function cardDescriptionPreview(space: PropertyFeaturedSpace) {
  return space.text.trim() || ui.value.editors.shared.noDescription
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

function saveEdit(value: PropertyFeaturedSpace) {
  if (!value.title.trim() || !value.image.trim()) {
    return
  }

  const spaces = [...props.modelValue]

  if (isCreatingNew.value) {
    spaces.push(value)
  } else if (spaces[editingIndex.value]) {
    spaces[editingIndex.value] = value
  }

  emit("update:modelValue", spaces)
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

  const spaces = props.modelValue.filter((_, index) => index !== deletingIndex.value)

  emit("update:modelValue", spaces)
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

  const spaces = [...props.modelValue]
  const [moved] = spaces.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  spaces.splice(index, 0, moved)
  emit("update:modelValue", spaces)
  onDragEnd()
}
</script>

<template>
  <div class="admin-featured-spaces">
    <div class="admin-subpanel__head admin-featured-spaces__head">
      <h3>{{ ui.editors.featuredSpaces.title }}</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        {{ ui.editors.featuredSpaces.addButton }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-featured-spaces__empty">
      {{ ui.editors.featuredSpaces.empty }}
    </p>

    <ul v-else class="admin-featured-spaces__list">
      <li
        v-for="(space, index) in modelValue"
        :key="`${index}-${space.title}-${space.image}`"
        class="admin-featured-spaces__item"
        :class="{
          'admin-featured-spaces__item--dragging': dragIndex === index,
          'admin-featured-spaces__item--drag-over': dragOverIndex === index && dragIndex !== index
        }"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <button
          type="button"
          class="admin-sortable-list__drag-handle"
          :aria-label="ui.editors.shared.dragToReorder"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <div class="admin-featured-spaces__item-thumb" aria-hidden="true">
          <img
            v-if="cardImageSrc(space, index)"
            :src="cardImageSrc(space, index)"
            :alt="''"
            class="admin-featured-spaces__item-image"
          />
          <div v-else class="admin-featured-spaces__item-image admin-featured-spaces__item-image--empty" />
        </div>

        <div class="admin-featured-spaces__item-body">
          <p v-if="space.tag.trim()" class="admin-featured-spaces__item-tag">{{ space.tag }}</p>
          <p class="admin-featured-spaces__item-title">{{ cardTitle(space, index) }}</p>
          <p class="admin-featured-spaces__item-text">{{ cardDescriptionPreview(space) }}</p>
        </div>

        <div class="admin-featured-spaces__item-actions">
          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
            :aria-label="ui.editors.shared.edit"
            @click="openEdit(index)"
          >
            <AdminIcon name="pencil" :size="16" />
          </button>
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
            :aria-label="ui.common.delete"
            @click="openDelete(index)"
          >
            <AdminIcon name="trash" :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <AdminFeaturedSpaceEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :space="editingSpace"
      :card-index="editingIndex"
      :is-new="isCreatingNew"
      :upload="upload"
      :preview-url="previewUrl"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminFeaturedSpaceDeleteModal
      :open="deleteModalOpen"
      :card-title="deletingSpace ? cardTitle(deletingSpace, deletingIndex ?? 0) : ui.editors.shared.thisCard"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
