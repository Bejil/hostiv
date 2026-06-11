<script setup lang="ts">
import AdminBenefitCardDeleteModal from "./AdminBenefitCardDeleteModal.vue"
import AdminBenefitCardEditModal from "./AdminBenefitCardEditModal.vue"
import AdminBenefitIcon from "./AdminBenefitIcon.vue"
import AdminIcon from "./AdminIcon.vue"
import { adminUiFormat } from "../../data/admin-ui"
import { DEFAULT_BENEFIT_ICON } from "../../data/benefit-icons"
import type { PropertyBenefitCard } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyBenefitCard[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyBenefitCard[]]
}>()

const { ui } = useAdminUi()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptyCard(): PropertyBenefitCard {
  return {
    icon: DEFAULT_BENEFIT_ICON,
    title: "",
    text: ""
  }
}

const editingCard = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyCard()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyCard()
})

const deletingCard = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function cardTitle(card: PropertyBenefitCard, index: number) {
  return (
    card.title.trim() ||
    adminUiFormat(ui.value.editors.shared.benefitFallback, { index: index + 1 })
  )
}

function cardDescriptionPreview(card: PropertyBenefitCard) {
  return card.text.trim() || ui.value.editors.shared.noDescription
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

function saveEdit(value: PropertyBenefitCard) {
  if (!value.title.trim()) {
    return
  }

  const cards = [...props.modelValue]

  if (isCreatingNew.value) {
    cards.push(value)
  } else if (cards[editingIndex.value]) {
    cards[editingIndex.value] = value
  }

  emit("update:modelValue", cards)
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

  const cards = props.modelValue.filter((_, index) => index !== deletingIndex.value)

  emit("update:modelValue", cards)
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

  const cards = [...props.modelValue]
  const [moved] = cards.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  cards.splice(index, 0, moved)
  emit("update:modelValue", cards)
  onDragEnd()
}
</script>

<template>
  <div class="admin-benefit-cards">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <h3>{{ ui.editors.benefitCards.title }}</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        {{ ui.editors.benefitCards.addButton }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.editors.benefitCards.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(card, index) in modelValue"
        :key="`${index}-${card.title}-${card.icon}`"
        class="admin-benefit-cards__item"
        :class="{
          'admin-benefit-cards__item--dragging': dragIndex === index,
          'admin-benefit-cards__item--drag-over': dragOverIndex === index && dragIndex !== index
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

        <div class="admin-benefit-cards__item-icon" aria-hidden="true">
          <AdminBenefitIcon :icon="card.icon" />
        </div>

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ cardTitle(card, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ cardDescriptionPreview(card) }}</p>
        </div>

        <div class="admin-benefit-cards__item-actions">
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

    <AdminBenefitCardEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :card="editingCard"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminBenefitCardDeleteModal
      :open="deleteModalOpen"
      :card-title="deletingCard ? cardTitle(deletingCard, deletingIndex ?? 0) : ui.editors.shared.thisBenefit"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
