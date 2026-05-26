<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    message?: string
    slug?: string
  }>(),
  {
    title: "Page introuvable",
    message: "Cette adresse n’existe pas ou le lien est incorrect."
  }
)

const { openSignup } = useHostivAccountModal()
</script>

<template>
  <main class="hostiv-not-found">
    <div class="hostiv-container hostiv-not-found__inner">
      <p class="hostiv-eyebrow hostiv-eyebrow--pill">Erreur 404</p>
      <p class="hostiv-not-found__code" aria-hidden="true">404</p>
      <h1 class="hostiv-h2 hostiv-not-found__title">{{ title }}</h1>
      <p class="hostiv-not-found__message">{{ message }}</p>
      <p v-if="slug" class="hostiv-not-found__slug">
        Adresse demandée : <code>/{{ slug }}</code>
      </p>

      <div class="hostiv-not-found__actions">
        <NuxtLink to="/" class="hostiv-btn hostiv-btn--primary">Retour à l’accueil Hostiv</NuxtLink>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="openSignup">
          Créer mon site
        </button>
      </div>
    </div>
  </main>
</template>
