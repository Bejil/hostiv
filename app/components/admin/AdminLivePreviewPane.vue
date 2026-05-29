<script setup lang="ts">
import { Monitor, Smartphone, Tablet } from "@lucide/vue"
import {
  ADMIN_LIVE_PREVIEW_VIEWPORTS,
  adminLivePreviewAnchorFor,
  type AdminLivePreviewViewport
} from "../../data/admin-live-editor"
import type { AdminNavSectionId, AdminSectionId } from "../../data/admin-nav-sections"
import type { PropertyAdminRecord } from "../../types/property-admin"
import {
  ADMIN_LIVE_PREVIEW_MESSAGE,
  cloneSiteForLivePreviewPostMessage,
  type AdminLivePreviewSiteMessage
} from "../../utils/admin-live-preview-messages"
import { mapAdminRecordToSitePreview } from "../../utils/map-admin-site-preview"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
  activeSection: AdminSectionId
  activePreviewBlock: AdminNavSectionId | null
}>()

const viewport = ref<AdminLivePreviewViewport>("desktop")
const canvasRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const canvasWidth = ref(0)
const canvasHeight = ref(720)
const iframeReady = ref(false)
let pushScheduled = false

const previewSite = computed(() => mapAdminRecordToSitePreview(props.record))

const viewportMeta = computed(
  () => ADMIN_LIVE_PREVIEW_VIEWPORTS.find((item) => item.id === viewport.value) ?? ADMIN_LIVE_PREVIEW_VIEWPORTS[0]
)

const designWidth = computed(() => viewportMeta.value.widthPx)

const previewScrollAnchor = computed(() =>
  adminLivePreviewAnchorFor(props.activeSection, props.activePreviewBlock)
)

const embedSrc = computed(
  () =>
    `/${encodeURIComponent(props.slug)}/admin/live-preview-embed?w=${designWidth.value}`
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

  return pct >= 100 ? `${w}px · 100 %` : `${w}px · ${pct} % (ajusté au panneau)`
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

  if (!win || !iframeReady.value) {
    return
  }

  try {
    const payload: AdminLivePreviewSiteMessage = {
      type: ADMIN_LIVE_PREVIEW_MESSAGE.site,
      site: cloneSiteForLivePreviewPostMessage(previewSite.value),
      scrollAnchor: previewScrollAnchor.value
    }

    win.postMessage(payload, window.location.origin)
  } catch (err: unknown) {
    console.error("[admin-live-preview] postMessage failed:", err)
  }
}

function schedulePushSiteToIframe() {
  if (pushScheduled) {
    return
  }

  pushScheduled = true

  requestAnimationFrame(() => {
    pushScheduled = false
    pushSiteToIframe()
  })
}

function onWindowMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data?.type === ADMIN_LIVE_PREVIEW_MESSAGE.ready) {
    iframeReady.value = true
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

onMounted(() => {
  window.addEventListener("message", onWindowMessage)
})

watch(canvasRef, (el) => observeCanvas(el), { immediate: true })

onUnmounted(() => {
  window.removeEventListener("message", onWindowMessage)
  canvasObserver?.disconnect()
  canvasObserver = null
  iframeReady.value = false
})

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
        <span class="admin-live-preview__badge">Aperçu live</span>
        <span class="admin-live-preview__hint">
          Modifications visibles sans enregistrer · faites défiler l’aperçu pour parcourir la page
        </span>
        <span class="admin-live-preview__dimensions" aria-live="polite">
          {{ dimensionsLabel }}
        </span>
      </div>
      <div class="admin-live-preview__viewport-tabs" role="tablist" aria-label="Taille d’écran">
        <button
          v-for="item in ADMIN_LIVE_PREVIEW_VIEWPORTS"
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
          :key="viewport"
          ref="iframeRef"
          class="admin-live-preview__iframe"
          :class="`admin-live-preview__iframe--${viewport}`"
          :src="embedSrc"
          :style="iframeStyle"
          :width="designWidth"
          :height="iframeLayoutHeight"
          title="Aperçu du site"
          @load="onIframeLoad"
        />
      </div>
    </div>
  </div>
</template>
