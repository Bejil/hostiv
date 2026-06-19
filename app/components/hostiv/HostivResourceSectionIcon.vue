<script setup lang="ts">
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  Heart,
  ImageIcon,
  LayoutTemplate,
  Link2,
  ListChecks,
  Mail,
  MapPin,
  MessageSquare,
  MousePointerClick,
  Paintbrush,
  Palette,
  Receipt,
  RefreshCw,
  Scale,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Shuffle,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  TrendingUp,
  Users,
  Wallet,
  Workflow
} from "@lucide/vue"
import type { HostivResourceSectionIconKey } from "../../data/hostiv-resource-section-icons"

const props = defineProps<{
  name: HostivResourceSectionIconKey
  size?: number
}>()

const icons = {
  "alert-triangle": AlertTriangle,
  "bar-chart-3": BarChart3,
  "book-open": BookOpen,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  "calendar-sync": CalendarSync,
  "check-circle-2": CheckCircle2,
  "clipboard-check": ClipboardCheck,
  clock: Clock,
  "credit-card": CreditCard,
  "file-text": FileText,
  heart: Heart,
  image: ImageIcon,
  "layout-template": LayoutTemplate,
  "link-2": Link2,
  "list-checks": ListChecks,
  mail: Mail,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  "mouse-pointer-click": MousePointerClick,
  paintbrush: Paintbrush,
  palette: Palette,
  receipt: Receipt,
  "refresh-cw": RefreshCw,
  scale: Scale,
  search: Search,
  send: Send,
  settings: Settings,
  "share-2": Share2,
  "shield-check": ShieldCheck,
  shuffle: Shuffle,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  "thumbs-up": ThumbsUp,
  "trending-up": TrendingUp,
  users: Users,
  wallet: Wallet,
  workflow: Workflow
} as const

const iconSize = computed(() => props.size ?? 20)
</script>

<template>
  <component :is="icons[name]" :size="iconSize" stroke-width="1.75" aria-hidden="true" />
</template>
