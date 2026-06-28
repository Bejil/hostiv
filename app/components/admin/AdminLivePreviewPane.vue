<script setup lang="ts">
import { Monitor, Smartphone, Tablet } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import {
  getAdminLivePreviewViewports,
  adminLivePreviewAnchorFor,
  type AdminLivePreviewViewport
} from "../../data/admin-live-editor"
import type { AdminNavSectionId, AdminSectionId } from "../../data/admin-nav-sections"
import type { HostivLocale } from "../../types/hostiv-locale"
import type { PropertyAdminRecord } from "../../types/property-admin"
import {
  ADMIN_LIVE_PREVIEW_MESSAGE,
  cloneSiteForLivePreviewPostMessage,
  type AdminLivePreviewSiteMessage
} from "../../utils/admin-live-preview-messages"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"
import { normalizeSiteTemplate } from "../../data/site-layouts"
import { mapAdminRecordToSitePreview } from "../../utils/map-admin-site-preview"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
  activeSection: AdminSectionId
  activePreviewBlock: AdminNavSectionId | null
  assetRevision: number
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)
const liveEditor = useAdminLiveEditorContext()
const siteEditLocale = liveEditor?.siteEditLocale ?? ref<HostivLocale>("fr")

const previewViewports = computed(() => getAdminLivePreviewViewports(locale.value))

const viewport = ref<AdminLivePreviewViewport>("desktop")
const canvasRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const canvasWidth = ref(0)
const canvasHeight = ref(720)
const iframeReady = ref(false)
let pendingPush = false
let pushScheduled = false
let needsAnotherPush = false
const previewPushNonce = ref(0)

const previewSite = computed(() => mapAdminRecordToSitePreview(props.record))

const siteTemplatePreviewKey = computed(() => {
  const template = normalizeSiteTemplate(props.record.content?.template, { forPublic: true })

  return `${template.layout}-${template.theme}`
})

const iframeKey = computed(
  () => `${viewport.value}-${siteEditLocale.value}-${siteTemplatePreviewKey.value}`
)

const viewportMeta = computed(
  () =>
    previewViewports.value.find((item) => item.id === viewport.value) ??
    previewViewports.value[0]
)

const designWidth = computed(() => viewportMeta.value.widthPx)

const previewScrollAnchor = computed(() =>
  adminLivePreviewAnchorFor(props.activeSection, props.activePreviewBlock)
)

const embedSrc = computed(
  () =>
    `/${encodeURIComponent(props.slug)}/admin/live-preview-embed?w=${designWidth.value}&lang=${siteEditLocale.value}`
)

/** Hauteur visible du panneau d’aperçu (le site défile à l’intérieur de l’iframe). */
const iframeViewportHeight = computed(() => Math.max(480, canvasHeight.value))

/** Réduction uniforme pour que la largeur « device » tienne dans le canvas sans déformer le rendu. */
const fitScale = computed(() => {
  const available = canvasWidth.value

  if (!available || !designWidth.value) {
    return 1
  }

  const padded = Math.max(0, available - 24)

  return Math.min(1, padded / designWidth.value)
})

const visualWidth = computed(() => Math.round(designWidth.value * fitScale.value))

/** Hauteur layout de l’iframe avant scale ; après scale = iframeViewportHeight. */
const iframeLayoutHeight = computed(() => {
  const scale = fitScale.value || 1

  return Math.ceil(iframeViewportHeight.value / scale)
})

const dimensionsLabel = computed(() => {
  const w = designWidth.value
  const pct = Math.round(fitScale.value * 100)

  return pct >= 100
    ? adminUiFormat(ext.value.livePreview.dimensionsFull, { width: w })
    : adminUiFormat(ext.value.livePreview.dimensionsScaled, { width: w, percent: pct })
})

const scalerStyle = computed(() => ({
  width: `${visualWidth.value}px`,
  height: `${iframeViewportHeight.value}px`
}))

const iframeStyle = computed(() => ({
  width: `${designWidth.value}px`,
  height: `${iframeLayoutHeight.value}px`,
  transform: `scale(${fitScale.value})`,
  transformOrigin: "top left"
}))

function pushSiteToIframe() {
  const win = iframeRef.value?.contentWindow

  if (!win) {
    pendingPush = true
    return
  }

  if (!iframeReady.value) {
    pendingPush = true
    return
  }

  pendingPush = false

  try {
    previewPushNonce.value += 1

    const payload: AdminLivePreviewSiteMessage = {
      type: ADMIN_LIVE_PREVIEW_MESSAGE.site,
      site: cloneSiteForLivePreviewPostMessage(previewSite.value),
      scrollAnchor: previewScrollAnchor.value,
      locale: siteEditLocale.value,
      assetRevision: props.assetRevision,
      previewNonce: previewPushNonce.value
    }

    win.postMessage(payload, window.location.origin)
  } catch (err: unknown) {
    console.error("[admin-live-preview] postMessage failed:", err)
  }
}

function schedulePushSiteToIframe() {
  if (pushScheduled) {
    needsAnotherPush = true
    return
  }

  pushScheduled = true

  requestAnimationFrame(() => {
    pushScheduled = false
    pushSiteToIframe()

    if (needsAnotherPush) {
      needsAnotherPush = false
      schedulePushSiteToIframe()
    }
  })
}

function onWindowMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data?.type === ADMIN_LIVE_PREVIEW_MESSAGE.ready) {
    iframeReady.value = true

    if (pendingPush) {
      pendingPush = false
    }

    schedulePushSiteToIframe()
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
  unregisterPreviewPusher = liveEditor?.registerSitePreviewPusher(() => {
    pushSiteToIframe()
  })
})

watch(canvasRef, (el) => observeCanvas(el), { immediate: true })

onUnmounted(() => {
  unregisterPreviewPusher?.()
  unregisterPreviewPusher = undefined
  window.removeEventListener("message", onWindowMessage)
  canvasObserver?.disconnect()
  canvasObserver = null
  iframeReady.value = false
})

watch(
  previewSite,
  () => {
    schedulePushSiteToIframe()
  },
  { deep: true }
)

watch(
  siteTemplatePreviewKey,
  () => {
    iframeReady.value = false
    pendingPush = true
    schedulePushSiteToIframe()
  },
  { flush: "post" }
)

watch(
  () => props.record,
  () => {
    schedulePushSiteToIframe()
  },
  { deep: true }
)

watch(previewScrollAnchor, () => {
  schedulePushSiteToIframe()
})

watch(
  siteEditLocale,
  () => {
    iframeReady.value = false
    pendingPush = true
    schedulePushSiteToIframe()
  },
  { flush: "post" }
)

watch(
  () => props.assetRevision,
  () => {
    schedulePushSiteToIframe()
  }
)

watch(viewport, () => {
  iframeReady.value = false
})

onErrorCaptured((err) => {
  console.error("[admin-live-preview] render error:", err)
  return true
})
</script>

<template>
  <div class="admin-live-preview">
    <div class="admin-live-preview__chrome">
      <div class="admin-live-preview__chrome-left">
        <span class="admin-live-preview__badge">{{ ext.livePreview.badge }}</span>
        <span class="admin-live-preview__hint">
          {{ ext.livePreview.hint }}
        </span>
        <span class="admin-live-preview__dimensions" aria-live="polite">
          {{ dimensionsLabel }}
        </span>
      </div>
      <div class="admin-live-preview__viewport-tabs" role="tablist" :aria-label="ext.livePreview.viewportTabsAria">
        <button
          v-for="item in previewViewports"
          :key="item.id"
          type="button"
          role="tab"
          class="admin-live-preview__viewport-btn"
          :class="{ 'admin-live-preview__viewport-btn--active': viewport === item.id }"
          :aria-selected="viewport === item.id"
          @click="viewport = item.id"
        >
          <Monitor v-if="item.id === 'desktop'" :size="14" aria-hidden="true" />
          <Tablet v-else-if="item.id === 'tablet'" :size="14" aria-hidden="true" />
          <Smartphone v-else :size="14" aria-hidden="true" />
          {{ item.label }}
        </button>
      </div>
    </div>

    <div ref="canvasRef" class="admin-live-preview__canvas">
      <div class="admin-live-preview__scaler" :style="scalerStyle">
        <iframe
          :key="iframeKey"
          ref="iframeRef"
          class="admin-live-preview__iframe"
          :class="`admin-live-preview__iframe--${viewport}`"
          :src="embedSrc"
          :style="iframeStyle"
          :width="designWidth"
          :height="iframeLayoutHeight"
          :title="ext.livePreview.iframeTitle"
          @load="onIframeLoad"
        />
      </div>
    </div>
  </div>
</template>
