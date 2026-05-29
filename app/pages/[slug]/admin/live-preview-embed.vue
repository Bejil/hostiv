<script setup lang="ts">
import PropertySitePageView from "../../../components/site/PropertySitePageView.vue"
import type { PropertySiteRecord } from "../../../types/property-site"
import {
  ADMIN_LIVE_PREVIEW_MESSAGE,
  isAdminLivePreviewSiteMessage
} from "../../../utils/admin-live-preview-messages"

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
const slug = computed(() => String(route.params.slug))

const frameWidth = computed(() => {
  const raw = Number(route.query.w)

  if (Number.isFinite(raw) && raw >= 320 && raw <= 1600) {
    return Math.round(raw)
  }

  return 1280
})

useHead({
  meta: [
    {
      name: "viewport",
      content: () => `width=${frameWidth.value}, initial-scale=1, viewport-fit=cover`
    }
  ]
})
const site = ref<PropertySiteRecord | null>(null)
const scrollAnchor = ref<string | null>(null)

let heightObserver: ResizeObserver | null = null
let heightReportFrame = 0
let lastReportedHeight = 0

function reportHeight() {
  if (typeof window === "undefined") {
    return
  }

  if (heightReportFrame) {
    cancelAnimationFrame(heightReportFrame)
  }

  heightReportFrame = requestAnimationFrame(() => {
    heightReportFrame = 0
    const height = Math.ceil(document.documentElement.scrollHeight)

    if (Math.abs(lastReportedHeight - height) <= 6) {
      return
    }

    lastReportedHeight = height
    window.parent.postMessage(
      { type: ADMIN_LIVE_PREVIEW_MESSAGE.height, height },
      window.location.origin
    )
  })
}

function onParentMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return
  }

  if (!isAdminLivePreviewSiteMessage(event.data)) {
    return
  }

  site.value = event.data.site
  scrollAnchor.value = event.data.scrollAnchor
  nextTick(reportHeight)
}

function setupHeightObserver() {
  if (typeof ResizeObserver === "undefined") {
    return
  }

  heightObserver?.disconnect()
  heightObserver = new ResizeObserver(() => {
    reportHeight()
  })
  heightObserver.observe(document.documentElement)
}

onMounted(() => {
  window.addEventListener("message", onParentMessage)
  setupHeightObserver()
  reportHeight()
  window.parent.postMessage(
    { type: ADMIN_LIVE_PREVIEW_MESSAGE.ready },
    window.location.origin
  )
})

onUnmounted(() => {
  window.removeEventListener("message", onParentMessage)
  heightObserver?.disconnect()
  heightObserver = null
})

watch(site, () => {
  nextTick(reportHeight)
})
</script>

<template>
  <PropertySitePageView
    v-if="site"
    :site="site"
    :slug="slug"
    live-preview
    :preview-scroll-anchor="scrollAnchor"
  />
</template>

<style>
html {
  width: 100%;
  height: 100%;
  margin: 0;
  background: #fff;
}

body {
  width: 100%;
  margin: 0;
  min-height: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fff;
  -webkit-overflow-scrolling: touch;
}
</style>
