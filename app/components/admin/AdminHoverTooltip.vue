<script setup lang="ts">
const props = defineProps<{
  label?: string
}>()

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isPositioned = ref(false)
const placement = ref<"top" | "bottom">("top")
const tooltipStyle = ref<{ top: string; left: string }>({ top: "0px", left: "0px" })

const tooltipId = useId()

const hasLabel = computed(() => Boolean(props.label?.trim()))

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
  if (!hasLabel.value) {
    return
  }

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
  <span
    ref="triggerRef"
    class="admin-hover-tooltip__trigger"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="close"
  >
    <slot />
  </span>

  <Teleport to="body">
    <div
      v-if="isOpen && hasLabel"
      :id="tooltipId"
      ref="tooltipRef"
      role="tooltip"
      class="admin-hover-tooltip"
      :class="{
        'admin-hover-tooltip--visible': isPositioned,
        'admin-hover-tooltip--bottom': placement === 'bottom'
      }"
      :style="tooltipStyle"
    >
      {{ label }}
    </div>
  </Teleport>
</template>
