<script setup lang="ts">
import type { PropertyAdminRecord } from "../../types/property-admin"
import {
  welcomeGuidePreviewScrollSelector,
  type WelcomeGuidePreviewPageId
} from "../../utils/admin-welcome-guide-preview-messages"
import { normalizeWelcomeGuide } from "../../utils/welcome-guide-content"
import { buildWelcomeGuidePagesHtml, welcomeGuidePreviewStyles } from "../../utils/welcome-guide-html"

const props = withDefaults(
  defineProps<{
    record: PropertyAdminRecord
    supabaseUrl?: string
    scrollPage?: WelcomeGuidePreviewPageId | null
    assetRevision?: number
    previewNonce?: number
  }>(),
  {
    supabaseUrl: "",
    scrollPage: null,
    assetRevision: 0,
    previewNonce: 0
  }
)

const shellRef = ref<HTMLElement | null>(null)

const guide = computed(() =>
  normalizeWelcomeGuide(props.record.content?.welcome_guide, props.record.brand_name, props.record)
)

const storedGuide = computed(() => props.record.content?.welcome_guide)

const pagesHtml = computed(() =>
  buildWelcomeGuidePagesHtml(props.record, guide.value, {
    supabaseUrl: props.supabaseUrl,
    assetRevision: props.assetRevision,
    previewNonce: props.previewNonce
  })
)

const pagesHtmlKey = computed(() => {
  const g = guide.value
  const raw = storedGuide.value

  return [
    props.assetRevision,
    props.previewNonce,
    raw?.cover_image_path,
    raw?.emergency_image_path,
    raw?.dining_image_path,
    g.cover_image_path,
    g.emergency_image_path,
    g.dining_image_path
  ].join("|")
})

const previewStyles = computed(() => welcomeGuidePreviewStyles(props.record))

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
