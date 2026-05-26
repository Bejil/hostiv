<script setup lang="ts">
import BenefitIcon from "../BenefitIcon.vue"
import type { BenefitIconId } from "../../data/benefit-icons"

defineProps<{
  icon: BenefitIconId
}>()
</script>

<template>
  <BenefitIcon :icon="icon" />
</template>
