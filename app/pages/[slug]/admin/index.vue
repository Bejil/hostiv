<script setup lang="ts">
import AdminAlert from "../../../components/admin/AdminAlert.vue"
import AdminIcon from "../../../components/admin/AdminIcon.vue"
import AdminLoginModal from "../../../components/admin/AdminLoginModal.vue"
import PropertyAdminEditor from "../../../components/admin/PropertyAdminEditor.vue"
import type { PropertyAdminRecord } from "../../../types/property-admin"
import type { PropertySiteRecord } from "../../../types/property-site"
import { faviconMimeType } from "../../../utils/favicon-mime"
import {
  applySignupPropertyNameToRecord,
  readSignupPropertyName
} from "../../../utils/signup-property-name"
import { useSupabaseClient } from "../../../composables/useSupabaseClient"

useAdminHead()

definePageMeta({
  ssr: false,
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length || slug.includes(".")) {
      return false
    }

    return slug.toLowerCase() !== "admin"
  }
})

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const editorRef = ref<InstanceType<typeof PropertyAdminEditor> | null>(null)

const {
  authenticated,
  loading,
  saving,
  error,
  site,
  userEmail,
  login,
  logout,
  fetchSite,
  bootstrap,
  saveSite,
  uploadAsset,
  initAuthListener,
  clonePropertyAdminRecord
} = usePropertyAdmin(slug)

const { propertyAsset } = usePropertyAsset(slug)

const draft = ref<PropertyAdminRecord | null>(null)
const email = ref("")
const password = ref("")
const saveMessage = ref<string | null>(null)
const configError = ref<string | null>(null)
const editorError = ref<string | null>(null)
const renderError = ref<string | null>(null)
const isDirty = ref(false)
const loginSubmitting = ref(false)

const showEditor = computed(() => authenticated.value && !loading.value && Boolean(draft.value))

const subscriptionNotice = computed(() => {
  const access = draft.value?.subscription_access

  if (!access || access.active) {
    return null
  }

  if (access.paid_until) {
    const date = new Date(access.paid_until).toLocaleDateString("fr-FR")

    return `Votre forfait a expiré le ${date}. Votre site a été remis en brouillon — renouvelez pour le republier.`
  }

  return "Votre site est en brouillon. Activez le forfait annuel Hostiv pour le publier (personnalisation libre avant paiement)."
})

const propertyExistsChecked = ref(false)
const propertyExists = ref(false)

const showLoginModal = computed(
  () =>
    propertyExistsChecked.value &&
    propertyExists.value &&
    !configError.value &&
    !authenticated.value
)

async function ensurePropertyExists() {
  try {
    await $fetch<{ ok: true }>(`/api/properties/${slug.value}/exists`)
    propertyExists.value = true
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }

    if (e.statusCode === 404) {
      showError({
        statusCode: 404,
        statusMessage: "Ce backoffice n’existe pas.",
        fatal: true
      })
      return
    }

    configError.value =
      e.statusMessage || e.data?.statusMessage || "Impossible de vérifier ce backoffice."
  } finally {
    propertyExistsChecked.value = true
  }
}

const loginChecking = computed(() => loading.value && !loginSubmitting.value)

const publicBranding = ref<{
  brand_name: string
  logo_path: string
  favicon_path: string
  logo_alt: string
} | null>(null)

const brandLabel = computed(
  () => draft.value?.brand_name || site.value?.brand_name || publicBranding.value?.brand_name || slug.value
)

const logoPath = computed(
  () => draft.value?.logo_path || site.value?.logo_path || publicBranding.value?.logo_path || ""
)

const faviconPath = computed(() => {
  const paths = [
    draft.value?.favicon_path,
    draft.value?.logo_path,
    site.value?.favicon_path,
    site.value?.logo_path,
    publicBranding.value?.favicon_path,
    publicBranding.value?.logo_path
  ]

  return paths.find((path) => Boolean(path?.trim())) || ""
})

const headerLogoUrl = computed(() => {
  const path = logoPath.value

  return path ? propertyAsset(path) : ""
})

const logoAlt = computed(
  () =>
    draft.value?.content.copy.header?.logo_alt ||
    site.value?.content.copy.header?.logo_alt ||
    publicBranding.value?.logo_alt ||
    brandLabel.value
)

async function loadPublicBranding() {
  try {
    const data = await $fetch<PropertySiteRecord>(`/api/sites/${slug.value}`)

    publicBranding.value = {
      brand_name: data.brand_name,
      logo_path: data.logo_path,
      favicon_path: data.favicon_path || data.logo_path,
      logo_alt: data.content.copy.header?.logo_alt || data.brand_name
    }
  } catch {
    publicBranding.value = null
  }
}

useHead({
  link: computed(() => {
    const path = faviconPath.value

    if (!path) {
      return []
    }

    const href = propertyAsset(path)

    if (!href) {
      return []
    }

    return [
      {
        rel: "icon",
        href,
        type: faviconMimeType(path)
      }
    ]
  })
})

async function syncDraftFromSite() {
  editorError.value = null

  if (!site.value) {
    draft.value = null
    isDirty.value = false
    return
  }

  try {
    draft.value = clonePropertyAdminRecord(site.value)

    try {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()
      const signupName = readSignupPropertyName(data.session?.user.user_metadata)

      if (applySignupPropertyNameToRecord(draft.value, signupName, slug.value)) {
        isDirty.value = true
      } else {
        isDirty.value = false
      }
    } catch {
      isDirty.value = false
    }
  } catch (err: unknown) {
    editorError.value =
      err instanceof Error ? err.message : "Impossible de préparer l’éditeur."
    draft.value = null
    isDirty.value = false
  }
}

watch(site, syncDraftFromSite, { immediate: true })

watch(
  () => [showEditor.value, route.query.onboarding] as const,
  ([show, onboarding]) => {
    if (!show || onboarding !== "1") {
      return
    }

    nextTick(() => {
      editorRef.value?.tryAutoLaunch?.()
    })
  },
  { flush: "post" }
)

onErrorCaptured((err) => {
  renderError.value = err instanceof Error ? err.message : "Erreur d’affichage de l’éditeur."
  return false
})

onMounted(() => {
  try {
    configError.value = null
    void loadPublicBranding()
    void ensurePropertyExists().then(() => {
      if (!propertyExists.value) {
        loading.value = false
        return
      }

      initAuthListener()
      void bootstrap()
    })
  } catch (err: unknown) {
    configError.value =
      err instanceof Error ? err.message : "Configuration Supabase invalide."
    loading.value = false
  }

  const onKeydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "s") {
      event.preventDefault()
      if (showEditor.value && isDirty.value && !saving.value) {
        void onSave()
      }
    }
  }

  window.addEventListener("keydown", onKeydown)

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeydown)
  })
})

async function onLogin() {
  loginSubmitting.value = true

  try {
    await login(email.value, password.value)
    password.value = ""
    syncDraftFromSite()
  } finally {
    loginSubmitting.value = false
  }
}

function onDraftUpdate(value: PropertyAdminRecord) {
  draft.value = value
  isDirty.value = true
}

async function persistDraft(): Promise<boolean> {
  if (!draft.value) {
    return false
  }

  if (!isDirty.value) {
    return true
  }

  saveMessage.value = null
  renderError.value = null

  const ok = await saveSite(draft.value)

  if (ok) {
    saveMessage.value = "Modifications enregistrées."
    syncDraftFromSite()
  }

  return ok
}

async function onSave() {
  await persistDraft()
}

function previewUrl(path: string) {
  return propertyAsset(path)
}

useSeoMeta({
  title: () => `Admin — ${brandLabel.value}`,
  robots: "noindex, nofollow"
})

useHead({
  bodyAttrs: {
    class: "admin-route"
  }
})
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div class="admin-page__brand">
        <div class="admin-page__logo">
          <img
            v-if="headerLogoUrl"
            :src="headerLogoUrl"
            :alt="logoAlt"
            class="admin-page__logo-img"
          />
        </div>
        <div>
          <h1 class="admin-page__title">{{ brandLabel }}</h1>
          <p class="admin-page__meta">
            <span class="admin-page__slug">/{{ slug }}</span>
            <span v-if="userEmail" class="admin-page__email">{{ userEmail }}</span>
          </p>
        </div>
      </div>

      <div v-if="userEmail || authenticated" class="admin-page__actions">
        <span v-if="showEditor && isDirty" class="admin-page__dirty">
          <span class="admin-page__dirty-dot" aria-hidden="true" />
          Non enregistré
        </span>
        <button
          v-if="showEditor"
          type="button"
          class="admin-btn admin-btn--secondary"
          title="Reprendre le parcours guidé"
          @click="editorRef?.reopenOnboarding?.()"
        >
          <AdminIcon name="layout" :size="16" />
          <span class="admin-btn__label">Guide</span>
        </button>
        <a
          v-if="showEditor"
          :href="`/${slug}/preview`"
          target="_blank"
          rel="noopener noreferrer"
          class="admin-btn admin-btn--secondary"
          title="Aperçu du site (brouillon visible si vous êtes connecté)"
        >
          <AdminIcon name="eye" :size="16" />
          <span class="admin-btn__label">Aperçu</span>
        </a>
        <button type="button" class="admin-btn admin-btn--secondary" :disabled="saving" @click="logout">
          <AdminIcon name="logout" :size="16" />
          <span class="admin-btn__label">Déconnexion</span>
        </button>
        <button
          v-if="showEditor"
          type="button"
          class="admin-btn admin-btn--primary"
          :disabled="saving || !isDirty"
          @click="onSave"
        >
          <AdminIcon name="save" :size="16" />
          {{ saving ? "Enregistrement…" : "Enregistrer" }}
        </button>
      </div>
    </header>

    <AdminLoginModal
      v-model:email="email"
      v-model:password="password"
      :open="showLoginModal"
      :checking="loginChecking"
      :submitting="loginSubmitting"
      :error="error"
      :brand-label="brandLabel"
      :slug="slug"
      :header-logo-url="headerLogoUrl"
      :logo-alt="logoAlt"
      @submit="onLogin"
    />

    <main
      class="admin-main"
      :class="{ 'admin-main--locked': showLoginModal || !propertyExistsChecked }"
    >
      <AdminAlert v-if="configError" variant="error" :message="configError" />

      <div v-if="!configError && !propertyExistsChecked" class="admin-loading">
        <div class="admin-loading__spinner" aria-hidden="true" />
        <p>Vérification du backoffice…</p>
      </div>

      <section v-else-if="!configError && propertyExists" class="admin-workspace">
        <div v-if="authenticated && loading" class="admin-loading">
          <div class="admin-loading__spinner" aria-hidden="true" />
          <p>Chargement de {{ brandLabel }}…</p>
        </div>

        <template v-else-if="authenticated">
          <div v-if="subscriptionNotice || error || editorError || renderError || saveMessage" class="admin-alerts">
            <AdminAlert v-if="subscriptionNotice" variant="info" :message="subscriptionNotice" />
            <AdminAlert v-if="error" variant="error" :message="error" />
            <AdminAlert v-if="editorError" variant="error" :message="editorError" />
            <AdminAlert v-if="renderError" variant="error" :message="renderError" />
            <AdminAlert v-if="saveMessage" variant="success" :message="saveMessage" />
          </div>

          <div v-if="!showEditor" class="admin-empty">
            <h2 class="admin-empty__title">Impossible d’afficher l’éditeur</h2>
            <p>
              {{
                authenticated
                  ? "Les données du site n’ont pas pu être chargées. Vérifiez votre connexion ou vos droits."
                  : "Session expirée ou accès refusé pour ce site."
              }}
            </p>
            <button type="button" class="admin-btn admin-btn--secondary" @click="fetchSite({ forceLoading: true })">
              Réessayer
            </button>
          </div>

          <PropertyAdminEditor
            v-if="draft"
            :key="draft.id"
            ref="editorRef"
            :model-value="draft"
            :slug="slug"
            :upload="uploadAsset"
            :preview-url="previewUrl"
            :save-draft="persistDraft"
            :save-error="error"
            @update:model-value="onDraftUpdate"
          />
        </template>
      </section>
    </main>

    <footer v-if="showEditor && isDirty" class="admin-savebar">
      <p>Modifications non enregistrées sur <strong>{{ brandLabel }}</strong></p>
      <button type="button" class="admin-btn admin-btn--primary" :disabled="saving" @click="onSave">
        <AdminIcon name="save" :size="16" />
        {{ saving ? "Enregistrement…" : "Enregistrer" }}
      </button>
    </footer>
  </div>
</template>

<style src="../../../../assets/css/pages/admin/admin.css"></style>
