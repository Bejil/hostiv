<script setup lang="ts">
import {
  BarChart3,
  Building2,
  CalendarSync,
  CreditCard,
  Globe,
  Images,
  Inbox,
  Link,
  MessageSquare,
  Search,
  Smartphone,
  Zap,
  type LucideIcon
} from "@lucide/vue"

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 22,
    strokeWidth: 1.75
  }
)

const registry: Record<string, LucideIcon> = {
  Globe,
  CalendarSync,
  CreditCard,
  Images,
  Smartphone,
  Inbox,
  Link,
  Search,
  MessageSquare,
  BarChart3,
  Building2,
  Zap
}

const icon = computed(() => registry[props.name] ?? Globe)
</script>

<template>
  <component :is="icon" class="hestia-icon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
