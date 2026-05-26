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
  hideIntro?: boolean
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

const activeIndex = ref(0)

function asText(value: unknown) {
  return typeof value === "string" ? value : ""
}

const galleryCategories = computed(() => props.modelValue.content?.space_gallery_categories ?? [])

const tabs = computed(() =>
  galleryCategories.value.map((category, index) => ({
    id: index,
    label: asText(category.title).trim() || `Section ${index + 1}`
  }))
)

const activeCategory = computed(() => galleryCategories.value[activeIndex.value] ?? null)

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
  if (!activeCategory.value) {
    return
  }

  const categories = galleryCategories.value.filter((_, index) => index !== activeIndex.value)

  patchGalleryCategories(categories)
  activeIndex.value = Math.max(0, Math.min(activeIndex.value, categories.length - 1))
}

function updateActiveCategory(partial: Partial<PropertyGalleryCategory>) {
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

function selectTab(index: number) {
  activeIndex.value = index
}

watch(
  () => galleryCategories.value.length,
  (length) => {
    if (activeIndex.value < length) {
      return
    }

    activeIndex.value = Math.max(0, length - 1)
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-general-images">
    <header v-if="!hideIntro" class="admin-general-images__intro">
      <div>
        <p class="admin-general-images__kicker">Galerie</p>
        <h3>Images par espace</h3>
      </div>
      <p>
        Organisez la galerie détaillée en sections. Chaque onglet possède son titre,
        son sous-titre et sa série de photos.
      </p>
    </header>

    <section class="admin-general-images__section">
      <header class="admin-general-images__section-head">
        <div>
          <p class="admin-general-images__kicker">Sections</p>
          <h4>Galerie</h4>
        </div>
        <p>Ces sections alimentent la galerie ouverte depuis les cartes visuelles du site.</p>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addGalleryCategory">
          <AdminIcon name="plus" :size="16" />
          Ajouter une section
        </button>
      </header>

      <p v-if="!galleryCategories.length" class="admin-general-images__empty">
        Aucune section de galerie. Ajoutez une section pour organiser les photos par espace.
      </p>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Sections de galerie">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="admin-tabs__btn"
              :class="{ 'admin-tabs__btn--active': activeIndex === tab.id }"
              :aria-selected="activeIndex === tab.id"
              @click="selectTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <article v-if="activeCategory" class="admin-general-gallery admin-general-gallery--tabbed" role="tabpanel">
          <header class="admin-general-gallery__head">
            <div
              class="admin-general-gallery__fields"
              :class="{ 'admin-general-gallery__fields--with-examples': showFieldExamples }"
            >
              <div class="admin-onboarding-fields__field-block">
                <AdminField
                  label="Titre"
                  :required="markRequired"
                  :model-value="asText(activeCategory.title)"
                  @update:model-value="updateActiveCategory({ title: $event as string })"
                />
                <AdminOnboardingFieldExamples
                  v-if="showFieldExamples"
                  :examples="galleryTitleExamples"
                />
              </div>
              <div class="admin-onboarding-fields__field-block">
                <AdminField
                  label="Sous-titre"
                  :required="markRequired"
                  :model-value="asText(activeCategory.description)"
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
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveCategory"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer la section
            </button>
          </header>

          <p v-if="!(activeCategory.images ?? []).length" class="admin-general-images__empty">
            Aucune image dans cette section.
          </p>

          <div v-else class="admin-general-gallery__images">
            <article
              v-for="(image, imageIndex) in activeCategory.images ?? []"
              :key="`${activeCategory.id}-${imageIndex}`"
              class="admin-general-gallery__image"
              :class="{ 'admin-general-gallery__image--with-examples': showFieldExamples }"
            >
              <div class="admin-general-gallery__image-main">
                <AdminImageUpload
                  cover
                  :label="`Image ${imageIndex + 1}`"
                  :required="markRequired && imageIndex === 0"
                  :model-value="asText(image)"
                  :default-path="defaultGalleryImagePath(activeCategory, activeIndex, imageIndex, image)"
                  :upload="upload"
                  :preview-url="previewUrl"
                  @update:model-value="updateGalleryImage(imageIndex, $event as string)"
                />
                <AdminOnboardingFieldExamples
                  v-if="showFieldExamples && imageIndex === 0"
                  :examples="galleryImageExamples"
                />
              </div>
              <button
                type="button"
                class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
                @click="removeGalleryImage(imageIndex)"
              >
                <AdminIcon name="trash" :size="16" />
                Retirer l’image
              </button>
            </article>
          </div>

          <button
            type="button"
            class="admin-btn admin-btn--secondary admin-btn--sm admin-general-gallery__add"
            @click="addGalleryImage"
          >
            <AdminIcon name="plus" :size="16" />
            Ajouter une image
          </button>
        </article>
      </template>
    </section>
  </div>
</template>
