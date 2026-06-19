<script setup lang="ts">
import type { SiteLayoutId } from "../../data/site-layouts"
import type { SiteTemplateId } from "../../data/site-templates"
import AdminSiteLayoutEditor from "./AdminSiteLayoutEditor.vue"
import AdminTemplateEditor from "./AdminTemplateEditor.vue"

defineProps<{
  layout: SiteLayoutId | null
  theme: SiteTemplateId | null
}>()

const emit = defineEmits<{
  "update:layout": [value: SiteLayoutId]
  "update:theme": [value: SiteTemplateId]
}>()

const { ui } = useAdminUi()
const appearance = computed(() => ui.value.extended.appearance)
</script>

<template>
  <div class="admin-appearance-editor">
    <div class="admin-appearance-editor__section">
      <p class="admin-appearance-editor__legend">
        {{ appearance.layoutLegend }}
        <span class="admin-field__required" aria-hidden="true">*</span>
      </p>
      <AdminSiteLayoutEditor :model-value="layout" @update:model-value="emit('update:layout', $event)" />
    </div>

    <div class="admin-appearance-editor__section">
      <p class="admin-appearance-editor__legend">
        {{ appearance.themeLegend }}
        <span class="admin-field__required" aria-hidden="true">*</span>
      </p>
      <AdminTemplateEditor :model-value="theme" @update:model-value="emit('update:theme', $event)" />
    </div>
  </div>
</template>
