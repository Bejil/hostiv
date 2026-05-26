<script setup lang="ts">
import type { Circle, LatLngExpression, Map } from "leaflet"

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

type LeafletNamespace = typeof import("leaflet")

const mapRoot = ref<HTMLElement | null>(null)
const isReady = ref(false)

let leafletLib: LeafletNamespace | null = null
let map: Map | null = null
let areaLayer: Circle | null = null
let resizeObserver: ResizeObserver | null = null
let initFrame = 0

function toCoord(value: number) {
  return Number(value)
}

function getCenter(): LatLngExpression {
  return [toCoord(props.latitude), toCoord(props.longitude)]
}

function invalidateSoon() {
  nextTick(() => {
    requestAnimationFrame(() => {
      map?.invalidateSize()
    })
  })
}

function destroyMap() {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
  areaLayer = null
  isReady.value = false
}

async function loadLeaflet(): Promise<LeafletNamespace> {
  if (!leafletLib) {
    await import("leaflet/dist/leaflet.css")
    leafletLib = await import("leaflet")
  }

  return leafletLib
}

function updateMapView() {
  if (!map || !areaLayer) {
    return
  }

  const center = getCenter()

  areaLayer.setLatLng(center)
  areaLayer.setRadius(props.radiusMeters)
  map.fitBounds(areaLayer.getBounds(), { padding: [24, 24] })
  invalidateSoon()
}

async function createMap() {
  if (!mapRoot.value || import.meta.server) {
    return
  }

  const L = await loadLeaflet()
  const center = getCenter()

  map = L.map(mapRoot.value, {
    center,
    zoom: 15,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true
  })

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  areaLayer = L.circle(center, {
    radius: props.radiusMeters,
    color: "#94633c",
    weight: 2,
    fillColor: "#94633c",
    fillOpacity: 0.18
  }).addTo(map)

  map.fitBounds(areaLayer.getBounds(), { padding: [24, 24] })

  resizeObserver = new ResizeObserver(() => {
    map?.invalidateSize()
  })
  resizeObserver.observe(mapRoot.value)

  isReady.value = true
  invalidateSoon()
}

async function initMapWhenReady() {
  if (import.meta.server) {
    return
  }

  const frame = ++initFrame

  await nextTick()

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (frame !== initFrame) {
      return
    }

    const element = mapRoot.value

    if (!element) {
      return
    }

    if (element.offsetWidth > 0 && element.offsetHeight > 0) {
      destroyMap()
      await createMap()
      return
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }

  if (mapRoot.value && frame === initFrame) {
    destroyMap()
    await createMap()
  }
}

onMounted(() => {
  void initMapWhenReady()
})

watch(
  () => [props.latitude, props.longitude, props.radiusMeters] as const,
  () => {
    if (import.meta.server) {
      return
    }

    if (!map) {
      void initMapWhenReady()
      return
    }

    updateMapView()
  }
)

onBeforeUnmount(() => {
  initFrame += 1
  destroyMap()
})
</script>

<template>
  <div
    ref="mapRoot"
    class="location-map-frame"
    :class="{ 'location-map-frame--ready': isReady }"
    role="img"
    :aria-label="`Carte du quartier autour de ${address}, zone approximative sur ${radiusMeters} m`"
  />
</template>
