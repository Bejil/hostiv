<script setup lang="ts">
import AdminField from "./AdminField.vue"
import { getAdminCopySections } from "../../data/admin-copy-sections"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { fromTimeInputValue, toTimeInputValue } from "../../utils/house-rules-time"

const props = defineProps<{
  sectionId: string
  fieldKeys?: string[]
  columns?: 1 | 2
  required?: boolean
  getCopyField: (sectionId: string, fieldKey: string) => string
  patchCopySection: (sectionId: string, fieldKey: string, value: string) => void
}>()

const ctx = useAdminEditorContext()

const section = computed(() =>
  getAdminCopySections(ctx.siteEditLocale.value).find((item) => item.id === props.sectionId)
)

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

function fieldModelValue(field: { key: string; type?: string }) {
  const raw = props.getCopyField(props.sectionId, field.key)

  if (field.type === "time") {
    return toTimeInputValue(raw)
  }

  return raw
}

function onFieldUpdate(field: { key: string; type?: string }, value: string) {
  const next = field.type === "time" ? fromTimeInputValue(value) : value

  props.patchCopySection(props.sectionId, field.key, next)
}
</script>

<template>
  <div
    v-if="section"
    class="admin-copy-block"
    :class="{
      'admin-copy-block--cols-2': columns === 2,
      'admin-copy-block--cols-1': columns === 1
    }"
  >
    <div class="admin-grid">
      <AdminField
        v-for="field in visibleFields"
        :key="field.key"
        :label="field.label"
        :required="required"
        :type="field.type || 'text'"
        :hint="field.hint"
        :rows="field.type === 'textarea' ? 3 : undefined"
        :step="field.type === 'time' ? 60 : undefined"
        :full-width="columns === 2 ? false : true"
        :examples="field.examples"
        :model-value="fieldModelValue(field)"
        @update:model-value="onFieldUpdate(field, $event as string)"
      />
    </div>
  </div>
</template>
