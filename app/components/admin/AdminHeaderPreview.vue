<script setup lang="ts">
import { computed, toRef } from "vue"

const props = defineProps<{
  logoPath: string
  brandName: string
  brandMeta: string
  logoRevision: number
  previewUrl: (path: string) => string
}>()

const navLinks = ["À propos", "Espaces", "Quartier", "Tarifs", "Équipements", "Avis", "Règles"]

const logoPathRef = toRef(props, "logoPath")
const brandNameRef = toRef(props, "brandName")
const brandMetaRef = toRef(props, "brandMeta")
const logoRevisionRef = toRef(props, "logoRevision")

const logoSrc = computed(() => {
  const path = logoPathRef.value.trim()

  if (!path) {
    return ""
  }

  const base = props.previewUrl(path)
  const separator = base.includes("?") ? "&" : "?"

  return `${base}${separator}r=${logoRevisionRef.value}`
})

const displayName = computed(() => brandNameRef.value.trim() || "Titre")
const displayMeta = computed(() => brandMetaRef.value.trim() || "Sous-titre")
const displayAlt = computed(() => brandNameRef.value.trim() || "Logo")
</script>

<template>
  <div class="admin-header-preview" aria-label="Aperçu de l’en-tête du site">
    <p class="admin-header-preview__label">Aperçu</p>
    <header class="admin-header-preview__bar">
      <div class="admin-header-preview__topbar">
        <div class="admin-header-preview__brand">
          <img
            v-if="logoSrc"
            :key="logoSrc"
            :src="logoSrc"
            :alt="displayAlt"
            class="admin-header-preview__logo"
          />
          <div v-else class="admin-header-preview__logo admin-header-preview__logo--empty" aria-hidden="true" />
          <div class="admin-header-preview__text">
            <p class="admin-header-preview__name">{{ displayName }}</p>
            <p class="admin-header-preview__meta">{{ displayMeta }}</p>
          </div>
        </div>
        <nav class="admin-header-preview__nav" aria-hidden="true">
          <span v-for="link in navLinks" :key="link" class="admin-header-preview__nav-link">{{ link }}</span>
          <span class="admin-header-preview__cta">Réserver</span>
        </nav>
      </div>
    </header>
  </div>
</template>
