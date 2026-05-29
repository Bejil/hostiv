<script setup lang="ts">
import AdminHouseRuleDeleteModal from "./AdminHouseRuleDeleteModal.vue"
import AdminHouseRuleEditModal from "./AdminHouseRuleEditModal.vue"
import AdminIcon from "./AdminIcon.vue"
import type { PropertyHouseRule } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyHouseRule[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyHouseRule[]]
}>()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref(0)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptyRule(): PropertyHouseRule {
  return {
    title: "",
    text: ""
  }
}

const editingRule = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyRule()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyRule()
})

const deletingRule = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function ruleTitle(rule: PropertyHouseRule, index: number) {
  return rule.title.trim() || `Règle ${index + 1}`
}

function ruleTextPreview(rule: PropertyHouseRule) {
  return rule.text.trim() || "Aucun texte"
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

function saveEdit(value: PropertyHouseRule) {
  if (!value.title.trim() || !value.text.trim()) {
    return
  }

  const rules = [...props.modelValue]

  if (isCreatingNew.value) {
    rules.push(value)
  } else if (rules[editingIndex.value]) {
    rules[editingIndex.value] = value
  }

  emit("update:modelValue", rules)
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

  const rules = [...props.modelValue]
  const [moved] = rules.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  rules.splice(index, 0, moved)
  emit("update:modelValue", rules)
  onDragEnd()
}
</script>

<template>
  <div class="admin-house-rules">
    <div class="admin-subpanel__head admin-house-rules__head">
      <h3>Règles de la maison</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        Ajouter une règle
      </button>
    </div>

    <p class="admin-house-rules__lead">
      Cartes affichées en grille sur la page (2 colonnes).
    </p>

    <p v-if="!modelValue.length" class="admin-house-rules__empty">
      Aucune règle. Utilisez « Ajouter une règle » pour en créer une.
    </p>

    <ul v-else class="admin-house-rules__list">
      <li
        v-for="(rule, index) in modelValue"
        :key="`${index}-${rule.title}`"
        class="admin-house-rules__item"
        :class="{
          'admin-house-rules__item--dragging': dragIndex === index,
          'admin-house-rules__item--drag-over': dragOverIndex === index && dragIndex !== index
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

        <div class="admin-house-rules__item-body">
          <p class="admin-house-rules__item-title">{{ ruleTitle(rule, index) }}</p>
          <p class="admin-house-rules__item-text">{{ ruleTextPreview(rule) }}</p>
        </div>

        <div class="admin-house-rules__item-actions">
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

    <AdminHouseRuleEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :rule="editingRule"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminHouseRuleDeleteModal
      :open="deleteModalOpen"
      :rule-title="deletingRule ? ruleTitle(deletingRule, deletingIndex ?? 0) : 'Cette règle'"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
