<script setup lang="ts">
import { Eye, EyeOff, PanelLeft } from "@lucide/vue"
import PropertyAdminEditor from "./PropertyAdminEditor.vue"
import AdminLivePreviewPane from "./AdminLivePreviewPane.vue"
import AdminWelcomeGuidePreviewPane from "./AdminWelcomeGuidePreviewPane.vue"
import { adminLiveEditorContextKey } from "../../composables/admin-live-editor-context"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { WelcomeGuidePreviewPageId } from "../../utils/admin-welcome-guide-preview-messages"
import type { AdminNavSectionId, AdminSectionId } from "../../data/admin-nav-sections"
import type { PropertyAdminRecord } from "../../types/property-admin"
import type { HostivLocale } from "../../types/hostiv-locale"

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

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const sectionNav = inject(adminSectionNavKey)
const editorRef = ref<InstanceType<typeof PropertyAdminEditor> | null>(null)
const previewOpen = ref(true)
const activeSection = ref<AdminSectionId>("general")
const activePreviewBlock = ref<AdminNavSectionId | null>(null)
const activeWelcomeGuidePage = ref<WelcomeGuidePreviewPageId | undefined>("page-1")
const welcomeGuidePreviewAssetRevision = ref(0)
const sitePreviewAssetRevision = ref(0)
const siteEditLocale = ref<HostivLocale>("fr")
let welcomeGuidePreviewPushHandler: (() => void) | null = null
let sitePreviewPushHandler: (() => void) | null = null

function registerWelcomeGuidePreviewPusher(push: () => void) {
  welcomeGuidePreviewPushHandler = push

  return () => {
    if (welcomeGuidePreviewPushHandler === push) {
      welcomeGuidePreviewPushHandler = null
    }
  }
}

function bumpWelcomeGuidePreviewAssets() {
  welcomeGuidePreviewAssetRevision.value += 1

  nextTick(() => {
    welcomeGuidePreviewPushHandler?.()
  })
}

function registerSitePreviewPusher(push: () => void) {
  sitePreviewPushHandler = push

  return () => {
    if (sitePreviewPushHandler === push) {
      sitePreviewPushHandler = null
    }
  }
}

function bumpSitePreviewAssets() {
  sitePreviewAssetRevision.value += 1

  nextTick(() => {
    sitePreviewPushHandler?.()
  })
}

const record = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const showLivePreviewPanel = computed(
  () => activeSection.value === "customization" || activeSection.value === "welcome-guide"
)
const showLivePreview = computed(() => showLivePreviewPanel.value && previewOpen.value)
const showSitePreview = computed(() => showLivePreview.value && activeSection.value === "customization")
const showWelcomeGuidePreview = computed(
  () => showLivePreview.value && activeSection.value === "welcome-guide"
)
const previewToolbarNote = computed(() =>
  activeSection.value === "welcome-guide"
    ? ext.value.liveEditor.toolbarNoteWelcomeGuide
    : ext.value.liveEditor.toolbarNoteCustomization
)

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

function setWelcomeGuidePage(page: WelcomeGuidePreviewPageId | undefined) {
  activeWelcomeGuidePage.value = page
}

provide(adminLiveEditorContextKey, {
  previewEnabled: previewOpen,
  siteEditLocale,
  notifySectionChange,
  notifyPreviewBlock,
  activePreviewBlock,
  activeWelcomeGuidePage,
  setWelcomeGuidePage,
  welcomeGuidePreviewAssetRevision,
  bumpWelcomeGuidePreviewAssets,
  registerWelcomeGuidePreviewPusher,
  sitePreviewAssetRevision,
  bumpSitePreviewAssets,
  registerSitePreviewPusher
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
          {{ ext.liveEditor.modeLabel }}
        </span>
        <span class="admin-live-editor__toolbar-note">
          {{ previewToolbarNote }}
        </span>
      </div>
      <div class="admin-live-editor__toolbar-end">
        <HostivLocalePillToggle
          v-if="activeSection === 'customization' || activeSection === 'welcome-guide'"
          v-model="siteEditLocale"
          :aria-label="
            activeSection === 'welcome-guide'
              ? ext.liveEditor.welcomeGuideLocalePillAria
              : ext.liveEditor.siteLocalePillAria
          "
        />
        <button
          type="button"
          class="admin-btn admin-btn--secondary admin-btn--sm"
          :aria-pressed="previewOpen"
          @click="previewOpen = !previewOpen"
        >
          <EyeOff v-if="previewOpen" :size="15" />
          <Eye v-else :size="15" />
          {{ previewOpen ? ext.liveEditor.toggleHide : ext.liveEditor.toggleShow }}
        </button>
      </div>
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
        v-if="showSitePreview"
        class="admin-live-editor__preview"
        :slug="slug"
        :record="record"
        :active-section="activeSection"
        :active-preview-block="activePreviewBlock"
        :asset-revision="sitePreviewAssetRevision"
      />
      <AdminWelcomeGuidePreviewPane
        v-else-if="showWelcomeGuidePreview"
        class="admin-live-editor__preview"
        :slug="slug"
        :record="record"
        :active-page="activeWelcomeGuidePage"
        :asset-revision="welcomeGuidePreviewAssetRevision"
      />
    </div>
  </div>
</template>
