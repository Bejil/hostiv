<script setup lang="ts">
import { siteTemplateOptions, type SiteTemplateId } from "../../data/site-templates"

defineProps<{
  modelValue: SiteTemplateId | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: SiteTemplateId]
}>()
</script>

<template>
  <div class="admin-template-editor">
    <article
      v-for="option in siteTemplateOptions"
      :key="option.id"
      class="admin-template-card"
      :class="{
        'admin-template-card--active': modelValue === option.id,
        [`admin-template-card--${option.id}`]: true
      }"
    >
      <button type="button" class="admin-template-card__button" @click="emit('update:modelValue', option.id)">
        <span class="admin-template-card__preview" aria-hidden="true">
          <span class="admin-template-card__hero" />
          <span class="admin-template-card__row">
            <span />
            <span />
            <span />
          </span>
        </span>
        <span class="admin-template-card__copy">
          <span class="admin-template-card__eyebrow">{{ option.eyebrow }}</span>
          <strong>{{ option.name }}</strong>
          <span>{{ option.description }}</span>
        </span>
        <span class="admin-template-card__check">
          {{ modelValue === option.id ? "Actif" : "Choisir" }}
        </span>
      </button>
    </article>
  </div>
</template>
