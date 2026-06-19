<script setup lang="ts">
import { getSiteLayoutOptions, type SiteLayoutId } from "../../data/site-layouts"

const props = defineProps<{
  modelValue: SiteLayoutId | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: SiteLayoutId]
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended.layout)
const layoutOptions = computed(() => getSiteLayoutOptions(locale.value))

function selectLayout(id: SiteLayoutId) {
  emit("update:modelValue", id)
}
</script>

<template>
  <div class="admin-layout-editor" role="listbox" :aria-label="ext.listAria">
    <button
      v-for="option in layoutOptions"
      :key="option.id"
      type="button"
      class="admin-layout-card"
      :class="{ 'admin-layout-card--active': modelValue === option.id }"
      role="option"
      :aria-selected="modelValue === option.id"
      :title="option.description"
      @click="selectLayout(option.id)"
    >
      <AdminSiteLayoutWireframe :layout="option.id" />
      <span class="admin-layout-card__copy">
        <strong>{{ option.name }}</strong>
        <span class="admin-layout-card__eyebrow">{{ option.eyebrow }}</span>
      </span>
    </button>
  </div>
</template>
