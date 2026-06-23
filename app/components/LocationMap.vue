<script setup lang="ts">
import type { Map as MapLibreMap } from "maplibre-gl"
import {
  boundsFromCircle,
  buildOpenStreetMapEmbedUrl,
  buildOpenStreetMapExternalUrl,
  createCircleGeoJson
} from "../utils/location-map-geo"

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty"

const props = withDefaults(
  defineProps<{
    latitude: number
    longitude: number
    address: string
    radiusMeters?: number
  }>(),
  {
    radiusMeters: 400
  }
)

const { locale } = useHostivLocale()

const mapRoot = ref<HTMLElement | null>(null)
const useEmbedFallback = ref(false)

let map: MapLibreMap | null = null
let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let scrollRevealObserver: MutationObserver | null = null
let loadFallbackTimer: ReturnType<typeof setTimeout> | null = null
let initToken = 0

const latitude = computed(() => Number(props.latitude))
const longitude = computed(() => Number(props.longitude))
const radiusMeters = computed(() => Number(props.radiusMeters) || 400)

const hasCoordinates = computed(
  () =>
    Number.isFinite(latitude.value) &&
    Number.isFinite(longitude.value) &&
    !(latitude.value === 0 && longitude.value === 0)
)

const embedUrl = computed(() =>
  hasCoordinates.value
    ? buildOpenStreetMapEmbedUrl(latitude.value, longitude.value)
    : null
)

const externalMapUrl = computed(() =>
  hasCoordinates.value
    ? buildOpenStreetMapExternalUrl(latitude.value, longitude.value)
    : "#"
)

const mapAriaLabel = computed(() =>
  locale.value === "en"
    ? `Map around ${props.address}`
    : `Carte du quartier autour de ${props.address}`
)

const externalMapLabel = computed(() =>
  locale.value === "en" ? "Open in OpenStreetMap" : "Ouvrir dans OpenStreetMap"
)

function destroyMap() {
  if (loadFallbackTimer) {
    clearTimeout(loadFallbackTimer)
    loadFallbackTimer = null
  }

  resizeObserver?.disconnect()
  resizeObserver = null
  visibilityObserver?.disconnect()
  visibilityObserver = null
  scrollRevealObserver?.disconnect()
  scrollRevealObserver = null
  map?.remove()
  map = null
}

function fitMapToArea() {
  if (!map) {
    return
  }

  const bounds = boundsFromCircle(latitude.value, longitude.value, radiusMeters.value)

  map.fitBounds(
    [
      [bounds.west, bounds.south],
      [bounds.east, bounds.north]
    ],
    { padding: 28, duration: 0 }
  )
}

function updateAreaLayer() {
  if (!map || !map.getSource("location-area")) {
    return
  }

  const source = map.getSource("location-area")

  if (source?.type === "geojson") {
    source.setData(createCircleGeoJson(latitude.value, longitude.value, radiusMeters.value))
  }

  fitMapToArea()
}

async function waitForMapSize(element: HTMLElement, token: number) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (token !== initToken) {
      return false
    }

    if (element.offsetWidth > 0 && element.offsetHeight > 0) {
      return true
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }

  return element.offsetWidth > 0 && element.offsetHeight > 0
}

async function createMapLibre() {
  if (import.meta.server || !mapRoot.value || map || useEmbedFallback.value) {
    return
  }

  const token = ++initToken
  const hasSize = await waitForMapSize(mapRoot.value, token)

  if (!hasSize || token !== initToken || !mapRoot.value) {
    useEmbedFallback.value = true
    return
  }

  try {
    const maplibregl = await import("maplibre-gl")

    if (token !== initToken || !mapRoot.value) {
      return
    }

    map = new maplibregl.Map({
      container: mapRoot.value,
      style: OPENFREEMAP_STYLE,
      center: [longitude.value, latitude.value],
      zoom: 15,
      scrollZoom: false,
      attributionControl: true
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left")

    loadFallbackTimer = window.setTimeout(() => {
      if (!useEmbedFallback.value) {
        useEmbedFallback.value = true
        destroyMap()
      }
    }, 8_000)

    map.on("load", () => {
      if (loadFallbackTimer) {
        clearTimeout(loadFallbackTimer)
        loadFallbackTimer = null
      }

      if (!map) {
        return
      }

      map.addSource("location-area", {
        type: "geojson",
        data: createCircleGeoJson(latitude.value, longitude.value, radiusMeters.value)
      })

      map.addLayer({
        id: "location-area-fill",
        type: "fill",
        source: "location-area",
        paint: {
          "fill-color": "#94633c",
          "fill-opacity": 0.18
        }
      })

      map.addLayer({
        id: "location-area-line",
        type: "line",
        source: "location-area",
        paint: {
          "line-color": "#94633c",
          "line-width": 2
        }
      })

      fitMapToArea()
      map.resize()
    })

    resizeObserver = new ResizeObserver(() => {
      map?.resize()
    })
    resizeObserver.observe(mapRoot.value)
  } catch {
    useEmbedFallback.value = true
    destroyMap()
  }
}

async function ensureMap() {
  if (useEmbedFallback.value || !hasCoordinates.value) {
    return
  }

  if (map) {
    map.resize()
    updateAreaLayer()
    return
  }

  await createMapLibre()
}

function observeVisibility() {
  if (import.meta.server || useEmbedFallback.value || !mapRoot.value) {
    return
  }

  if (typeof IntersectionObserver === "undefined") {
    void ensureMap()
    return
  }

  visibilityObserver?.disconnect()

  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return
      }

      void ensureMap()
    },
    { threshold: 0.05, rootMargin: "40px 0px" }
  )

  visibilityObserver.observe(mapRoot.value)
}

function observeScrollRevealParent(root: HTMLElement) {
  const section = root.closest<HTMLElement>(".scroll-reveal")

  if (!section) {
    return
  }

  const onReveal = () => {
    if (section.classList.contains("scroll-reveal-visible")) {
      void ensureMap()
    }
  }

  scrollRevealObserver?.disconnect()

  if (section.classList.contains("scroll-reveal-visible")) {
    onReveal()
    return
  }

  scrollRevealObserver = new MutationObserver(onReveal)
  scrollRevealObserver.observe(section, { attributes: true, attributeFilter: ["class"] })
}

onMounted(async () => {
  if (!hasCoordinates.value) {
    return
  }

  await nextTick()
  observeVisibility()
  void ensureMap()

  if (mapRoot.value) {
    observeScrollRevealParent(mapRoot.value)
  }
})

watch(
  () => [latitude.value, longitude.value, radiusMeters.value] as const,
  () => {
    if (import.meta.server || !hasCoordinates.value) {
      return
    }

    if (useEmbedFallback.value) {
      return
    }

    if (!map) {
      void ensureMap()
      return
    }

    updateAreaLayer()
  }
)

onBeforeUnmount(() => {
  initToken += 1
  destroyMap()
})
</script>

<template>
  <div class="location-map-shell">
    <iframe
      v-if="useEmbedFallback && embedUrl"
      class="location-map-frame location-map-frame--embed"
      :src="embedUrl"
      :title="mapAriaLabel"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    />

    <div
      v-else-if="hasCoordinates"
      ref="mapRoot"
      class="location-map-frame location-map-frame--maplibre"
      role="img"
      :aria-label="mapAriaLabel"
    />

    <div
      v-else
      class="location-map-frame location-map-frame--placeholder"
      aria-hidden="true"
    />

    <a
      v-if="hasCoordinates && useEmbedFallback"
      class="location-map-external-link"
      :href="externalMapUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ externalMapLabel }}
    </a>
  </div>
</template>

<style scoped>
.location-map-shell {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  min-height: 280px;
  height: 100%;
}

.location-map-frame {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 280px;
  border: 0;
  background: #ebe4da;
}

.location-map-frame--embed {
  border: 0;
}

.location-map-frame--maplibre :deep(.maplibregl-map),
.location-map-frame--maplibre :deep(.maplibregl-canvas) {
  width: 100% !important;
  height: 100% !important;
}

.location-map-frame--placeholder {
  background: linear-gradient(135deg, #ebe4da 0%, #e0d6c8 100%);
}

.location-map-external-link {
  align-self: flex-end;
  margin-top: 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94633c;
  text-decoration: none;
}

.location-map-external-link:hover {
  text-decoration: underline;
}

.location-map-frame--maplibre :deep(.maplibregl-control-attribution) {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.82);
}
</style>
