<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuideEmergencyDeleteModal from "./AdminWelcomeGuideEmergencyDeleteModal.vue"
import AdminWelcomeGuideEmergencyEditModal from "./AdminWelcomeGuideEmergencyEditModal.vue"
import AdminWelcomeGuideEmergencyLimitModal from "./AdminWelcomeGuideEmergencyLimitModal.vue"
import type { WelcomeGuideEmergencyContact } from "../../types/welcome-guide"
import { WELCOME_GUIDE_MAX_EMERGENCY_COUNT } from "../../utils/welcome-guide-content"

const props = defineProps<{
  modelValue: WelcomeGuideEmergencyContact[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuideEmergencyContact[]]
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

function createEmptyContact(): WelcomeGuideEmergencyContact {
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

function contactTitle(contact: WelcomeGuideEmergencyContact, index: number) {
  return contact.title.trim() || adminUiFormat(ui.value.welcomeGuide.emergency.fallback, { index: index + 1 })
}

function contactDescriptionPreview(contact: WelcomeGuideEmergencyContact) {
  return contact.description.trim() || ui.value.common.noDescription
}

function contactNumberPreview(contact: WelcomeGuideEmergencyContact) {
  return contact.text.trim() || ui.value.common.noNumber
}

const headMeta = computed(() =>
  adminUiFormat(ui.value.common.maxCount, {
    current: props.modelValue.length,
    max: WELCOME_GUIDE_MAX_EMERGENCY_COUNT
  })
)

function openAdd() {
  if (props.modelValue.length >= WELCOME_GUIDE_MAX_EMERGENCY_COUNT) {
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

function saveEdit(value: WelcomeGuideEmergencyContact) {
  if (!value.title.trim() || !value.description.trim() || !value.text.trim()) {
    return
  }

  const contacts = [...props.modelValue]
  const next: WelcomeGuideEmergencyContact = {
    title: value.title.trim(),
    description: value.description.trim(),
    text: value.text.trim(),
    note: value.note.trim()
  }

  if (isCreatingNew.value) {
    if (contacts.length >= WELCOME_GUIDE_MAX_EMERGENCY_COUNT) {
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
  <div class="admin-benefit-cards admin-welcome-guide-emergency">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <div class="admin-benefit-cards__head-copy">
        <h3>{{ ui.welcomeGuide.emergency.heading }}</h3>
        <p class="admin-benefit-cards__head-meta">{{ headMeta }}</p>
      </div>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        @click="openAdd"
      >
        <AdminIcon name="plus" :size="16" />
        {{ ui.welcomeGuide.emergency.add }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.welcomeGuide.emergency.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(contact, index) in modelValue"
        :key="`${index}-${contact.title}-${contact.description}-${contact.text}-${contact.note}`"
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
          class="admin-benefit-cards__item-icon admin-welcome-guide-emergency__item-num"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </div>

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ contactTitle(contact, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ contactDescriptionPreview(contact) }}</p>
          <p class="admin-benefit-cards__item-text admin-welcome-guide-emergency__item-phone">
            {{ contactNumberPreview(contact) }}
          </p>
          <p
            v-if="contact.note.trim()"
            class="admin-benefit-cards__item-text admin-welcome-guide-emergency__item-note"
          >
            {{ contact.note.trim() }}
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

    <AdminWelcomeGuideEmergencyEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :contact="editingContact"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminWelcomeGuideEmergencyDeleteModal
      :open="deleteModalOpen"
      :contact-title="deletingContact ? contactTitle(deletingContact, deletingIndex ?? 0) : ui.welcomeGuide.emergency.thisContact"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />

    <AdminWelcomeGuideEmergencyLimitModal :open="limitModalOpen" @close="closeLimitModal" />
  </div>
</template>
