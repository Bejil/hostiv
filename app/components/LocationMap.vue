<script setup lang="ts">
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

const mapRoot = ref<HTMLElement | null>(null)
let map: L.Map | null = null

onMounted(() => {
  if (!mapRoot.value) {
    return
  }

  const center: L.LatLngExpression = [props.latitude, props.longitude]

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

  const area = L.circle(center, {
    radius: props.radiusMeters,
    color: "#94633c",
    weight: 2,
    fillColor: "#94633c",
    fillOpacity: 0.18
  }).addTo(map)

  map.fitBounds(area.getBounds(), { padding: [24, 24] })

  nextTick(() => {
    map?.invalidateSize()
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div
    ref="mapRoot"
    class="location-map-frame"
    role="img"
    :aria-label="`Carte du quartier autour de ${address}, zone approximative sur ${radiusMeters} m`"
  />
</template>
