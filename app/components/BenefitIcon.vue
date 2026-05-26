<script setup lang="ts">
import { computed } from "vue"
import { benefitIconShapes, normalizeBenefitIconId } from "../data/benefit-icons"

const props = defineProps<{
  icon: string
}>()

const shapes = computed(() => benefitIconShapes(props.icon))
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(shape, index) in shapes" :key="index">
      <path v-if="shape.tag === 'path'" :d="shape.d" />
      <rect
        v-else-if="shape.tag === 'rect'"
        :x="shape.x"
        :y="shape.y"
        :width="shape.width"
        :height="shape.height"
        :rx="shape.rx"
      />
      <circle
        v-else-if="shape.tag === 'circle'"
        :cx="shape.cx"
        :cy="shape.cy"
        :r="shape.r"
      />
      <line
        v-else-if="shape.tag === 'line'"
        :x1="shape.x1"
        :y1="shape.y1"
        :x2="shape.x2"
        :y2="shape.y2"
      />
      <polyline v-else-if="shape.tag === 'polyline'" :points="shape.points" />
    </template>
  </svg>
</template>
