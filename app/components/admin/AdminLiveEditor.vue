<script setup lang="ts">
import { Eye, EyeOff, PanelLeft } from "@lucide/vue"
import PropertyAdminEditor from "./PropertyAdminEditor.vue"
import AdminLivePreviewPane from "./AdminLivePreviewPane.vue"
import { adminLiveEditorContextKey } from "../../composables/admin-live-editor-context"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { AdminNavSectionId, AdminSectionId } from "../../data/admin-nav-sections"
import type { PropertyAdminRecord } from "../../types/property-admin"

const props = defineProps<{
  modelValue: PropertyAdminRecord
  slug: string
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  saveDraft?: () => Promise<boolean>
  saveError?: string | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyAdminRecord]
}>()

const sectionNav = inject(adminSectionNavKey)
const editorRef = ref<InstanceType<typeof PropertyAdminEditor> | null>(null)
const previewOpen = ref(true)
const activeSection = ref<AdminSectionId>("general")
const activePreviewBlock = ref<AdminNavSectionId | null>(null)

const record = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const showLivePreviewPanel = computed(() => activeSection.value === "customization")
const showLivePreview = computed(() => showLivePreviewPanel.value && previewOpen.value)

watch(
  () => sectionNav?.activeMenuSection.value,
  (sectionId) => {
    if (!sectionId) {
      return
    }

    activeSection.value = sectionId

    if (sectionId !== "customization") {
      activePreviewBlock.value = null
    }
  },
  { immediate: true }
)

watch(
  () => sectionNav?.activeCustomizationBlock.value ?? null,
  (blockId) => {
    if (sectionNav?.activeMenuSection.value === "customization") {
      activePreviewBlock.value = blockId
    }
  },
  { immediate: true }
)

function notifySectionChange(sectionId: AdminSectionId) {
  activeSection.value = sectionId
}

function notifyPreviewBlock(blockId: AdminNavSectionId | null) {
  activePreviewBlock.value = blockId
}

provide(adminLiveEditorContextKey, {
  previewEnabled: previewOpen,
  notifySectionChange,
  notifyPreviewBlock,
  activePreviewBlock
})

defineExpose({
  reopenOnboarding: () => editorRef.value?.reopenOnboarding?.(),
  tryAutoLaunch: () => editorRef.value?.tryAutoLaunch?.()
})
</script>

<template>
  <div
    class="admin-live-editor"
    :class="{ 'admin-live-editor--preview-open': showLivePreview }"
  >
    <div v-if="showLivePreviewPanel" class="admin-live-editor__toolbar">
      <div class="admin-live-editor__toolbar-start">
        <span class="admin-live-editor__mode">
          <PanelLeft :size="16" aria-hidden="true" />
          Éditeur visuel
        </span>
        <span class="admin-live-editor__toolbar-note">
          Aperçu instantané · enregistrez pour publier
        </span>
      </div>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        :aria-pressed="previewOpen"
        @click="previewOpen = !previewOpen"
      >
        <EyeOff v-if="previewOpen" :size="15" />
        <Eye v-else :size="15" />
        {{ previewOpen ? "Masquer l’aperçu" : "Afficher l’aperçu" }}
      </button>
    </div>

    <div class="admin-live-editor__workspace">
      <div class="admin-live-editor__editor">
        <PropertyAdminEditor
          ref="editorRef"
          class="admin-editor--in-live"
          :model-value="record"
          :slug="slug"
          :upload="upload"
          :preview-url="previewUrl"
          :save-draft="saveDraft"
          :save-error="saveError"
          @update:model-value="record = $event"
        />
      </div>

      <AdminLivePreviewPane
        v-if="showLivePreview"
        class="admin-live-editor__preview"
        :slug="slug"
        :record="record"
        :active-section="activeSection"
        :active-preview-block="activePreviewBlock"
      />
    </div>
  </div>
</template>
