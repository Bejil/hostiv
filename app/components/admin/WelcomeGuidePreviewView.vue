<script setup lang="ts">
import type { HostivLocale } from "../../types/hostiv-locale"
import type { PropertyAdminRecord } from "../../types/property-admin"
import {
  welcomeGuidePreviewScrollSelector,
  type WelcomeGuidePreviewPageId
} from "../../utils/admin-welcome-guide-preview-messages"
import { normalizeWelcomeGuide } from "../../utils/welcome-guide-content"
import { applyWelcomeGuideLocaleToRecord } from "../../utils/welcome-guide-locale"
import { buildWelcomeGuidePagesHtml, welcomeGuidePreviewStyles } from "../../utils/welcome-guide-html"

const props = withDefaults(
  defineProps<{
    record: PropertyAdminRecord
    contentLocale?: HostivLocale
    supabaseUrl?: string
    scrollPage?: WelcomeGuidePreviewPageId | null
    assetRevision?: number
    previewNonce?: number
  }>(),
  {
    contentLocale: "fr",
    supabaseUrl: "",
    scrollPage: null,
    assetRevision: 0,
    previewNonce: 0
  }
)

const shellRef = ref<HTMLElement | null>(null)

const previewRecord = computed(() =>
  applyWelcomeGuideLocaleToRecord(props.record, props.contentLocale)
)

const guide = computed(() =>
  normalizeWelcomeGuide(
    previewRecord.value.content?.welcome_guide,
    previewRecord.value.brand_name,
    previewRecord.value
  )
)

const pagesHtml = computed(() =>
  buildWelcomeGuidePagesHtml(previewRecord.value, guide.value, {
    supabaseUrl: props.supabaseUrl,
    assetRevision: props.assetRevision,
    previewNonce: props.previewNonce,
    locale: props.contentLocale
  })
)

const pagesHtmlKey = computed(() => {
  const g = guide.value

  return [
    props.contentLocale,
    props.assetRevision,
    props.previewNonce,
    g.cover_title,
    g.welcome_body,
    g.parking_street,
    g.cover_image_path,
    g.emergency_image_path,
    g.dining_image_path
  ].join("|")
})

const previewStyles = computed(() => welcomeGuidePreviewStyles(previewRecord.value))

useHead({
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;600;700&family=Inter:wght@400;500&display=swap"
    }
  ],
  style: computed(() => [{ key: "welcome-guide-preview", innerHTML: previewStyles.value }])
})

function scrollToPage(page: WelcomeGuidePreviewPageId | null | undefined) {
  const selector = welcomeGuidePreviewScrollSelector(page ?? null)

  if (!selector) {
    return
  }

  nextTick(() => {
    shellRef.value?.querySelector(selector)?.scrollIntoView({ block: "start" })
  })
}

watch(
  () => props.scrollPage,
  (page) => {
    if (page) {
      scrollToPage(page)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div ref="shellRef" :key="pagesHtmlKey" class="wg-preview-shell" v-html="pagesHtml" />
</template>
