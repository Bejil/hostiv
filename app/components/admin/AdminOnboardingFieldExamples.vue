<script setup lang="ts">
defineProps<{
  examples: string[]
}>()
</script>

<template>
  <p v-if="examples.length" class="admin-onboarding-fields__examples">
    <span class="admin-onboarding-fields__examples-label">Exemples :</span>
    <span
      v-for="example in examples"
      :key="example"
      class="admin-onboarding-fields__example"
    >
      {{ example }}
    </span>
  </p>
</template>
