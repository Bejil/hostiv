<script setup lang="ts">
import { getSiteTemplateOptions, type SiteTemplateId } from "../../data/site-templates"

defineProps<{
  modelValue: SiteTemplateId | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: SiteTemplateId]
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.template)
const templateOptions = computed(() => getSiteTemplateOptions(locale.value))

function selectTemplate(id: SiteTemplateId) {
  emit("update:modelValue", id)
}
</script>

<template>
  <div class="admin-theme-grid" role="listbox" :aria-label="ext.listAria">
    <button
      v-for="option in templateOptions"
      :key="option.id"
      type="button"
      class="admin-theme-card"
      :class="{
        'admin-theme-card--active': modelValue === option.id,
        [`admin-template-item--${option.id}`]: true
      }"
      role="option"
      :aria-selected="modelValue === option.id"
      :title="option.description"
      @click="selectTemplate(option.id)"
    >
      <span class="admin-theme-card__swatch admin-template-item__swatch" aria-hidden="true" />
      <span class="admin-theme-card__copy">
        <strong>{{ option.name }}</strong>
        <span>{{ option.eyebrow }}</span>
      </span>
    </button>
  </div>
</template>
