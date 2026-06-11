<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import AdminPlatformLinkDeleteModal from "./AdminPlatformLinkDeleteModal.vue"
import AdminPlatformLinkEditModal from "./AdminPlatformLinkEditModal.vue"
import {
  ADMIN_PRESET_PLATFORMS,
  getPresetPlatform,
  isPresetPlatformId
} from "../../data/admin-platform-tabs"
import { adminUiFormat } from "../../data/admin-ui"
import {
  DEFAULT_PLATFORM_CUSTOM_ICON,
  DEFAULT_PLATFORM_ICON_BG,
  normalizePlatformCustomIconId,
  normalizePlatformIconBg
} from "../../data/platform-custom-icons"
import type { PropertyPlatformLink } from "../../types/property-site"
import { isPlatformLinkHidden } from "../../utils/platform-links"
import { resolvePlatformLogoPath } from "../../utils/platform-logo"
import { usePublicAsset } from "../../composables/usePublicAsset"
import type { AdminIconName } from "./admin-icon-types"

const props = defineProps<{
  modelValue: PropertyPlatformLink[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyPlatformLink[]]
}>()

const { publicAsset } = usePublicAsset()
const { ui } = useAdminUi()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const isCreatingNew = ref(false)
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function createEmptyLink(id: string): PropertyPlatformLink {
  const preset = getPresetPlatform(id)

  return {
    id,
    name: preset?.defaultName ?? "",
    rating: "",
    stars: "",
    label: "",
    logo: preset?.defaultLogo ?? "",
    icon: preset ? undefined : DEFAULT_PLATFORM_CUSTOM_ICON,
    icon_bg: preset ? undefined : DEFAULT_PLATFORM_ICON_BG,
    url: "",
    hidden: Boolean(preset)
  }
}

function linkForId(id: string): PropertyPlatformLink {
  return props.modelValue.find((link) => link.id === id) ?? createEmptyLink(id)
}

const platformItems = computed(() => {
  const items: Array<{ id: string; label: string; isPreset: boolean }> = []
  const seen = new Set<string>()

  for (const link of props.modelValue) {
    const isPreset = isPresetPlatformId(link.id)

    items.push({
      id: link.id,
      label: isPreset
        ? (getPresetPlatform(link.id)?.label ?? (link.name.trim() || link.id))
        : link.name.trim() || ui.value.editors.platformLinks.newPlatform,
      isPreset
    })
    seen.add(link.id)
  }

  for (const preset of ADMIN_PRESET_PLATFORMS) {
    if (!seen.has(preset.id)) {
      items.push({
        id: preset.id,
        label: preset.label,
        isPreset: true
      })
    }
  }

  return items
})

const editingLink = computed(() => {
  if (!editingId.value) {
    return null
  }

  return linkForId(editingId.value)
})

const editingIsPreset = computed(() => (editingId.value ? isPresetPlatformId(editingId.value) : false))
const editingIsNew = computed(() => isCreatingNew.value)

const deletingLink = computed(() => (deletingId.value ? linkForId(deletingId.value) : null))

function platformLogoSrc(id: string) {
  const link = linkForId(id)
  const path = resolvePlatformLogoPath(link.logo, id)

  return path ? publicAsset(path) : ""
}

function platformCustomIcon(id: string): AdminIconName {
  return normalizePlatformCustomIconId(linkForId(id).icon)
}

function platformCustomIconBg(id: string) {
  return normalizePlatformIconBg(linkForId(id).icon_bg)
}

function platformRatingText(id: string) {
  return linkForId(id).rating.trim()
}

function platformRatingStatus(id: string) {
  const link = linkForId(id)
  const saved = props.modelValue.some((item) => item.id === id)

  if (!saved && !isPresetPlatformId(id)) {
    return ""
  }

  if (isPlatformLinkHidden(link)) {
    return ui.value.editors.platformLinks.hiddenOnSite
  }

  return ""
}

function isPlatformLinkValid(link: PropertyPlatformLink) {
  return Boolean(link.name.trim() && link.rating.trim())
}

function updateLink(id: string, value: PropertyPlatformLink) {
  if (!isPlatformLinkValid(value)) {
    return
  }

  const links = [...props.modelValue]
  const index = links.findIndex((link) => link.id === id)

  if (index >= 0) {
    links[index] = value
  } else {
    links.push(value)
  }

  emit("update:modelValue", links)
}

function openEdit(id: string) {
  isCreatingNew.value = false
  editingId.value = id
  editModalOpen.value = true
}

function closeEdit() {
  editModalOpen.value = false
  editingId.value = null
  isCreatingNew.value = false
}

function saveEdit(value: PropertyPlatformLink) {
  if (!isPlatformLinkValid(value)) {
    return
  }

  updateLink(value.id, value)
  closeEdit()
}

function openDelete(id: string) {
  deletingId.value = id
  deleteModalOpen.value = true
}

function closeDelete() {
  deleteModalOpen.value = false
  deletingId.value = null
}

function confirmDelete() {
  if (!deletingId.value || isPresetPlatformId(deletingId.value)) {
    return
  }

  const links = props.modelValue.filter((link) => link.id !== deletingId.value)

  emit("update:modelValue", links)
  closeDelete()
}

function addCustomPlatform() {
  const id = `platform-${Date.now()}`

  isCreatingNew.value = true
  editingId.value = id
  editModalOpen.value = true
}

function applyPlatformOrder(orderedIds: string[]) {
  const links = orderedIds.map((id) => {
    const saved = props.modelValue.find((link) => link.id === id)

    return saved ?? createEmptyLink(id)
  })

  emit("update:modelValue", links)
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

  const items = [...platformItems.value]
  const [moved] = items.splice(from, 1)

  if (!moved) {
    onDragEnd()
    return
  }

  items.splice(index, 0, moved)
  applyPlatformOrder(items.map((item) => item.id))
  onDragEnd()
}
</script>

<template>
  <div class="admin-platform-links">
    <div class="admin-subpanel__head admin-platform-links__head">
      <h3>{{ ui.editors.platformLinks.title }}</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addCustomPlatform">
        <AdminIcon name="plus" :size="16" />
        {{ ui.editors.platformLinks.addButton }}
      </button>
    </div>

    <!-- Note textuelle uniquement (pas d’étoiles dans la liste) -->
    <ul class="admin-platform-links__list">
      <li
        v-for="(item, index) in platformItems"
        :key="item.id"
        class="admin-platform-links__item"
        :class="{
          'admin-platform-links__item--hidden': isPlatformLinkHidden(linkForId(item.id)),
          'admin-platform-links__item--dragging': dragIndex === index,
          'admin-platform-links__item--drag-over': dragOverIndex === index && dragIndex !== index
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

        <div
          v-if="item.isPreset"
          class="admin-platform-links__item-icon"
          :class="`admin-platform-links__item-icon--${item.id}`"
          aria-hidden="true"
        >
          <img
            :src="platformLogoSrc(item.id)"
            :alt="''"
            class="admin-platform-links__item-logo"
          />
        </div>
        <div
          v-else
          class="admin-platform-links__item-icon admin-platform-links__item-icon--custom"
          :style="{ '--admin-platform-icon-bg': platformCustomIconBg(item.id) }"
          aria-hidden="true"
        >
          <AdminIcon :name="platformCustomIcon(item.id)" :size="16" />
        </div>

        <p class="admin-platform-links__item-name">{{ linkForId(item.id).name || item.label }}</p>

        <div class="admin-platform-links__item-rating">
          <span
            v-if="platformRatingStatus(item.id)"
            class="admin-platform-links__item-rating-status"
          >
            {{ platformRatingStatus(item.id) }}
          </span>
          <span
            v-else-if="platformRatingText(item.id)"
            class="admin-platform-links__item-rating-text"
          >
            {{ platformRatingText(item.id) }}
          </span>
          <span v-else class="admin-platform-links__item-rating-placeholder" aria-hidden="true">—</span>
        </div>

        <div class="admin-platform-links__item-actions">
          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
            :aria-label="ui.editors.shared.edit"
            @click="openEdit(item.id)"
          >
            <AdminIcon name="pencil" :size="16" />
          </button>
          <button
            v-if="!item.isPreset"
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
            :aria-label="ui.common.delete"
            @click="openDelete(item.id)"
          >
            <AdminIcon name="trash" :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <AdminPlatformLinkEditModal
      v-if="editingLink && editModalOpen"
      :open="editModalOpen"
      :link="editingLink"
      :is-preset="editingIsPreset"
      :is-new="editingIsNew"
      @close="closeEdit"
      @save="saveEdit"
    />

    <AdminPlatformLinkDeleteModal
      :open="deleteModalOpen"
      :platform-name="deletingLink?.name?.trim() || ui.editors.shared.thisPlatform"
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
