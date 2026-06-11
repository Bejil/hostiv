<script setup lang="ts">
import {
  HOSTIV_LOCALE_FLAGS,
  HOSTIV_LOCALE_LABELS,
  type HostivLocale
} from "../../types/hostiv-locale"

const modelValue = defineModel<HostivLocale>({ required: true })

defineProps<{
  ariaLabel?: string
}>()

const trackRef = ref<HTMLElement | null>(null)
const thumbRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const travelDistance = ref(0)
const dragTranslateX = ref<number | null>(null)
const pointerStartX = ref(0)
const didDrag = ref(false)

const DRAG_THRESHOLD = 4

function measureTravel() {
  const track = trackRef.value
  const thumb = thumbRef.value
  if (!track || !thumb) {
    return
  }

  const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0
  travelDistance.value = track.clientWidth - thumb.offsetWidth - padding * 2
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measureTravel()
  const track = trackRef.value
  if (!track) {
    return
  }

  resizeObserver = new ResizeObserver(measureTravel)
  resizeObserver.observe(track)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function toggleLocale() {
  modelValue.value = modelValue.value === "fr" ? "en" : "fr"
}

function settledTranslateX() {
  return modelValue.value === "en" ? travelDistance.value : 0
}

const thumbTranslateX = computed(() => {
  if (dragTranslateX.value !== null) {
    return dragTranslateX.value
  }

  return settledTranslateX()
})

const visualLocale = computed((): HostivLocale => {
  if (isDragging.value && dragTranslateX.value !== null && travelDistance.value > 0) {
    return dragTranslateX.value >= travelDistance.value / 2 ? "en" : "fr"
  }

  return modelValue.value
})

function translateFromClientX(clientX: number) {
  const track = trackRef.value
  const thumb = thumbRef.value
  if (!track || !thumb) {
    return 0
  }

  const rect = track.getBoundingClientRect()
  const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0
  const thumbCenter = clientX - rect.left - padding - thumb.offsetWidth / 2
  return Math.max(0, Math.min(travelDistance.value, thumbCenter))
}

function onTrackPointerDown(event: PointerEvent) {
  if (event.button !== 0) {
    return
  }

  measureTravel()
  isDragging.value = true
  didDrag.value = false
  pointerStartX.value = event.clientX
  dragTranslateX.value = translateFromClientX(event.clientX)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onTrackPointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  if (Math.abs(event.clientX - pointerStartX.value) > DRAG_THRESHOLD) {
    didDrag.value = true
  }

  dragTranslateX.value = translateFromClientX(event.clientX)
}

function endDrag(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }

  isDragging.value = false

  if (!didDrag.value) {
    dragTranslateX.value = null
    toggleLocale()
    return
  }

  modelValue.value =
    (dragTranslateX.value ?? 0) >= travelDistance.value / 2 ? "en" : "fr"
  dragTranslateX.value = null
}
</script>

<template>
  <div class="hostiv-locale-pill-toggle">
    <button
      type="button"
      class="hostiv-locale-pill-toggle__label"
      :class="{ 'hostiv-locale-pill-toggle__label--active': modelValue === 'fr' }"
      :aria-pressed="modelValue === 'fr'"
      @click="toggleLocale"
    >
      {{ HOSTIV_LOCALE_LABELS.fr }}
    </button>

    <div
      ref="trackRef"
      class="hostiv-locale-pill-toggle__track"
      :class="{ 'hostiv-locale-pill-toggle__track--dragging': isDragging }"
      role="group"
      :aria-label="ariaLabel"
      @pointerdown="onTrackPointerDown"
      @pointermove="onTrackPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <span
        ref="thumbRef"
        class="hostiv-locale-pill-toggle__thumb"
        :style="{ transform: `translateX(${thumbTranslateX}px)` }"
        aria-hidden="true"
      >
        <span class="hostiv-locale-pill-toggle__flag">{{ HOSTIV_LOCALE_FLAGS[visualLocale] }}</span>
      </span>
    </div>

    <button
      type="button"
      class="hostiv-locale-pill-toggle__label"
      :class="{ 'hostiv-locale-pill-toggle__label--active': modelValue === 'en' }"
      :aria-pressed="modelValue === 'en'"
      @click="toggleLocale"
    >
      {{ HOSTIV_LOCALE_LABELS.en }}
    </button>
  </div>
</template>
