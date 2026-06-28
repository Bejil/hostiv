<script setup lang="ts">
import WelcomeGuidePreviewView from "../../../components/admin/WelcomeGuidePreviewView.vue"
import type { HostivLocale } from "../../../types/hostiv-locale"
import type { PropertyAdminRecord } from "../../../types/property-admin"
import {
  ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE,
  isAdminWelcomeGuidePreviewGuideMessage,
  type WelcomeGuidePreviewPageId
} from "../../../utils/admin-welcome-guide-preview-messages"
import { readAdminPreviewLocale } from "../../../utils/admin-preview-locale"

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

const route = useRoute()

const rawRecord = ref<PropertyAdminRecord | null>(null)
const previewLocale = ref<HostivLocale>(readAdminPreviewLocale(route.query.lang))
const supabaseUrl = ref("")
const scrollPage = ref<WelcomeGuidePreviewPageId | null>(null)
const assetRevision = ref(0)
const previewNonce = ref(0)

const previewViewKey = computed(
  () =>
    [
      previewLocale.value,
      assetRevision.value,
      previewNonce.value,
      rawRecord.value?.content?.welcome_guide?.cover_image_path,
      rawRecord.value?.content?.welcome_guide_en?.cover_image_path
    ].join("|")
)

watch(
  () => route.query.lang,
  (lang) => {
    previewLocale.value = readAdminPreviewLocale(lang)
  }
)

function onParentMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (!isAdminWelcomeGuidePreviewGuideMessage(event.data)) {
    return
  }

  rawRecord.value = event.data.record
  previewLocale.value = event.data.locale
  supabaseUrl.value = event.data.supabaseUrl
  scrollPage.value = event.data.scrollPage
  assetRevision.value = event.data.assetRevision ?? 0
  previewNonce.value = event.data.previewNonce ?? 0
}

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
    v-if="rawRecord"
    :key="previewViewKey"
    :record="rawRecord"
    :content-locale="previewLocale"
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
