<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuideRuleDeleteModal from "./AdminWelcomeGuideRuleDeleteModal.vue"
import AdminWelcomeGuideRuleEditModal from "./AdminWelcomeGuideRuleEditModal.vue"
import AdminWelcomeGuideRuleIcon from "./AdminWelcomeGuideRuleIcon.vue"
import AdminWelcomeGuideRulesLimitModal from "./AdminWelcomeGuideRulesLimitModal.vue"
import type { WelcomeGuideRule } from "../../types/welcome-guide"
import {
  DEFAULT_WELCOME_GUIDE_RULE_ICON,
  normalizeWelcomeGuideRuleIcon
} from "../../data/welcome-guide-rule-icons"
import { WELCOME_GUIDE_MAX_RULE_COUNT } from "../../utils/welcome-guide-content"

const props = defineProps<{
  modelValue: WelcomeGuideRule[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuideRule[]]
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

function createEmptyRule(): WelcomeGuideRule {
  return {
    icon: DEFAULT_WELCOME_GUIDE_RULE_ICON,
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

function ruleTitle(rule: WelcomeGuideRule, index: number) {
  return rule.title.trim() || adminUiFormat(ui.value.welcomeGuide.rules.fallback, { index: index + 1 })
}

function ruleDescriptionPreview(rule: WelcomeGuideRule) {
  return rule.text.trim() || ui.value.common.noDescription
}

function openAdd() {
  if (props.modelValue.length >= WELCOME_GUIDE_MAX_RULE_COUNT) {
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

function saveEdit(value: WelcomeGuideRule) {
  if (!value.title.trim() || !value.text.trim()) {
    return
  }

  const rules = [...props.modelValue]
  const next: WelcomeGuideRule = {
    icon: normalizeWelcomeGuideRuleIcon(value.icon, DEFAULT_WELCOME_GUIDE_RULE_ICON),
    title: value.title.trim(),
    text: value.text.trim()
  }

  if (isCreatingNew.value) {
    if (rules.length >= WELCOME_GUIDE_MAX_RULE_COUNT) {
      limitModalOpen.value = true
      return
    }

    rules.push(next)
  } else if (rules[editingIndex.value]) {
    rules[editingIndex.value] = next
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
  <div class="admin-benefit-cards admin-welcome-guide-rules">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <h3>{{ ui.welcomeGuide.rules.heading }}</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        {{ ui.welcomeGuide.rules.add }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.welcomeGuide.rules.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(rule, index) in modelValue"
        :key="`${index}-${rule.title}-${rule.icon}`"
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

        <div class="admin-benefit-cards__item-icon" aria-hidden="true">
          <AdminWelcomeGuideRuleIcon :icon="rule.icon" />
        </div>

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ ruleTitle(rule, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ ruleDescriptionPreview(rule) }}</p>
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

    <AdminWelcomeGuideRuleEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :rule="editingRule"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminWelcomeGuideRuleDeleteModal
      :open="deleteModalOpen"
      :rule-title="deletingRule ? ruleTitle(deletingRule, deletingIndex ?? 0) : ui.welcomeGuide.rules.thisRule"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />

    <AdminWelcomeGuideRulesLimitModal :open="limitModalOpen" @close="closeLimitModal" />
  </div>
</template>
