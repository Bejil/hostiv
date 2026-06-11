<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuideDiningDeleteModal from "./AdminWelcomeGuideDiningDeleteModal.vue"
import AdminWelcomeGuideDiningEditModal from "./AdminWelcomeGuideDiningEditModal.vue"
import AdminWelcomeGuideDiningLimitModal from "./AdminWelcomeGuideDiningLimitModal.vue"
import type { WelcomeGuideDiningSpot } from "../../types/welcome-guide"
import { WELCOME_GUIDE_MAX_DINING_COUNT } from "../../utils/welcome-guide-content"

const props = defineProps<{
  modelValue: WelcomeGuideDiningSpot[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuideDiningSpot[]]
}>()

const { ui } = useAdminUi()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const limitModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptyContact(): WelcomeGuideDiningSpot {
  return {
    title: "",
    description: "",
    text: "",
    note: ""
  }
}

const editingContact = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyContact()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyContact()
})

const deletingContact = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function spotTitle(spot: WelcomeGuideDiningSpot, index: number) {
  return spot.title.trim() || adminUiFormat(ui.value.welcomeGuide.dining.fallback, { index: index + 1 })
}

function spotDescriptionPreview(spot: WelcomeGuideDiningSpot) {
  return spot.description.trim() || ui.value.common.noDescription
}

function spotAddressPreview(spot: WelcomeGuideDiningSpot) {
  return spot.text.trim() || ui.value.common.noAddress
}

const headMeta = computed(() =>
  adminUiFormat(ui.value.common.maxCount, {
    current: props.modelValue.length,
    max: WELCOME_GUIDE_MAX_DINING_COUNT
  })
)

function openAdd() {
  if (props.modelValue.length >= WELCOME_GUIDE_MAX_DINING_COUNT) {
    limitModalOpen.value = true
    return
  }

  isCreatingNew.value = true
  editingIndex.value = props.modelValue.length
  editModalOpen.value = true
}

function closeLimitModal() {
  limitModalOpen.value = false
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

function saveEdit(value: WelcomeGuideDiningSpot) {
  if (!value.title.trim() || !value.description.trim() || !value.text.trim()) {
    return
  }

  const contacts = [...props.modelValue]
  const next: WelcomeGuideDiningSpot = {
    title: value.title.trim(),
    description: value.description.trim(),
    text: value.text.trim(),
    note: value.note.trim()
  }

  if (isCreatingNew.value) {
    if (contacts.length >= WELCOME_GUIDE_MAX_DINING_COUNT) {
      limitModalOpen.value = true
      return
    }

    contacts.push(next)
  } else if (contacts[editingIndex.value]) {
    contacts[editingIndex.value] = next
  }

  emit("update:modelValue", contacts)
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

  const contacts = [...props.modelValue]
  contacts.splice(deletingIndex.value, 1)
  emit("update:modelValue", contacts)
  closeDelete()
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index

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

  if (dragIndex.value === null || dragIndex.value === index) {
    return
  }

  dragOverIndex.value = index
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()
  const from = dragIndex.value

  if (from === null || from === index) {
    onDragEnd()
    return
  }

  const contacts = [...props.modelValue]
  const [moved] = contacts.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  contacts.splice(index, 0, moved)
  emit("update:modelValue", contacts)
  onDragEnd()
}
</script>

<template>
  <div class="admin-benefit-cards admin-welcome-guide-dining">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <div class="admin-benefit-cards__head-copy">
        <h3>{{ ui.welcomeGuide.dining.heading }}</h3>
        <p class="admin-benefit-cards__head-meta">{{ headMeta }}</p>
      </div>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        @click="openAdd"
      >
        <AdminIcon name="plus" :size="16" />
        {{ ui.welcomeGuide.dining.add }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.welcomeGuide.dining.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(spot, index) in modelValue"
        :key="`${index}-${spot.title}-${spot.description}-${spot.text}-${spot.note}`"
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
          :aria-label="ui.common.dragToReorder"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        />

        <div
          class="admin-benefit-cards__item-icon admin-welcome-guide-dining__item-num"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </div>

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ spotTitle(spot, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ spotDescriptionPreview(spot) }}</p>
          <p class="admin-benefit-cards__item-text admin-welcome-guide-dining__item-address">
            {{ spotAddressPreview(spot) }}
          </p>
          <p
            v-if="spot.note.trim()"
            class="admin-benefit-cards__item-text admin-welcome-guide-dining__item-note"
          >
            {{ spot.note.trim() }}
          </p>
        </div>

        <div class="admin-benefit-cards__item-actions">
          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
            :aria-label="ui.common.edit"
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

    <AdminWelcomeGuideDiningEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :contact="editingContact"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminWelcomeGuideDiningDeleteModal
      :open="deleteModalOpen"
      :spot-title="deletingContact ? spotTitle(deletingContact, deletingIndex ?? 0) : ui.welcomeGuide.dining.thisSpot"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />

    <AdminWelcomeGuideDiningLimitModal :open="limitModalOpen" @close="closeLimitModal" />
  </div>
</template>
