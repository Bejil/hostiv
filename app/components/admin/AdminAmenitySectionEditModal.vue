<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminAmenityItemDeleteModal from "./AdminAmenityItemDeleteModal.vue"
import AdminAmenityItemEditModal from "./AdminAmenityItemEditModal.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AmenityIcon from "../AmenityIcon.vue"
import { DEFAULT_AMENITY_ICON } from "../../data/amenity-icons"
import type { AmenityItem, AmenityPreviewSection } from "../../types/amenity"

const props = defineProps<{
  open: boolean
  section: AmenityPreviewSection
  isNew?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [value: AmenityPreviewSection]
}>()

const draft = ref<AmenityPreviewSection>({ ...props.section, items: [...props.section.items] })

const itemEditOpen = ref(false)
const itemDeleteOpen = ref(false)
const editingItemIndex = ref(0)
const deletingItemIndex = ref<number | null>(null)
const isCreatingItem = ref(false)
const itemDragIndex = ref<number | null>(null)
const itemDragOverIndex = ref<number | null>(null)

const canSave = computed(
  () =>
    Boolean(draft.value.title.trim()) &&
    draft.value.items.some((item) => item.name.trim())
)

const modalTitle = computed(() =>
  props.isNew ? "Ajouter une carte" : "Modifier la carte"
)

const editingItem = computed(() => {
  if (isCreatingItem.value) {
    return createEmptyItem()
  }

  return draft.value.items[editingItemIndex.value] ?? createEmptyItem()
})

const deletingItem = computed(() =>
  deletingItemIndex.value === null ? null : draft.value.items[deletingItemIndex.value]
)

function createAmenityId() {
  return `amenity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyItem(): AmenityItem {
  return {
    id: createAmenityId(),
    icon: DEFAULT_AMENITY_ICON,
    name: ""
  }
}

function itemName(item: AmenityItem, index: number) {
  return item.name.trim() || `Équipement ${index + 1}`
}

watch(
  () => [props.open, props.section] as const,
  ([isOpen, section]) => {
    if (isOpen) {
      draft.value = { ...section, items: section.items.map((item) => ({ ...item })) }
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

function patchDraft(partial: Partial<AmenityPreviewSection>) {
  draft.value = { ...draft.value, ...partial }
}

function openAddItem() {
  isCreatingItem.value = true
  editingItemIndex.value = draft.value.items.length
  itemEditOpen.value = true
}

function openEditItem(index: number) {
  isCreatingItem.value = false
  editingItemIndex.value = index
  itemEditOpen.value = true
}

function closeEditItem() {
  itemEditOpen.value = false
  isCreatingItem.value = false
}

function saveItem(value: AmenityItem) {
  if (!value.name.trim()) {
    return
  }

  const items = [...draft.value.items]

  if (isCreatingItem.value) {
    items.push(value)
  } else if (items[editingItemIndex.value]) {
    items[editingItemIndex.value] = value
  }

  patchDraft({ items })
  closeEditItem()
}

function openDeleteItem(index: number) {
  deletingItemIndex.value = index
  itemDeleteOpen.value = true
}

function closeDeleteItem() {
  itemDeleteOpen.value = false
  deletingItemIndex.value = null
}

function confirmDeleteItem() {
  if (deletingItemIndex.value === null) {
    return
  }

  patchDraft({
    items: draft.value.items.filter((_, index) => index !== deletingItemIndex.value)
  })
  closeDeleteItem()
}

function onItemDragStart(index: number, event: DragEvent) {
  itemDragIndex.value = index
  itemDragOverIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(index))
  }
}

function onItemDragEnd() {
  itemDragIndex.value = null
  itemDragOverIndex.value = null
}

function onItemDragOver(index: number, event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }

  itemDragOverIndex.value = index
}

function onItemDrop(index: number, event: DragEvent) {
  event.preventDefault()

  const from =
    itemDragIndex.value ?? Number.parseInt(event.dataTransfer?.getData("text/plain") ?? "", 10)

  if (!Number.isFinite(from) || from === index) {
    onItemDragEnd()
    return
  }

  const items = [...draft.value.items]
  const [moved] = items.splice(from, 1)

  if (!moved) {
    onItemDragEnd()
    return
  }

  items.splice(index, 0, moved)
  patchDraft({ items })
  onItemDragEnd()
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", {
    ...draft.value,
    title: draft.value.title.trim(),
    items: draft.value.items.filter((item) => item.name.trim())
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--amenity-section"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--amenity-section"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-amenity-section-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" aria-label="Fermer" @click="emit('close')">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-amenity-section-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.title.trim() || "Sans titre" }}
                </p>
              </div>
            </header>

            <div class="admin-amenity-section-modal__fields">
              <AdminField
                label="Titre de la carte"
                required
                full-width
                :model-value="draft.title"
                @update:model-value="patchDraft({ title: $event as string })"
              />

              <div class="admin-amenity-section-modal__items-head">
                <h3 class="admin-amenity-section-modal__items-title">Équipements</h3>
                <button
                  type="button"
                  class="admin-btn admin-btn--secondary admin-btn--sm"
                  @click="openAddItem"
                >
                  <AdminIcon name="plus" :size="16" />
                  Ajouter
                </button>
              </div>

              <p v-if="!draft.items.length" class="admin-amenity-section-modal__items-empty">
                Aucun équipement. Ajoutez au moins un équipement nommé.
              </p>

              <ul v-else class="admin-amenity-section-modal__items">
                <li
                  v-for="(item, itemIndex) in draft.items"
                  :key="`${item.id}-${itemIndex}`"
                  class="admin-amenity-section-modal__item"
                  :class="{
                    'admin-amenity-section-modal__item--dragging': itemDragIndex === itemIndex,
                    'admin-amenity-section-modal__item--drag-over':
                      itemDragOverIndex === itemIndex && itemDragIndex !== itemIndex
                  }"
                  @dragover="onItemDragOver(itemIndex, $event)"
                  @drop="onItemDrop(itemIndex, $event)"
                >
                  <button
                    type="button"
                    class="admin-sortable-list__drag-handle"
                    aria-label="Glisser pour réordonner"
                    draggable="true"
                    @dragstart="onItemDragStart(itemIndex, $event)"
                    @dragend="onItemDragEnd"
                  />

                  <div class="admin-amenity-section-modal__item-icon" aria-hidden="true">
                    <AmenityIcon :name="item.icon" />
                  </div>

                  <div class="admin-amenity-section-modal__item-body">
                    <p class="admin-amenity-section-modal__item-title">
                      {{ itemName(item, itemIndex) }}
                    </p>
                  </div>

                  <div class="admin-amenity-section-modal__item-actions">
                    <button
                      type="button"
                      class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                      aria-label="Modifier"
                      @click="openEditItem(itemIndex)"
                    >
                      <AdminIcon name="pencil" :size="16" />
                    </button>
                    <button
                      type="button"
                      class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                      aria-label="Supprimer"
                      @click="openDeleteItem(itemIndex)"
                    >
                      <AdminIcon name="trash" :size="16" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <p v-if="!canSave" class="admin-amenity-section-modal__hint">
              Le titre de la carte et au moins un équipement nommé sont obligatoires.
            </p>

            <footer class="admin-amenity-section-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                Annuler
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="!canSave"
                @click="save"
              >
                Enregistrer
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>

    <AdminAmenityItemEditModal
      v-if="itemEditOpen"
      :open="itemEditOpen"
      :item="editingItem"
      :is-new="isCreatingItem"
      :lock-scroll="false"
      @close="closeEditItem"
      @save="saveItem"
    />

    <AdminAmenityItemDeleteModal
      :open="itemDeleteOpen"
      :item-name="deletingItem ? itemName(deletingItem, deletingItemIndex ?? 0) : 'Cet équipement'"
      :lock-scroll="false"
      @cancel="closeDeleteItem"
      @confirm="confirmDeleteItem"
    />
  </Teleport>
</template>
