<script setup lang="ts">
import type { NuxtError } from "#app"
import HostivAccountModal from "./components/hostiv/HostivAccountModal.vue"
import HostivNotFound from "./components/hostiv/HostivNotFound.vue"
import HostivNav from "./components/hostiv/HostivNav.vue"

const props = defineProps<{
  error: NuxtError
}>()

useHostivMarketingHead()

const is404 = computed(() => props.error.statusCode === 404)

const notFoundTitle = computed(() => {
  const message = props.error.statusMessage || ""

  if (message.toLowerCase().includes("backoffice")) {
    return "Backoffice introuvable"
  }

  if (message.toLowerCase().includes("site introuvable")) {
    return "Site introuvable"
  }

  return "Page introuvable"
})

const notFoundMessage = computed(
  () =>
    props.error.statusMessage ||
    "Cette adresse n’existe pas ou le lien est incorrect."
)

const requestedSlug = computed(() => {
  const path = useRoute().path
  const match = path.match(/^\/([^/]+)(?:\/admin)?\/?$/)

  return match?.[1] && match[1] !== "admin" ? match[1] : ""
})

useSeoMeta({
  title: () => (is404.value ? `${notFoundTitle.value} | Hostiv` : "Erreur | Hostiv"),
  robots: "noindex, nofollow"
})

function goHome() {
  clearError({ redirect: "/" })
}
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <HostivNotFound
      v-if="is404"
      :title="notFoundTitle"
      :message="notFoundMessage"
      :slug="requestedSlug"
    />
    <main v-else class="hostiv-not-found">
      <div class="hostiv-container hostiv-not-found__inner">
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">Erreur {{ error.statusCode || 500 }}</p>
        <h1 class="hostiv-h2 hostiv-not-found__title">Une erreur est survenue</h1>
        <p class="hostiv-not-found__message">
          {{ error.statusMessage || "Réessayez dans quelques instants ou revenez à l’accueil." }}
        </p>
        <div class="hostiv-not-found__actions">
          <button type="button" class="hostiv-btn hostiv-btn--primary" @click="goHome">
            Retour à l’accueil
          </button>
        </div>
      </div>
    </main>
    <HostivAccountModal />
  </div>
</template>

<style src="../assets/css/pages/hostiv/hostiv.css"></style>
