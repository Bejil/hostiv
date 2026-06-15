<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminField from "./AdminField.vue"
import AdminGalleryPhotoDeleteModal from "./AdminGalleryPhotoDeleteModal.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import type { PropertyGalleryCategory } from "../../types/property-site"
import {
  asGalleryText,
  defaultGalleryImagePath,
  filledGalleryImages,
  isGalleryCategoryPublishable
} from "../../utils/gallery-category-admin"

const props = defineProps<{
  modelValue: PropertyGalleryCategory
  sectionIndex: number
  markRequired?: boolean
  showFieldExamples?: boolean
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  saveDraft?: () => Promise<boolean>
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyGalleryCategory]
}>()

const { ui } = useAdminUi()

const galleryTitleExamples = computed(() => [...ui.value.gallery.titleExamples])
const gallerySubtitleExamples = computed(() => [...ui.value.gallery.subtitleExamples])

const photoDragIndex = ref<number | null>(null)
const photoDragOverIndex = ref<number | null>(null)
const addPhotoInputRef = ref<HTMLInputElement | null>(null)
const addingPhoto = ref(false)
const addPhotoError = ref<string | null>(null)
const deletePhotoModalOpen = ref(false)
const deletingPhotoIndex = ref<number | null>(null)

const images = computed(() => filledGalleryImages(props.modelValue.images ?? []))

const isComplete = computed(() => isGalleryCategoryPublishable(props.modelValue))

const deletingPhotoLabel = computed(() => {
  if (deletingPhotoIndex.value === null) {
    return ui.value.gallery.thisPhoto
  }

  return adminUiFormat(ui.value.gallery.photo, {
    index: deletingPhotoIndex.value + 1
  })
})

function patch(partial: Partial<PropertyGalleryCategory>) {
  emit("update:modelValue", { ...props.modelValue, ...partial })
}

async function persistGalleryDraft() {
  if (!props.saveDraft) {
    return
  }

  await props.saveDraft()
}

function imageDefaultPath(imageIndex: number, current: string) {
  return defaultGalleryImagePath(props.modelValue, props.sectionIndex, imageIndex, current)
}

function addPhoto() {
  addPhotoError.value = null
  addPhotoInputRef.value?.click()
}

async function onAddPhotoFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []

  if (!files.length) {
    return
  }

  addPhotoError.value = null
  addingPhoto.value = true

  try {
    const nextImages = [...images.value]
    let imageIndex = nextImages.length

    for (const file of files) {
      try {
        const path = imageDefaultPath(imageIndex, "")
        const result = await props.upload(file, path)

        nextImages.push(result.path)
        imageIndex += 1
      } catch (err: unknown) {
        if (nextImages.length > images.value.length) {
          patch({ images: nextImages })
        }

        const error = err as { data?: { message?: string }; message?: string }

        addPhotoError.value = error.data?.message || error.message || ui.value.gallery.uploadFailed
        return
      }
    }

    patch({ images: nextImages })
    await persistGalleryDraft()
  } finally {
    addingPhoto.value = false
    input.value = ""
  }
}

function updatePhoto(imageIndex: number, image: string) {
  const nextImages = [...images.value]
  nextImages[imageIndex] = image
  patch({ images: nextImages })
}

function removePhoto(imageIndex: number) {
  patch({ images: images.value.filter((_, index) => index !== imageIndex) })
  void persistGalleryDraft()
}

function openDeletePhoto(imageIndex: number) {
  deletingPhotoIndex.value = imageIndex
  deletePhotoModalOpen.value = true
}

function closeDeletePhoto() {
  deletePhotoModalOpen.value = false
  deletingPhotoIndex.value = null
}

function confirmDeletePhoto() {
  if (deletingPhotoIndex.value === null) {
    return
  }

  removePhoto(deletingPhotoIndex.value)
  closeDeletePhoto()
}

function onPhotoDragStart(index: number, event: DragEvent) {
  photoDragIndex.value = index
  photoDragOverIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", String(index))
  }
}

function onPhotoDragEnd() {
  photoDragIndex.value = null
  photoDragOverIndex.value = null
}

function onPhotoDragOver(index: number, event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }

  photoDragOverIndex.value = index
}

function onPhotoDrop(index: number, event: DragEvent) {
  event.preventDefault()

  const to = index
  const from =
    photoDragIndex.value ??
    Number.parseInt(event.dataTransfer?.getData("text/plain") ?? "", 10)

  if (!Number.isFinite(from) || from === to || from < 0) {
    onPhotoDragEnd()
    return
  }

  const nextImages = [...images.value]
  const [moved] = nextImages.splice(from, 1)

  if (!moved) {
    onPhotoDragEnd()
    return
  }

  nextImages.splice(to, 0, moved)
  patch({ images: nextImages })
  void persistGalleryDraft()
  onPhotoDragEnd()
}
</script>

<template>
  <div class="admin-gallery-section-editor">
    <div
      class="admin-gallery-section-editor__fields"
      :class="{ 'admin-gallery-section-editor__fields--with-examples': showFieldExamples }"
    >
      <AdminField
          :label="ui.gallery.title"
          :required="markRequired"
          full-width
          :examples="showFieldExamples ? galleryTitleExamples : undefined"
          :model-value="modelValue.title"
          @update:model-value="patch({ title: $event as string })"
        />
      <AdminField
          :label="ui.gallery.subtitle"
          :required="markRequired"
          type="textarea"
          :rows="3"
          full-width
          :examples="showFieldExamples ? gallerySubtitleExamples : undefined"
          :model-value="modelValue.description"
          @update:model-value="patch({ description: $event as string })"
        />
    </div>

    <div class="admin-gallery-section-editor__photos-head">
      <h3 class="admin-gallery-section-editor__photos-title">{{ ui.gallery.photos }}</h3>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        :disabled="addingPhoto"
        @click="addPhoto"
      >
        <AdminIcon name="plus" :size="16" />
        {{ addingPhoto ? ui.common.uploading : ui.gallery.addPhoto }}
      </button>
      <input
        ref="addPhotoInputRef"
        type="file"
        accept="image/*"
        multiple
        hidden
        :disabled="addingPhoto"
        @change="onAddPhotoFileChange"
      />
    </div>

    <p v-if="addPhotoError" class="admin-gallery-section-editor__photos-error">
      {{ addPhotoError }}
    </p>

    <p v-if="!images.length" class="admin-gallery-section-editor__photos-empty">
      {{ ui.gallery.photosEmpty }}
    </p>

    <ul v-else class="admin-gallery-section-editor__photos">
      <li
        v-for="(image, index) in images"
        :key="`photo-${index}-${image}`"
        class="admin-gallery-section-editor__photo"
        :class="{
          'admin-gallery-section-editor__photo--dragging': photoDragIndex === index,
          'admin-gallery-section-editor__photo--drag-over':
            photoDragOverIndex === index && photoDragIndex !== index
        }"
        @dragover="onPhotoDragOver(index, $event)"
        @drop="onPhotoDrop(index, $event)"
      >
        <div class="admin-gallery-section-editor__photo-tile">
          <AdminImageUpload
            cover
            cover-tile
            class="admin-gallery-section-editor__photo-upload"
            :label="adminUiFormat(ui.gallery.photo, { index: index + 1 })"
            :model-value="asGalleryText(image)"
            :default-path="imageDefaultPath(index, asGalleryText(image))"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="updatePhoto(index, $event as string)"
            @uploaded="persistGalleryDraft"
          />

          <div class="admin-gallery-section-editor__photo-toolbar" @click.stop>
            <button
              type="button"
              class="admin-gallery-section-editor__photo-drag admin-sortable-list__drag-handle"
              :aria-label="ui.common.dragToReorder"
              draggable="true"
              @dragstart="onPhotoDragStart(index, $event)"
              @dragend="onPhotoDragEnd"
            />
            <button
              type="button"
              class="admin-gallery-section-editor__photo-remove"
              :aria-label="ui.gallery.removePhoto"
              @click="openDeletePhoto(index)"
            >
              <AdminIcon name="trash" :size="14" />
            </button>
          </div>

          <span class="admin-gallery-section-editor__photo-caption">
            {{ adminUiFormat(ui.gallery.photo, { index: index + 1 }) }}
          </span>
        </div>
      </li>
    </ul>

    <p v-if="markRequired && !isComplete" class="admin-gallery-section-editor__hint">
      {{ ui.gallery.sectionRequiredHint }}
    </p>

    <AdminGalleryPhotoDeleteModal
      :open="deletePhotoModalOpen"
      :photo-label="deletingPhotoLabel"
      @cancel="closeDeletePhoto"
      @confirm="confirmDeletePhoto"
    />
  </div>
</template>
