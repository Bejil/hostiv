<script setup lang="ts">
import { RefreshCw } from "@lucide/vue"
import type { PropertyAdminRecord } from "../../types/property-admin"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"
import {
  ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE,
  cloneRecordForWelcomeGuidePreview,
  type AdminWelcomeGuidePreviewGuideMessage,
  type WelcomeGuidePreviewPageId
} from "../../utils/admin-welcome-guide-preview-messages"
import { applyWelcomeGuideLocaleToRecord } from "../../utils/welcome-guide-locale"
import { WELCOME_GUIDE_A4_WIDTH_PX } from "../../utils/welcome-guide-html"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
  activePage: WelcomeGuidePreviewPageId | undefined
  assetRevision: number
}>()

const { ui } = useAdminUi()
const liveEditor = useAdminLiveEditorContext()

function buildLocalizedPreviewRecord() {
  const locale = liveEditor?.siteEditLocale.value ?? "fr"

  return applyWelcomeGuideLocaleToRecord(props.record, locale)
}

const runtimeConfig = useRuntimeConfig()
const supabaseUrl = computed(() => String(runtimeConfig.public.supabaseUrl || "").trim())

const iframeRef = ref<HTMLIFrameElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const canvasWidth = ref(0)
const canvasHeight = ref(720)
const iframeReady = ref(false)

const designWidth = WELCOME_GUIDE_A4_WIDTH_PX

const embedSrc = computed(
  () => `/${encodeURIComponent(props.slug)}/admin/welcome-guide-preview-embed`
)

const scrollPage = computed(() => props.activePage ?? null)

const fitScale = computed(() => {
  const available = Math.max(0, canvasWidth.value - 24)

  if (!available) {
    return 1
  }

  return Math.min(1, available / designWidth)
})

const visualWidth = computed(() => Math.round(designWidth * fitScale.value))

const iframeViewportHeight = computed(() => Math.max(480, canvasHeight.value))

const iframeLayoutHeight = computed(() => {
  const scale = fitScale.value || 1

  return Math.ceil(iframeViewportHeight.value / scale)
})

const scalerStyle = computed(() => ({
  width: `${visualWidth.value}px`,
  height: `${iframeViewportHeight.value}px`
}))

const iframeStyle = computed(() => ({
  width: `${designWidth}px`,
  height: `${iframeLayoutHeight.value}px`,
  transform: `scale(${fitScale.value})`,
  transformOrigin: "top left"
}))

let pendingScrollPage: WelcomeGuidePreviewPageId | null | undefined = undefined
let pushRafId: number | null = null
let needsAnotherPush = false
const previewPushNonce = ref(0)

function pushGuideToIframe(scrollTo: WelcomeGuidePreviewPageId | null = null) {
  const win = iframeRef.value?.contentWindow

  if (!win || !iframeReady.value) {
    return
  }

  try {
    previewPushNonce.value += 1

    const payload: AdminWelcomeGuidePreviewGuideMessage = {
      type: ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE.guide,
      record: cloneRecordForWelcomeGuidePreview(buildLocalizedPreviewRecord()),
      supabaseUrl: supabaseUrl.value,
      scrollPage: scrollTo,
      assetRevision: props.assetRevision,
      previewNonce: previewPushNonce.value
    }

    win.postMessage(payload, window.location.origin)
  } catch (err: unknown) {
    console.error("[admin-welcome-guide-preview] postMessage failed:", err)
  }
}

function schedulePushGuideToIframe(scrollTo: WelcomeGuidePreviewPageId | null = null) {
  if (scrollTo !== null) {
    pendingScrollPage = scrollTo
  }

  if (pushRafId !== null) {
    needsAnotherPush = true
    return
  }

  pushRafId = requestAnimationFrame(() => {
    pushRafId = null
    const scroll = pendingScrollPage ?? null

    pendingScrollPage = undefined
    pushGuideToIframe(scroll)

    if (needsAnotherPush) {
      needsAnotherPush = false
      schedulePushGuideToIframe(null)
    }
  })
}

function onWindowMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data?.type === ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE.ready) {
    iframeReady.value = true
    schedulePushGuideToIframe(scrollPage.value)
  }
}

function onIframeLoad() {
  iframeReady.value = false
}

let canvasObserver: ResizeObserver | null = null

function observeCanvas(el: HTMLElement | null) {
  canvasObserver?.disconnect()
  canvasObserver = null

  if (!el || typeof ResizeObserver === "undefined") {
    return
  }

  canvasObserver = new ResizeObserver((entries) => {
    const entry = entries[0]

    if (entry) {
      canvasWidth.value = Math.floor(entry.contentRect.width)
      canvasHeight.value = Math.floor(entry.contentRect.height)
    }
  })
  canvasObserver.observe(el)
  canvasWidth.value = Math.floor(el.clientWidth)
  canvasHeight.value = Math.floor(el.clientHeight)
}

let unregisterPreviewPusher: (() => void) | undefined

onMounted(() => {
  window.addEventListener("message", onWindowMessage)
  unregisterPreviewPusher = liveEditor?.registerWelcomeGuidePreviewPusher(() => {
    pushGuideToIframe(scrollPage.value)
  })
})

watch(canvasRef, (el) => observeCanvas(el), { immediate: true })

watch(
  () =>
    [
      props.record,
      props.assetRevision,
      liveEditor?.siteEditLocale.value,
      props.record.content.welcome_guide?.emergency_image_path,
      props.record.content.welcome_guide?.dining_image_path,
      props.record.content.welcome_guide?.cover_image_path,
      props.record.content.welcome_guide_en?.emergency_image_path,
      props.record.content.welcome_guide_en?.dining_image_path,
      props.record.content.welcome_guide_en?.cover_image_path
    ] as const,
  () => {
    schedulePushGuideToIframe(null)
  },
  { deep: true, flush: "post" }
)

watch(scrollPage, (page) => {
  schedulePushGuideToIframe(page)
})

onUnmounted(() => {
  unregisterPreviewPusher?.()
  unregisterPreviewPusher = undefined

  if (pushRafId !== null) {
    cancelAnimationFrame(pushRafId)
    pushRafId = null
  }
  window.removeEventListener("message", onWindowMessage)
  canvasObserver?.disconnect()
  canvasObserver = null
  iframeReady.value = false
})
</script>

<template>
  <div class="admin-live-preview admin-guide-preview">
    <div class="admin-live-preview__chrome">
      <div class="admin-live-preview__chrome-left">
        <span class="admin-live-preview__badge">{{ ui.welcomeGuide.preview.badge }}</span>
        <span class="admin-live-preview__hint">
          {{ ui.welcomeGuide.preview.hint }}
        </span>
      </div>
      <button
        type="button"
        class="admin-btn admin-btn--secondary admin-btn--sm"
        @click="pushGuideToIframe(null)"
      >
        <RefreshCw :size="15" />
        {{ ui.welcomeGuide.preview.refresh }}
      </button>
    </div>

    <div ref="canvasRef" class="admin-live-preview__canvas">
      <div class="admin-live-preview__scaler" :style="scalerStyle">
        <iframe
          ref="iframeRef"
          class="admin-live-preview__iframe"
          :src="embedSrc"
          :style="iframeStyle"
          :width="designWidth"
          :height="iframeLayoutHeight"
          :title="ui.welcomeGuide.preview.iframeTitle"
          @load="onIframeLoad"
        />
      </div>
    </div>
  </div>
</template>
