<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminIcon from "./AdminIcon.vue"
import AdminWelcomeGuidePlaceDeleteModal from "./AdminWelcomeGuidePlaceDeleteModal.vue"
import AdminWelcomeGuidePlaceEditModal from "./AdminWelcomeGuidePlaceEditModal.vue"
import AdminWelcomeGuidePlacesLimitModal from "./AdminWelcomeGuidePlacesLimitModal.vue"
import type { WelcomeGuidePlace } from "../../types/welcome-guide"
import { WELCOME_GUIDE_MAX_PLACE_COUNT } from "../../utils/welcome-guide-content"
import { appendAssetCacheRevision } from "../../utils/property-asset-url"

const props = defineProps<{
  modelValue: WelcomeGuidePlace[]
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  fallbackPreviewPath?: string
  previewRevision?: number
  onImageUploaded?: () => void
}>()

const emit = defineEmits<{
  "update:modelValue": [value: WelcomeGuidePlace[]]
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

function createEmptyPlace(): WelcomeGuidePlace {
  return {
    image_path: "",
    title: "",
    description: "",
    address: ""
  }
}

const editingPlace = computed(() => {
  if (isCreatingNew.value) {
    return createEmptyPlace()
  }

  return props.modelValue[editingIndex.value] ?? createEmptyPlace()
})

const deletingPlace = computed(() =>
  deletingIndex.value === null ? null : props.modelValue[deletingIndex.value]
)

function placeTitle(place: WelcomeGuidePlace, index: number) {
  return place.title.trim() || adminUiFormat(ui.value.welcomeGuide.places.fallback, { index: index + 1 })
}

function placeAddressPreview(place: WelcomeGuidePlace) {
  return place.address.trim() || ui.value.common.noAddress
}

function placeDescriptionPreview(place: WelcomeGuidePlace) {
  return place.description.trim() || ui.value.common.noDescription
}

const headMeta = computed(() =>
  adminUiFormat(ui.value.common.maxCount, {
    current: props.modelValue.length,
    max: WELCOME_GUIDE_MAX_PLACE_COUNT
  })
)

function placeThumbStyle(place: WelcomeGuidePlace) {
  const path = place.image_path.trim()

  if (!path) {
    return undefined
  }

  const url = appendAssetCacheRevision(props.previewUrl(path), props.previewRevision)

  return url ? { backgroundImage: `url("${url}")` } : undefined
}

function openAdd() {
  if (props.modelValue.length >= WELCOME_GUIDE_MAX_PLACE_COUNT) {
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

function saveEdit(value: WelcomeGuidePlace) {
  if (
    !value.image_path.trim() ||
    !value.title.trim() ||
    !value.description.trim() ||
    !value.address.trim()
  ) {
    return
  }

  const places = [...props.modelValue]
  const next: WelcomeGuidePlace = {
    image_path: value.image_path.trim(),
    title: value.title.trim(),
    description: value.description.trim(),
    address: value.address.trim()
  }

  if (isCreatingNew.value) {
    if (places.length >= WELCOME_GUIDE_MAX_PLACE_COUNT) {
      limitModalOpen.value = true
      return
    }

    places.push(next)
  } else if (places[editingIndex.value]) {
    places[editingIndex.value] = next
  }

  emit("update:modelValue", places)
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

  const places = [...props.modelValue]
  places.splice(deletingIndex.value, 1)
  emit("update:modelValue", places)
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

  const places = [...props.modelValue]
  const [moved] = places.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  places.splice(index, 0, moved)
  emit("update:modelValue", places)
  onDragEnd()
}
</script>

<template>
  <div class="admin-benefit-cards admin-welcome-guide-places">
    <div class="admin-subpanel__head admin-benefit-cards__head">
      <div class="admin-benefit-cards__head-copy">
        <h3>{{ ui.welcomeGuide.places.heading }}</h3>
        <p class="admin-benefit-cards__head-meta">{{ headMeta }}</p>
      </div>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        @click="openAdd"
      >
        <AdminIcon name="plus" :size="16" />
        {{ ui.welcomeGuide.places.add }}
      </button>
    </div>

    <p v-if="!modelValue.length" class="admin-benefit-cards__empty">
      {{ ui.welcomeGuide.places.empty }}
    </p>

    <ul v-else class="admin-benefit-cards__list">
      <li
        v-for="(place, index) in modelValue"
        :key="`${index}-${place.title}-${place.image_path}`"
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
          class="admin-welcome-guide-places__thumb"
          :style="placeThumbStyle(place)"
          aria-hidden="true"
        />

        <div class="admin-benefit-cards__item-body">
          <p class="admin-benefit-cards__item-title">{{ placeTitle(place, index) }}</p>
          <p class="admin-benefit-cards__item-text">{{ placeAddressPreview(place) }}</p>
          <p class="admin-benefit-cards__item-text">{{ placeDescriptionPreview(place) }}</p>
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

    <AdminWelcomeGuidePlaceEditModal
      v-if="editModalOpen"
      :open="editModalOpen"
      :place="editingPlace"
      :place-index="editingIndex"
      :is-new="isCreatingNew"
      :upload="upload"
      :preview-url="previewUrl"
      :preview-revision="previewRevision"
      @close="closeEdit"
      @save="saveEdit"
      @uploaded="props.onImageUploaded?.()"
    />

    <AdminWelcomeGuidePlaceDeleteModal
      :open="deleteModalOpen"
      :place-title="deletingPlace ? placeTitle(deletingPlace, deletingIndex ?? 0) : ui.welcomeGuide.places.thisPlace"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />

    <AdminWelcomeGuidePlacesLimitModal :open="limitModalOpen" @close="closeLimitModal" />
  </div>
</template>
