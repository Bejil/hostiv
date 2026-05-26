<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"

defineProps<{
  variant: "error" | "success" | "info"
  message: string
}>()
</script>

<template>
  <div class="admin-alert" :class="`admin-alert--${variant}`" role="status">
    <AdminIcon :name="variant === 'success' ? 'check' : 'alert'" :size="16" />
    <p>{{ message }}</p>
  </div>
</template>
