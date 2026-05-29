<script setup lang="ts">
import AdminReviewDeleteModal from "./AdminReviewDeleteModal.vue"
import AdminReviewEditModal from "./AdminReviewEditModal.vue"
import AdminIcon from "./AdminIcon.vue"
import type { PropertyReview } from "../../types/property-site"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  modelValue: PropertyReview[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyReview[]]
}>()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createReviewId() {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyReview(): PropertyReview {
  return {
    id: createReviewId(),
    author: "",
    date: "",
    quote: "",
    rating: "5/5"
  }
}

const editingReview = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyReview()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyReview()
})

const deletingReview = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function reviewTitle(review: PropertyReview, index: number) {
  return review.author.trim() || `Verbatim ${index + 1}`
}

function reviewQuotePreview(review: PropertyReview) {
  const quote = review.quote.trim()

  return quote || "Aucune citation"
}

function reviewMeta(review: PropertyReview) {
  const stars = ratingToStars(review.rating)
  const date = review.date.trim()

  if (stars && date) {
    return `${stars} · ${date}`
  }

  return stars || date || "Sans note ni date"
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

function saveEdit(value: PropertyReview) {
  if (!value.author.trim() || !value.quote.trim()) {
    return
  }

  const reviews = [...props.modelValue]

  if (isCreatingNew.value) {
    reviews.push(value)
  } else if (reviews[editingIndex.value]) {
    reviews[editingIndex.value] = value
  }

  emit("update:modelValue", reviews)
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

  emit(
    "update:modelValue",
    props.modelValue.filter((_, index) => index !== deletingIndex.value)
  )
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

  const reviews = [...props.modelValue]
  const [moved] = reviews.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  reviews.splice(index, 0, moved)
  emit("update:modelValue", reviews)
  onDragEnd()
}
</script>

<template>
  <div class="admin-reviews-list">
    <div class="admin-subpanel__head admin-reviews-list__head">
      <h3>Verbatims</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        Ajouter un verbatim
      </button>
    </div>

    <p class="admin-reviews-list__lead">
      Les avis défilent en carrousel sur la page.
    </p>

    <p v-if="!modelValue.length" class="admin-reviews-list__empty">
      Aucun verbatim. Utilisez « Ajouter un verbatim » pour en créer un.
    </p>

    <ul v-else class="admin-reviews-list__items">
      <li
        v-for="(review, index) in modelValue"
        :key="`${review.id}-${index}`"
        class="admin-reviews-list__item"
        :class="{
          'admin-reviews-list__item--dragging': dragIndex === index,
          'admin-reviews-list__item--drag-over': dragOverIndex === index && dragIndex !== index
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

        <div class="admin-reviews-list__item-body">
          <p class="admin-reviews-list__item-title">{{ reviewTitle(review, index) }}</p>
          <p class="admin-reviews-list__item-text">{{ reviewQuotePreview(review) }}</p>
          <p class="admin-reviews-list__item-meta">{{ reviewMeta(review) }}</p>
        </div>

        <div class="admin-reviews-list__item-actions">
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

    <AdminReviewEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :review="editingReview"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminReviewDeleteModal
      :open="deleteModalOpen"
      :review-author="
        deletingReview ? reviewTitle(deletingReview, deletingIndex ?? 0) : 'Cet auteur'
      "
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
