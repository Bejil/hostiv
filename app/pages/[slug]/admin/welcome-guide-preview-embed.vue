<script setup lang="ts">
import WelcomeGuidePreviewView from "../../../components/admin/WelcomeGuidePreviewView.vue"
import type { PropertyAdminRecord } from "../../../types/property-admin"
import {
  ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE,
  isAdminWelcomeGuidePreviewGuideMessage,
  type WelcomeGuidePreviewPageId
} from "../../../utils/admin-welcome-guide-preview-messages"

definePageMeta({
  layout: false,
  ssr: false,
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length || slug.includes(".")) {
      return false
    }

    return slug.toLowerCase() !== "admin"
  }
})

const record = ref<PropertyAdminRecord | null>(null)
const supabaseUrl = ref("")
const scrollPage = ref<WelcomeGuidePreviewPageId | null>(null)
const assetRevision = ref(0)
const previewNonce = ref(0)

function onParentMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (!isAdminWelcomeGuidePreviewGuideMessage(event.data)) {
    return
  }

  record.value = event.data.record
  supabaseUrl.value = event.data.supabaseUrl
  scrollPage.value = event.data.scrollPage
  assetRevision.value = event.data.assetRevision ?? 0
  previewNonce.value = event.data.previewNonce ?? 0
}

const previewViewKey = computed(
  () =>
    [
      assetRevision.value,
      previewNonce.value,
      record.value?.content?.welcome_guide?.cover_image_path,
      record.value?.content?.welcome_guide?.emergency_image_path,
      record.value?.content?.welcome_guide?.dining_image_path
    ].join("|")
)

onMounted(() => {
  window.addEventListener("message", onParentMessage)
  window.parent.postMessage(
    { type: ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE.ready },
    window.location.origin
  )
})

onUnmounted(() => {
  window.removeEventListener("message", onParentMessage)
})
</script>

<template>
  <WelcomeGuidePreviewView
    v-if="record"
    :key="previewViewKey"
    :record="record"
    :supabase-url="supabaseUrl"
    :scroll-page="scrollPage"
    :asset-revision="assetRevision"
    :preview-nonce="previewNonce"
  />
</template>

<style>
html {
  margin: 0;
  background: #e8e0d6;
}

body {
  width: 100%;
  margin: 0;
  min-height: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: #e8e0d6;
  -webkit-overflow-scrolling: touch;
}
</style>
