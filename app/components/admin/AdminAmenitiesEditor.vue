<script setup lang="ts">
import AdminAmenitiesPreviewEditor from "./AdminAmenitiesPreviewEditor.vue"
import type { AmenityPreviewSection } from "../../types/amenity"

defineProps<{
  previewSections: AmenityPreviewSection[]
}>()

const emit = defineEmits<{
  "update:previewSections": [value: AmenityPreviewSection[]]
}>()
</script>

<template>
  <AdminAmenitiesPreviewEditor
    :model-value="previewSections"
    @update:model-value="emit('update:previewSections', $event)"
  />
</template>
