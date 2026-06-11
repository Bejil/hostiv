<script setup lang="ts">
import WelcomeGuideRuleIcon from "../WelcomeGuideRuleIcon.vue"
import { normalizeWelcomeGuideRuleIcon } from "../../data/welcome-guide-rule-icons"
import type { WelcomeGuideRuleIcon as WelcomeGuideRuleIconId } from "../../types/welcome-guide"

const props = defineProps<{
  icon: WelcomeGuideRuleIconId | undefined
}>()

const normalized = computed(() => normalizeWelcomeGuideRuleIcon(props.icon))
</script>

<template>
  <WelcomeGuideRuleIcon :icon="normalized" />
</template>
