<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminOnboardingFieldExamples from "./AdminOnboardingFieldExamples.vue"
import type { PropertyAdminRecord } from "../../types/property-admin"
import type { PropertyGalleryCategory } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyAdminRecord
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  markRequired?: boolean
  showFieldExamples?: boolean
}>()

const galleryTitleExamples = ["Salon", "Chambre principale"]

const gallerySubtitleExamples = [
  "Espace de vie lumineux, canapé et cheminée",
  "Suite parentale avec salle de bain attenante"
]

const galleryImageExamples = [
  "Vue d’ensemble de la pièce",
  "Détail qui met en valeur l’espace (lumière, matière)"
]

const emit = defineEmits<{
  "update:modelValue": [value: PropertyAdminRecord]
}>()

const activeIndex = ref<number | null>(null)

function asText(value: unknown) {
  return typeof value === "string" ? value : ""
}

const galleryCategories = computed(() => props.modelValue.content?.space_gallery_categories ?? [])

const sidebarSections = computed(() =>
  galleryCategories.value.map((category, index) => ({
    id: index,
    label: asText(category.title).trim() || `Section ${index + 1}`,
    imageCount: (category.images ?? []).filter((image) => asText(image).trim()).length
  }))
)

const activeCategory = computed(() => {
  if (activeIndex.value === null) {
    return null
  }

  return galleryCategories.value[activeIndex.value] ?? null
})

const activeImages = computed(() => activeCategory.value?.images ?? [])

function patchContent(partial: Partial<PropertyAdminRecord["content"]>) {
  emit("update:modelValue", {
    ...props.modelValue,
    content: {
      ...props.modelValue.content,
      ...partial
    }
  })
}

function patchGalleryCategories(categories: PropertyGalleryCategory[]) {
  patchContent({ space_gallery_categories: categories })
}

function defaultGalleryImagePath(
  category: PropertyGalleryCategory,
  categoryIndex: number,
  imageIndex: number,
  current: string | null | undefined
) {
  const trimmed = asText(current).trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  const categoryId = asText(category.id).trim() || `section-${categoryIndex + 1}`

  return `gallery/espaces/${categoryId}/${String(imageIndex + 1).padStart(2, "0")}.jpeg`
}

function createGalleryCategory(): PropertyGalleryCategory {
  const existingIds = new Set(galleryCategories.value.map((category) => category.id))
  let index = galleryCategories.value.length + 1
  let id = `section-images-${index}`

  while (existingIds.has(id)) {
    index += 1
    id = `section-images-${index}`
  }

  return {
    id,
    title: "",
    description: "",
    images: [""]
  }
}

function addGalleryCategory() {
  const categories = [...galleryCategories.value, createGalleryCategory()]

  patchGalleryCategories(categories)
  activeIndex.value = categories.length - 1
}

function removeActiveCategory() {
  if (activeIndex.value === null || !activeCategory.value) {
    return
  }

  const categories = galleryCategories.value.filter((_, index) => index !== activeIndex.value)

  patchGalleryCategories(categories)

  if (!categories.length) {
    activeIndex.value = null
    return
  }

  activeIndex.value = Math.max(0, Math.min(activeIndex.value, categories.length - 1))
}

function updateActiveCategory(partial: Partial<PropertyGalleryCategory>) {
  if (activeIndex.value === null) {
    return
  }

  const categories = galleryCategories.value.map((category, index) =>
    index === activeIndex.value ? { ...category, ...partial } : category
  )

  patchGalleryCategories(categories)
}

function updateGalleryImage(imageIndex: number, image: string) {
  if (!activeCategory.value) {
    return
  }

  const images = activeCategory.value.images ?? []
  const nextImages = images.map((currentImage, currentImageIndex) =>
    currentImageIndex === imageIndex ? image : currentImage
  )

  updateActiveCategory({ images: nextImages })
}

function addGalleryImage() {
  if (!activeCategory.value) {
    return
  }

  updateActiveCategory({ images: [...(activeCategory.value.images ?? []), ""] })
}

function removeGalleryImage(imageIndex: number) {
  if (!activeCategory.value) {
    return
  }

  updateActiveCategory({
    images: (activeCategory.value.images ?? []).filter((_, index) => index !== imageIndex)
  })
}

function selectSection(index: number) {
  activeIndex.value = index
}

watch(
  () => galleryCategories.value.length,
  (length) => {
    if (!length) {
      activeIndex.value = null
      return
    }

    if (activeIndex.value === null) {
      activeIndex.value = 0
      return
    }

    if (activeIndex.value >= length) {
      activeIndex.value = length - 1
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-general-images admin-gallery-editor">
    <div class="admin-gallery-editor__layout">
      <aside class="admin-gallery-editor__sidebar">
        <div class="admin-gallery-editor__sidebar-head">
          <p class="admin-gallery-editor__sidebar-label">Sections</p>
          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-gallery-editor__sidebar-add"
            aria-label="Ajouter une section"
            title="Ajouter une section"
            @click="addGalleryCategory"
          >
            <AdminIcon name="plus" :size="16" />
          </button>
        </div>

        <nav
          v-if="sidebarSections.length"
          class="admin-gallery-editor__nav"
          aria-label="Sections de galerie"
        >
          <button
            v-for="section in sidebarSections"
            :key="section.id"
            type="button"
            class="admin-gallery-editor__nav-item"
            :class="{ 'admin-gallery-editor__nav-item--active': activeIndex === section.id }"
            :aria-current="activeIndex === section.id ? 'true' : undefined"
            @click="selectSection(section.id)"
          >
            <span class="admin-gallery-editor__nav-label">{{ section.label }}</span>
            <span v-if="section.imageCount" class="admin-gallery-editor__nav-count">
              {{ section.imageCount }}
            </span>
          </button>
        </nav>

        <p v-else class="admin-gallery-editor__sidebar-empty">Aucune section</p>
      </aside>

      <main class="admin-gallery-editor__main">
        <div v-if="!galleryCategories.length" class="admin-gallery-editor__placeholder">
          <div class="admin-gallery-editor__placeholder-icon" aria-hidden="true">
            <AdminIcon name="image" :size="28" />
          </div>
          <h3>Aucune section photo</h3>
          <p>
            Créez une première section pour regrouper vos images par espace (salon, chambre, extérieur…).
          </p>
          <button type="button" class="admin-btn admin-btn--secondary" @click="addGalleryCategory">
            <AdminIcon name="plus" :size="16" />
            Ajouter une section
          </button>
        </div>

        <article
          v-else-if="activeCategory && activeIndex !== null"
          class="admin-gallery-editor__detail"
        >
          <header class="admin-gallery-editor__detail-head">
            <div
              class="admin-gallery-editor__fields"
              :class="{ 'admin-gallery-editor__fields--with-examples': showFieldExamples }"
            >
              <div class="admin-onboarding-fields__field-block">
                <AdminField
                  label="Titre de la section"
                  :required="markRequired"
                  :model-value="asText(activeCategory.title)"
                  full-width
                  @update:model-value="updateActiveCategory({ title: $event as string })"
                />
                <AdminOnboardingFieldExamples
                  v-if="showFieldExamples"
                  :examples="galleryTitleExamples"
                />
              </div>
              <div class="admin-onboarding-fields__field-block">
                <AdminField
                  label="Description"
                  :required="markRequired"
                  :model-value="asText(activeCategory.description)"
                  type="textarea"
                  :rows="3"
                  full-width
                  @update:model-value="updateActiveCategory({ description: $event as string })"
                />
                <AdminOnboardingFieldExamples
                  v-if="showFieldExamples"
                  :examples="gallerySubtitleExamples"
                />
              </div>
            </div>
            <button
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-gallery-editor__delete-section"
              title="Supprimer cette section"
              @click="removeActiveCategory"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-gallery-editor__photos">
            <article
              v-for="(image, imageIndex) in activeImages"
              :key="`${activeCategory.id}-${imageIndex}`"
              class="admin-gallery-editor__photo"
              :class="{ 'admin-gallery-editor__photo--with-examples': showFieldExamples }"
            >
              <div class="admin-gallery-editor__photo-main">
                <AdminImageUpload
                  cover
                  :label="`Photo ${imageIndex + 1}`"
                  :required="markRequired && imageIndex === 0"
                  :model-value="asText(image)"
                  :default-path="defaultGalleryImagePath(activeCategory, activeIndex, imageIndex, image)"
                  :upload="upload"
                  :preview-url="previewUrl"
                  @update:model-value="updateGalleryImage(imageIndex, $event as string)"
                />
                <button
                  type="button"
                  class="admin-gallery-editor__photo-remove"
                  aria-label="Retirer la photo"
                  title="Retirer la photo"
                  @click="removeGalleryImage(imageIndex)"
                >
                  <AdminIcon name="trash" :size="15" />
                </button>
                <AdminOnboardingFieldExamples
                  v-if="showFieldExamples && imageIndex === 0"
                  :examples="galleryImageExamples"
                />
              </div>
            </article>

            <button
              type="button"
              class="admin-gallery-editor__photo-add"
              @click="addGalleryImage"
            >
              <AdminIcon name="plus" :size="18" />
              <span>Ajouter une photo</span>
            </button>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>
