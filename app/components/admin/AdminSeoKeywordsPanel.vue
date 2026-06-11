<script setup lang="ts">
import type { HostivLocale } from "../../types/hostiv-locale"
import AdminSeoKeywordsField from "./AdminSeoKeywordsField.vue"
import type { PropertyAdminRecord } from "../../types/property-admin"
import { parseSeoKeywords } from "../../utils/seo-keywords"

defineProps<{
  record: PropertyAdminRecord
}>()

const keywordLocale = defineModel<HostivLocale>("keywordLocale", { required: true })

const emit = defineEmits<{
  patch: [value: Partial<PropertyAdminRecord>]
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const activeFieldLabel = computed(() =>
  keywordLocale.value === "en"
    ? ext.value.seoKeywords.enLabel
    : ext.value.seoKeywords.frLabel
)

function patchKeywords(locale: HostivLocale, value: string) {
  const keywords = parseSeoKeywords(value)
  const hasKeywords = keywords.length > 0

  if (locale === "en") {
    emit("patch", {
      seo_keywords_en: value,
      seo_keywords_en_enabled: hasKeywords
    })
    return
  }

  emit("patch", {
    seo_keywords: value,
    seo_keywords_fr_enabled: hasKeywords
  })
}
</script>

<template>
  <AdminSeoKeywordsField
    :key="keywordLocale"
    :keyword-locale="keywordLocale"
    :label="activeFieldLabel"
    :model-value="keywordLocale === 'en' ? record.seo_keywords_en : record.seo_keywords"
    @update:model-value="patchKeywords(keywordLocale, $event)"
  />
</template>
