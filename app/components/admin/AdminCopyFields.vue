<script setup lang="ts">
import AdminField from "./AdminField.vue"
import { adminCopySections } from "../../data/admin-copy-sections"

const props = defineProps<{
  sectionId: string
  fieldKeys?: string[]
  columns?: 1 | 2
  required?: boolean
  getCopyField: (sectionId: string, fieldKey: string) => string
  patchCopySection: (sectionId: string, fieldKey: string, value: string) => void
}>()

const section = computed(() => adminCopySections.find((item) => item.id === props.sectionId))

const visibleFields = computed(() => {
  if (!section.value) {
    return []
  }

  if (!props.fieldKeys?.length) {
    return section.value.fields
  }

  return props.fieldKeys
    .map((key) => section.value!.fields.find((field) => field.key === key))
    .filter((field): field is NonNullable<typeof field> => Boolean(field))
})
</script>

<template>
  <div
    v-if="section"
    class="admin-copy-block"
    :class="{ 'admin-copy-block--cols-2': columns === 2 }"
  >
    <div class="admin-grid">
      <AdminField
        v-for="field in visibleFields"
        :key="field.key"
        :label="field.label"
        :required="required"
        :type="field.type || 'text'"
        :full-width="columns === 2 ? false : field.fullWidth"
        :model-value="getCopyField(sectionId, field.key)"
        @update:model-value="patchCopySection(sectionId, field.key, $event as string)"
      />
    </div>
  </div>
</template>
