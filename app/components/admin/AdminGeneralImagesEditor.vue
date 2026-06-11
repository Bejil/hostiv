<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminGallerySectionDeleteModal from "./AdminGallerySectionDeleteModal.vue"
import AdminGallerySectionPanel from "./AdminGallerySectionPanel.vue"
import AdminIcon from "./AdminIcon.vue"
import { adminEditorContextKey } from "../../composables/admin-editor-context"
import type { PropertyAdminRecord } from "../../types/property-admin"
import type { PropertyGalleryCategory } from "../../types/property-site"
import {
  asGalleryText,
  createGalleryCategory,
  isGalleryCategoryPublishable
} from "../../utils/gallery-category-admin"

const props = defineProps<{
  modelValue: PropertyAdminRecord
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  saveDraft?: () => Promise<boolean>
  markRequired?: boolean
  showFieldExamples?: boolean
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyAdminRecord]
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)
const editorCtx = inject(adminEditorContextKey, null)
const siteEditLocale = editorCtx?.siteEditLocale

const activeIndex = ref<number | null>(null)
const deleteModalOpen = ref(false)
const deletingIndex = ref<number | null>(null)

const galleryCategories = computed(() =>
  editorCtx
    ? editorCtx.getContentList("space_gallery_categories")
    : (props.modelValue.content?.space_gallery_categories ?? [])
)

const sidebarSections = computed(() =>
  galleryCategories.value.map((category, index) => ({
    id: index,
    label:
      asGalleryText(category.title).trim() ||
      adminUiFormat(ui.value.gallery.sectionFallback, { index: index + 1 }),
    description: asGalleryText(category.description).trim(),
    imageCount: (category.images ?? []).filter((image) => asGalleryText(image).trim()).length
  }))
)

const activeCategory = computed(() => {
  if (activeIndex.value === null) {
    return null
  }

  return galleryCategories.value[activeIndex.value] ?? null
})

const deletingSection = computed(() =>
  deletingIndex.value === null ? null : galleryCategories.value[deletingIndex.value]
)

function patchGalleryCategories(categories: PropertyGalleryCategory[]) {
  if (editorCtx) {
    editorCtx.patchContentList("space_gallery_categories", categories)
    return
  }

  emit("update:modelValue", {
    ...props.modelValue,
    content: {
      ...props.modelValue.content,
      space_gallery_categories: categories
    }
  })
}

function sectionTitle(section: PropertyGalleryCategory, index: number) {
  return (
    asGalleryText(section.title).trim() ||
    adminUiFormat(ui.value.gallery.sectionFallback, { index: index + 1 })
  )
}

function addGalleryCategory() {
  const categories = [...galleryCategories.value, createGalleryCategory(galleryCategories.value)]

  patchGalleryCategories(categories)
  activeIndex.value = categories.length - 1
}

function selectSection(index: number) {
  activeIndex.value = index
}

function updateActiveCategory(value: PropertyGalleryCategory) {
  if (activeIndex.value === null) {
    return
  }

  const categories = galleryCategories.value.map((category, index) =>
    index === activeIndex.value ? value : category
  )

  patchGalleryCategories(categories)
}

function openDeleteActive() {
  if (activeIndex.value === null) {
    return
  }

  deletingIndex.value = activeIndex.value
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

  const removedIndex = deletingIndex.value
  const categories = galleryCategories.value.filter((_, index) => index !== removedIndex)

  patchGalleryCategories(categories)

  if (props.saveDraft) {
    void props.saveDraft()
  }

  if (!categories.length) {
    activeIndex.value = null
  } else if (activeIndex.value !== null) {
    if (activeIndex.value >= categories.length) {
      activeIndex.value = categories.length - 1
    } else if (activeIndex.value === removedIndex) {
      activeIndex.value = Math.min(removedIndex, categories.length - 1)
    }
  }

  closeDelete()
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
    <div
      v-if="siteEditLocale || galleryCategories.length"
      class="admin-gallery-editor__toolbar"
    >
      <button
        v-if="galleryCategories.length"
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm admin-gallery-editor__toolbar-add"
        @click="addGalleryCategory"
      >
        <AdminIcon name="plus" :size="16" />
        {{ ui.gallery.addSection }}
      </button>

      <HostivLocalePillToggle
        v-if="siteEditLocale"
        v-model="siteEditLocale"
        class="admin-gallery-editor__toolbar-locale"
        :aria-label="ext.liveEditor.galleryLocalePillAria"
      />
    </div>

    <div v-if="galleryCategories.length" class="admin-gallery-editor__layout">
      <aside class="admin-gallery-editor__sidebar">
        <nav class="admin-gallery-editor__nav" :aria-label="ui.gallery.sectionsNav">
          <button
            v-for="section in sidebarSections"
            :key="section.id"
            type="button"
            class="admin-gallery-editor__nav-item"
            :class="{
              'admin-gallery-editor__nav-item--active': activeIndex === section.id
            }"
            :aria-current="activeIndex === section.id ? 'true' : undefined"
            @click="selectSection(section.id)"
          >
            <span class="admin-gallery-editor__nav-copy">
              <span class="admin-gallery-editor__nav-title-row">
                <span class="admin-gallery-editor__nav-label">{{ section.label }}</span>
                <span v-if="section.imageCount" class="admin-gallery-editor__nav-count">
                  {{ section.imageCount }}
                </span>
              </span>
              <span
                class="admin-gallery-editor__nav-description"
                :class="{ 'admin-gallery-editor__nav-description--empty': !section.description }"
              >
                {{ section.description || ui.common.noSubtitle }}
              </span>
            </span>
          </button>
        </nav>
      </aside>

      <main class="admin-gallery-editor__main">
        <article
          v-if="activeCategory && activeIndex !== null"
          class="admin-gallery-editor__detail"
        >
          <header class="admin-gallery-editor__detail-head">
            <div class="admin-gallery-editor__detail-copy">
              <h3>{{ sectionTitle(activeCategory, activeIndex) }}</h3>
              <p v-if="!isGalleryCategoryPublishable(activeCategory)" class="admin-gallery-editor__detail-hint">
                {{ ui.gallery.sectionCompleteHint }}
              </p>
            </div>
            <button
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-gallery-editor__delete-section"
              :title="ui.gallery.deleteSection"
              @click="openDeleteActive"
            >
              <AdminIcon name="trash" :size="16" />
              {{ ui.common.delete }}
            </button>
          </header>

          <AdminGallerySectionPanel
            :model-value="activeCategory"
            :section-index="activeIndex"
            :mark-required="markRequired"
            :show-field-examples="showFieldExamples"
            :upload="upload"
            :preview-url="previewUrl"
            :save-draft="saveDraft"
            @update:model-value="updateActiveCategory"
          />
        </article>
      </main>
    </div>

    <div v-else class="admin-gallery-editor__empty">
      <AdminEmptyState
        icon="image"
        :title="ui.gallery.emptyTitle"
        :description="ui.gallery.emptyDescription"
      >
        <button type="button" class="admin-btn admin-btn--secondary" @click="addGalleryCategory">
          <AdminIcon name="plus" :size="16" />
          {{ ui.gallery.addSection }}
        </button>
      </AdminEmptyState>
    </div>

    <AdminGallerySectionDeleteModal
      :open="deleteModalOpen"
      :section-title="
        deletingSection ? sectionTitle(deletingSection, deletingIndex ?? 0) : ui.gallery.thisSection
      "
      @cancel="closeDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
