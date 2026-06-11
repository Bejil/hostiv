<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuideCheckoutDeleteModal from "./AdminWelcomeGuideCheckoutDeleteModal.vue"
import AdminWelcomeGuideCheckoutEditModal from "./AdminWelcomeGuideCheckoutEditModal.vue"
import AdminWelcomeGuideRuleIcon from "./AdminWelcomeGuideRuleIcon.vue"
import AdminWelcomeGuideCheckoutLimitModal from "./AdminWelcomeGuideCheckoutLimitModal.vue"
import type { WelcomeGuideCheckoutItem } from "../../types/welcome-guide"
import {
  DEFAULT_WELCOME_GUIDE_RULE_ICON,
  normalizeWelcomeGuideRuleIcon
} from "../../data/welcome-guide-rule-icons"
import { WELCOME_GUIDE_MAX_CHECKOUT_COUNT } from "../../utils/welcome-guide-content"

const props = defineProps<{
  modelValue: WelcomeGuideCheckoutItem[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuideCheckoutItem[]]
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

function createEmptyItem(): WelcomeGuideCheckoutItem {
  return {
    icon: DEFAULT_WELCOME_GUIDE_RULE_ICON,
    title: "",
    description: ""
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

function itemTitle(item: WelcomeGuideCheckoutItem, index: number) {
  return item.title.trim() || adminUiFormat(ui.value.welcomeGuide.checkout.fallback, { index: index + 1 })
}

function itemDescriptionPreview(item: WelcomeGuideCheckoutItem) {
  return item.description.trim() || ui.value.common.noDescription
}

function openAdd() {
  if (props.modelValue.length >= WELCOME_GUIDE_MAX_CHECKOUT_COUNT) {
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

function saveEdit(value: WelcomeGuideCheckoutItem) {
  if (!value.title.trim() || !value.description.trim()) {
    return
  }

  const items = [...props.modelValue]
  const next: WelcomeGuideCheckoutItem = {
    icon: normalizeWelcomeGuideRuleIcon(value.icon, DEFAULT_WELCOME_GUIDE_RULE_ICON),
    title: value.title.trim(),
    description: value.description.trim()
  }

  if (isCreatingNew.value) {
    if (items.length >= WELCOME_GUIDE_MAX_CHECKOUT_COUNT) {
      limitModalOpen.value = true
      return
    }

    items.push(next)
  } else if (items[editingIndex.value]) {
    items[editingIndex.value] = next
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
  <div class="admin-benefit-cards admin-welcome-guide-checkout">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <h3>{{ ui.welcomeGuide.checkout.heading }}</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openAdd">
        <AdminIcon name="plus" :size="16" />
        {{ ui.welcomeGuide.checkout.add }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.welcomeGuide.checkout.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(item, index) in modelValue"
        :key="`${index}-${item.title}-${item.icon}`"
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
          <AdminWelcomeGuideRuleIcon :icon="item.icon" />
        </div>

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ itemTitle(item, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ itemDescriptionPreview(item) }}</p>
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

    <AdminWelcomeGuideCheckoutEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :item="editingItem"
      :is-new="isCreatingNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminWelcomeGuideCheckoutDeleteModal
      :open="deleteModalOpen"
      :item-title="deletingItem ? itemTitle(deletingItem, deletingIndex ?? 0) : ui.welcomeGuide.checkout.thisItem"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />

    <AdminWelcomeGuideCheckoutLimitModal :open="limitModalOpen" @close="closeLimitModal" />
  </div>
</template>
