<script setup lang="ts">
import AdminLoginModal from "../../components/admin/AdminLoginModal.vue"
import PropertySitePageView from "../../components/site/PropertySitePageView.vue"
import SitePreviewBanner from "../../components/SitePreviewBanner.vue"
import { validatePropertySlugFormat } from "../../utils/property-slug"

definePageMeta({
  ssr: false,
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length) {
      return false
    }

    if (slug.includes(".")) {
      return false
    }

    return validatePropertySlugFormat(slug).valid
  }
})

const {
  slug,
  site,
  pageState,
  loadError,
  authError,
  authLoading,
  userEmail,
  onLogin,
  retry
} = usePropertySitePreviewPage()

const email = ref("")
const password = ref("")
const loginSubmitting = ref(false)

const showLoginModal = computed(() => pageState.value === "login")

async function handleLogin() {
  loginSubmitting.value = true

  try {
    await onLogin(email.value, password.value)
  } finally {
    loginSubmitting.value = false
  }
}

useSeoMeta({
  title: () => (site.value ? `${site.value.seo_title} (aperçu)` : "Aperçu du site"),
  robots: "noindex, nofollow"
})
</script>

<template>
  <div class="site-preview-page">
    <div v-if="pageState === 'loading'" class="site-preview-page__loading">
      <div class="site-preview-page__spinner" aria-hidden="true" />
      <p>Chargement de l’aperçu…</p>
    </div>

    <div v-else-if="pageState === 'error'" class="site-preview-page__message">
      <h1>Aperçu indisponible</h1>
      <p>{{ loadError || "Impossible d’afficher ce site." }}</p>
      <button type="button" class="site-preview-page__btn" @click="retry">Réessayer</button>
      <NuxtLink :to="`/${slug}/admin`" class="site-preview-page__link">Retour au backoffice</NuxtLink>
    </div>

    <template v-else-if="pageState === 'ready' && site">
      <SitePreviewBanner :slug="slug" />
      <PropertySitePageView :site="site" :slug="slug" />
    </template>

    <AdminLoginModal
      v-model:email="email"
      v-model:password="password"
      :open="showLoginModal"
      :checking="authLoading && !loginSubmitting"
      :submitting="loginSubmitting"
      :error="authError || loadError"
      :brand-label="slug"
      :slug="slug"
      header-logo-url=""
      :logo-alt="slug"
      @submit="handleLogin"
    />
  </div>
</template>

<style scoped>
.site-preview-page {
  min-height: 100vh;
}

.site-preview-page__loading,
.site-preview-page__message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 60vh;
  padding: 2rem 1.25rem;
  text-align: center;
}

.site-preview-page__spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(13, 155, 110, 0.2);
  border-top-color: #0d9b6e;
  border-radius: 50%;
  animation: site-preview-spin 0.8s linear infinite;
}

@keyframes site-preview-spin {
  to {
    transform: rotate(360deg);
  }
}

.site-preview-page__message h1 {
  margin: 0;
  font-size: 1.35rem;
}

.site-preview-page__message p {
  margin: 0;
  color: #6a7c76;
  max-width: 42ch;
}

.site-preview-page__btn {
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 10px;
  background: #0d9b6e;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.site-preview-page__link {
  color: #067a57;
  font-weight: 600;
}
</style>
