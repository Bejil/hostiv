<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"

const props = defineProps<{
  examples: string[]
  /** Sur fond sombre (ex. upload cover). */
  onDark?: boolean
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const triggerRef = ref<HTMLButtonElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isPositioned = ref(false)
const placement = ref<"top" | "bottom">("top")
const tooltipStyle = ref<{ top: string; left: string }>({ top: "0px", left: "0px" })

const tooltipId = useId()

const ariaLabel = computed(() =>
  props.examples.length === 1
    ? adminUiFormat(ext.value.fieldHelp.ariaOne, { example: props.examples[0]! })
    : adminUiFormat(ext.value.fieldHelp.ariaMany, {
        examples: props.examples.join(" · ")
      })
)

function updatePosition() {
  const trigger = triggerRef.value
  const tooltip = tooltipRef.value

  if (!trigger || !tooltip) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const gap = 8
  const viewportPadding = 12
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let nextPlacement: "top" | "bottom" = "top"
  let top = rect.top - tooltipRect.height - gap

  if (top < viewportPadding) {
    nextPlacement = "bottom"
    top = rect.bottom + gap
  }

  if (nextPlacement === "bottom" && top + tooltipRect.height > viewportHeight - viewportPadding) {
    nextPlacement = "top"
    top = Math.max(viewportPadding, rect.top - tooltipRect.height - gap)
  }

  let left = rect.left + rect.width / 2 - tooltipRect.width / 2
  const maxLeft = viewportWidth - tooltipRect.width - viewportPadding

  left = Math.max(viewportPadding, Math.min(left, maxLeft))

  placement.value = nextPlacement
  tooltipStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`
  }
  isPositioned.value = true
}

function schedulePositionUpdate() {
  isPositioned.value = false

  void nextTick(() => {
    requestAnimationFrame(() => {
      if (!isOpen.value) {
        return
      }

      updatePosition()
    })
  })
}

function open() {
  if (isOpen.value) {
    schedulePositionUpdate()
    return
  }

  isOpen.value = true
  schedulePositionUpdate()
}

function close() {
  isOpen.value = false
  isPositioned.value = false
}

function onViewportChange() {
  if (!isOpen.value) {
    return
  }

  schedulePositionUpdate()
}

onMounted(() => {
  window.addEventListener("scroll", onViewportChange, true)
  window.addEventListener("resize", onViewportChange, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("scroll", onViewportChange, true)
  window.removeEventListener("resize", onViewportChange)
})
</script>

<template>
  <span class="admin-field-help" :class="{ 'admin-field-help--on-dark': onDark }">
    <button
      ref="triggerRef"
      type="button"
      class="admin-field-help__trigger"
      :aria-label="ariaLabel"
      :aria-describedby="isOpen ? tooltipId : undefined"
      @mouseenter="open"
      @mouseleave="close"
      @focus="open"
      @blur="close"
    >
      ?
    </button>
  </span>

  <Teleport to="body">
    <div
      v-if="isOpen"
      :id="tooltipId"
      ref="tooltipRef"
      role="tooltip"
      class="admin-field-help__tooltip admin-field-help__tooltip--floating"
      :class="{
        'admin-field-help__tooltip--visible': isPositioned,
        'admin-field-help__tooltip--bottom': placement === 'bottom'
      }"
      :style="tooltipStyle"
    >
      <span class="admin-field-help__tooltip-label">{{ ext.fieldHelp.tooltipLabel }}</span>
      <span
        v-for="(example, index) in examples"
        :key="index"
        class="admin-field-help__tooltip-example"
      >
        {{ example }}
      </span>
    </div>
  </Teleport>
</template>
