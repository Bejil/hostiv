<script setup lang="ts">
import AdminAlert from "../../../components/admin/AdminAlert.vue"
import AdminIcon from "../../../components/admin/AdminIcon.vue"
import AdminLoginModal from "../../../components/admin/AdminLoginModal.vue"
import AdminLiveEditor from "../../../components/admin/AdminLiveEditor.vue"
import AdminMainTabs from "../../../components/admin/AdminMainTabs.vue"
import AdminProUpgradeModal from "../../../components/admin/AdminProUpgradeModal.vue"
import AdminStarterPlusSuccessModal from "../../../components/admin/AdminStarterPlusSuccessModal.vue"
import AdminPublishPaywall from "../../../components/admin/AdminPublishPaywall.vue"
import AdminSetupGuide from "../../../components/admin/AdminSetupGuide.vue"
import AdminPropertySwitcher from "../../../components/admin/AdminPropertySwitcher.vue"
import AdminAddPropertyModal from "../../../components/admin/AdminAddPropertyModal.vue"
import HostivFooter from "../../../components/hostiv/HostivFooter.vue"
import { adminProFeatureKey } from "../../../composables/admin-pro-feature-context"
import { adminSectionNavKey } from "../../../composables/admin-section-nav-context"
import {
  canUseAdminPremiumTools,
  useAdminProFeatureGateState
} from "../../../composables/useAdminProFeatureGateState"
import { useAdminSectionNavigation } from "../../../composables/useAdminSectionNavigation"
import type { PropertyAdminRecord } from "../../../types/property-admin"
import type { HostivSubscriptionAccess } from "../../../utils/hostiv-subscription-access"
import { withPropertyAdminAccess, withPropertyAdminSubscriptionAccess } from "../../../utils/merge-property-admin-subscription-access"
import type { PropertySiteRecord } from "../../../types/property-site"
import { faviconMimeType } from "../../../utils/favicon-mime"
import {
  applySignupPropertyNameToRecord,
  readSignupPropertyName
} from "../../../utils/signup-property-name"
import { useSupabaseClient } from "../../../composables/useSupabaseClient"
import { verifyHostivSubscriptionCheckout, verifyHostivPropertyAddCheckout } from "../../../composables/useHostivSubscriptionCheckout"
import { useHostivProperties } from "../../../composables/useHostivProperties"
import { writeHostivActivePropertySlug } from "../../../utils/hostiv-active-property"
import {
  clearAdminDraft,
  loadAdminDraft,
  saveAdminDraft
} from "../../../utils/admin-draft-storage"
import { adminUiFormat } from "../../../data/admin-ui"

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
const router = useRouter()
const { ui, formatDate } = useAdminUi()
const slug = computed(() => String(route.params.slug))
const draft = ref<PropertyAdminRecord | null>(null)

const canAccessAccounting = computed(() => draft.value?.admin_access?.role !== "cohost")

const sectionNav = useAdminSectionNavigation(slug, {
  canAccessAccounting: () => canAccessAccounting.value
})

provide(adminSectionNavKey, sectionNav)

const editorRef = ref<InstanceType<typeof AdminLiveEditor> | null>(null)
const adminHeaderRef = ref<HTMLElement | null>(null)
const accountMenuOpen = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)

useAdminHeaderStickyTop(adminHeaderRef)
const addPropertyModalOpen = ref(false)
let closeAccountMenuTimer: ReturnType<typeof setTimeout> | null = null

const {
  properties: accessibleProperties,
  loading: propertiesLoading,
  fetchProperties: fetchAccessibleProperties
} = useHostivProperties()

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

const subscriptionAccess = computed(() => draft.value?.subscription_access ?? null)

const proFeatureGate = useAdminProFeatureGateState(subscriptionAccess)
const { modalOpen, activeFeature, closeProUpgrade, requireProFeature, isProPlan, openProUpgrade } =
  proFeatureGate

provide(adminProFeatureKey, {
  isProPlan,
  requireProFeature,
  openProUpgrade,
  closeProUpgrade
})

const email = ref("")
const password = ref("")
const saveMessage = ref<string | null>(null)
const configError = ref<string | null>(null)
const editorError = ref<string | null>(null)
const renderError = ref<string | null>(null)
const isDirty = ref(false)
const loginSubmitting = ref(false)

const subscriptionBlocksEditor = computed(
  () => subscriptionAccess.value?.requires_payment === true
)

const showEditor = computed(
  () =>
    authenticated.value &&
    !loading.value &&
    Boolean(draft.value) &&
    !subscriptionBlocksEditor.value
)

const showAddPropertyButton = computed(
  () => authenticated.value && accessibleProperties.value.some((property) => property.role === "owner")
)

const addPropertyProPlanOnly = computed(
  () => accessibleProperties.value.filter((property) => property.role === "owner").length >= 1
)

const subscriptionReturnMessage = ref<string | null>(null)
const subscriptionVerifying = ref(false)
const starterPlusSuccessOpen = ref(false)

const subscriptionNotice = computed(() => {
  if (subscriptionReturnMessage.value) {
    return subscriptionReturnMessage.value
  }

  const access = draft.value?.subscription_access

  if (!access || access.active) {
    return null
  }

  if (access.paid_until) {
    return adminUiFormat(ui.value.shell.subscriptionExpired, {
      date: formatDate(access.paid_until)
    })
  }

  return ui.value.shell.subscriptionRequired
})

async function clearSubscriptionQuery() {
  const query = { ...route.query }

  delete query.subscription
  delete query.session_id

  await navigateTo({ path: route.path, query }, { replace: true })
}

async function clearPropertyAddQuery() {
  const query = { ...route.query }

  delete query.property_add
  delete query.session_id

  await navigateTo({ path: route.path, query }, { replace: true })
}

async function handlePropertyAddReturn() {
  const status = route.query.property_add

  if (status === "cancelled") {
    subscriptionReturnMessage.value = ui.value.properties.cancelled
    await clearPropertyAddQuery()
    return
  }

  if (status !== "success") {
    return
  }

  const sessionId = String(route.query.session_id || "").trim()

  if (!sessionId) {
    subscriptionReturnMessage.value = ui.value.shell.paymentIncomplete
    await clearPropertyAddQuery()
    return
  }

  if (subscriptionVerifying.value) {
    return
  }

  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    return
  }

  subscriptionVerifying.value = true
  let redirectedToNewProperty = false

  try {
    const result = await verifyHostivPropertyAddCheckout(token, sessionId)

    if (result.fulfilled && result.slug) {
      subscriptionReturnMessage.value = ui.value.properties.created
      writeHostivActivePropertySlug(result.slug)
      await fetchAccessibleProperties()

      if (result.slug !== slug.value) {
        if (import.meta.client) {
          sessionStorage.setItem("hostiv-property-created-notice", "1")
        }

        redirectedToNewProperty = true
        await navigateTo(`/${result.slug}/admin`, { replace: true })
        return
      }

      await fetchSite()
      await syncDraftFromSite({ force: true })
    } else {
      subscriptionReturnMessage.value = ui.value.shell.paymentPending
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    subscriptionReturnMessage.value =
      e.data?.message || e.message || ui.value.properties.verifyFailed
  } finally {
    subscriptionVerifying.value = false

    if (!redirectedToNewProperty) {
      await clearPropertyAddQuery()
    }
  }
}

async function handleSubscriptionReturn() {
  const status = route.query.subscription

  if (status === "cancelled") {
    subscriptionReturnMessage.value = ui.value.shell.paymentCancelled
    await clearSubscriptionQuery()
    return
  }

  if (status !== "success") {
    return
  }

  const sessionId = String(route.query.session_id || "").trim()

  if (!sessionId) {
    subscriptionReturnMessage.value = ui.value.shell.paymentIncomplete
    await clearSubscriptionQuery()
    return
  }

  if (!authenticated.value || subscriptionVerifying.value) {
    return
  }

  subscriptionVerifying.value = true

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      return
    }

    const result = await verifyHostivSubscriptionCheckout(token, sessionId, slug.value)

    if (result.fulfilled) {
      const isStarterPlus = result.premium_tools_until != null

      if (isStarterPlus) {
        subscriptionReturnMessage.value = null
        closeProUpgrade()

        if (result.subscription_access) {
          applySubscriptionAccessToDraft(result.subscription_access)
        }

        await fetchSite()
        await syncDraftFromSite({ force: true })

        if (result.subscription_access) {
          applySubscriptionAccessToDraft(result.subscription_access)
        }

        starterPlusSuccessOpen.value = true
      } else {
        subscriptionReturnMessage.value = ui.value.shell.paymentRenewed
        await fetchSite()
        await syncDraftFromSite({ force: true })
      }
    } else {
      subscriptionReturnMessage.value = ui.value.shell.paymentPending
    }
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    subscriptionReturnMessage.value =
      e.data?.message || e.message || ui.value.shell.paymentVerifyFailed
  } finally {
    subscriptionVerifying.value = false
    await clearSubscriptionQuery()
  }
}

watch(
  () => [authenticated.value, route.query.subscription, route.query.session_id] as const,
  () => {
    void handleSubscriptionReturn()
  },
  { immediate: true }
)

watch(
  () => [route.query.property_add, route.query.session_id] as const,
  () => {
    void handlePropertyAddReturn()
  },
  { immediate: true }
)

watch(
  () => authenticated.value,
  (isAuthenticated) => {
    if (isAuthenticated) {
      void fetchAccessibleProperties()
    }
  },
  { immediate: true }
)

function onOpenWelcomeGuideAfterStarterPlus() {
  starterPlusSuccessOpen.value = false
  closeProUpgrade()

  if (!canUseAdminPremiumTools(draft.value?.subscription_access)) {
    openProUpgrade("welcome-guide")
    return
  }

  sectionNav.selectSection("welcome-guide")
}

watch(
  () => [showEditor.value, route.query.section, draft.value?.subscription_access?.has_premium_tools] as const,
  ([show, section]) => {
    if (!show || section !== "welcome-guide") {
      return
    }

    if (!canUseAdminPremiumTools(draft.value?.subscription_access)) {
      openProUpgrade("welcome-guide")

      const query = { ...route.query, section: "general" }

      delete query.block
      void router.replace({ path: route.path, query })
    }
  },
  { immediate: true }
)

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
  const onboarding = route.query.onboarding === "1"
  const propertyAddReturn =
    route.query.property_add === "success" && Boolean(String(route.query.session_id || "").trim())
  const maxAttempts = onboarding || propertyAddReturn ? 15 : 1
  const delayMs = 600

  if (propertyAddReturn) {
    initAuthListener()
    await handlePropertyAddReturn()
  }

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await $fetch<{ ok: true }>(`/api/properties/${slug.value}/exists`)
        propertyExists.value = true
        return
      } catch (err: unknown) {
        const e = err as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }

        if (e.statusCode === 404) {
          if ((onboarding || propertyAddReturn) && attempt < maxAttempts) {
            await new Promise((resolve) => window.setTimeout(resolve, delayMs))
            continue
          }

          showError({
            statusCode: 404,
            statusMessage: ui.value.shell.propertyNotFound,
            data: { notFoundKind: "backoffice" as const },
            fatal: true
          })
          return
        }

        configError.value =
          e.statusMessage || e.data?.statusMessage || ui.value.shell.verifyBackofficeFailed
        return
      }
    }
  } finally {
    propertyExistsChecked.value = true
  }
}

const loginChecking = computed(() => loading.value && !loginSubmitting.value)

const publicBranding = ref<{
  brand_name: string
  logo_path: string
  logo_alt: string
} | null>(null)

const brandLabel = computed(
  () => draft.value?.brand_name || site.value?.brand_name || publicBranding.value?.brand_name || slug.value
)

const logoPath = computed(
  () => draft.value?.logo_path || site.value?.logo_path || publicBranding.value?.logo_path || ""
)

const faviconPath = computed(() => logoPath.value.trim())

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
        key: "favicon-ico",
        rel: "icon",
        href,
        type: faviconMimeType(path)
      },
      {
        key: "favicon-svg",
        rel: "icon",
        href,
        type: faviconMimeType(path)
      }
    ]
  })
})

function applySubscriptionAccessToDraft(access: HostivSubscriptionAccess) {
  if (draft.value) {
    draft.value = withPropertyAdminSubscriptionAccess(draft.value, access)
    applyFreshAdminContextToDraft()
  }

  if (site.value) {
    site.value = withPropertyAdminSubscriptionAccess(site.value, access)
  }
}

function applyFreshAdminContextToDraft() {
  if (!draft.value || !site.value) {
    return
  }

  draft.value = withPropertyAdminAccess(
    withPropertyAdminSubscriptionAccess(draft.value, site.value.subscription_access),
    site.value.admin_access
  )
}

async function syncDraftFromSite(options: { force?: boolean } = {}) {
  editorError.value = null

  if (!site.value) {
    draft.value = null
    isDirty.value = false
    clearAdminDraft(slug.value)
    return
  }

  const freshAccess = site.value.subscription_access

  if (!options.force) {
    const storedDraft = loadAdminDraft(slug.value)

    if (storedDraft) {
      draft.value = withPropertyAdminAccess(
        withPropertyAdminSubscriptionAccess(
          clonePropertyAdminRecord(storedDraft),
          freshAccess
        ),
        site.value.admin_access
      )
      isDirty.value = true
      return
    }

    if (isDirty.value && draft.value) {
      applyFreshAdminContextToDraft()
      return
    }
  } else {
    clearAdminDraft(slug.value)
  }

  try {
    draft.value = withPropertyAdminAccess(
      withPropertyAdminSubscriptionAccess(
        clonePropertyAdminRecord(site.value),
        freshAccess
      ),
      site.value.admin_access
    )

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
      err instanceof Error ? err.message : ui.value.shell.prepareEditorFailed
    draft.value = null
    isDirty.value = false
  }
}

watch(site, syncDraftFromSite, { immediate: true })

watch(showEditor, (show) => {
  if (show) {
    renderError.value = null
  }
})

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

function formatRenderError(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }

  if (typeof err === "string" && err.trim()) {
    return err
  }

  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message

    if (typeof message === "string" && message.trim()) {
      return message
    }
  }

  return ui.value.shell.renderEditorFailed
}

onErrorCaptured((err) => {
  console.error("[admin] render error:", err)
  renderError.value = formatRenderError(err)
  return false
})

onMounted(() => {
  try {
    configError.value = null
    void loadPublicBranding()

    if (import.meta.client && sessionStorage.getItem("hostiv-property-created-notice") === "1") {
      sessionStorage.removeItem("hostiv-property-created-notice")
      subscriptionReturnMessage.value = ui.value.properties.created
    }

    const propertyAddReturn =
      route.query.property_add === "success" && Boolean(String(route.query.session_id || "").trim())

    if (propertyAddReturn) {
      initAuthListener()
      void handlePropertyAddReturn()
    }

    void ensurePropertyExists().then(() => {
      if (!propertyExists.value) {
        loading.value = false
        return
      }

      initAuthListener()
      void bootstrap().then(() => {
        void handlePropertyAddReturn()
      })
    })
  } catch (err: unknown) {
    configError.value =
      err instanceof Error ? err.message : ui.value.shell.supabaseConfigInvalid
    loading.value = false
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && accountMenuOpen.value) {
      accountMenuOpen.value = false
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key === "s") {
      event.preventDefault()
      if (showEditor.value && isDirty.value && !saving.value) {
        void onSave()
      }
    }
  }

  const onClickOutside = (event: MouseEvent) => {
    if (!accountMenuOpen.value) {
      return
    }

    const target = event.target

    if (!(target instanceof Node)) {
      return
    }

    if (!accountMenuRef.value?.contains(target)) {
      accountMenuOpen.value = false
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      flushDraftToSession()
    }
  }

  window.addEventListener("keydown", onKeydown)
  window.addEventListener("click", onClickOutside)
  document.addEventListener("visibilitychange", onVisibilityChange)

  onUnmounted(() => {
    flushDraftToSession()
    window.removeEventListener("keydown", onKeydown)
    window.removeEventListener("click", onClickOutside)
    document.removeEventListener("visibilitychange", onVisibilityChange)
    if (closeAccountMenuTimer) {
      clearTimeout(closeAccountMenuTimer)
      closeAccountMenuTimer = null
    }
    if (draftPersistTimer) {
      clearTimeout(draftPersistTimer)
      draftPersistTimer = null
    }
  })
})

watch(authenticated, (value) => {
  if (!value) {
    clearAdminDraft(slug.value)
  }
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

let draftPersistTimer: ReturnType<typeof setTimeout> | null = null

function flushDraftToSession() {
  if (draft.value && isDirty.value) {
    saveAdminDraft(slug.value, draft.value)
  }
}

function onDraftUpdate(value: PropertyAdminRecord) {
  const adminAccess =
    value.admin_access ?? draft.value?.admin_access ?? site.value?.admin_access

  draft.value = adminAccess ? withPropertyAdminAccess(value, adminAccess) : value
  isDirty.value = true
  renderError.value = null

  if (draftPersistTimer) {
    clearTimeout(draftPersistTimer)
  }

  draftPersistTimer = setTimeout(() => {
    draftPersistTimer = null

    if (draft.value && isDirty.value) {
      saveAdminDraft(slug.value, draft.value)
    }
  }, 350)
}

watch(
  () => sectionNav.activeMenuSection.value,
  () => {
    renderError.value = null
  }
)

watch(
  () => route.query.section,
  (section) => {
    const id = Array.isArray(section) ? section[0] : section

    if (id === "cohosts") {
      void router.replace({
        path: route.path,
        query: {
          ...route.query,
          section: "account",
          account_view: "cohosts"
        }
      })
    }
  },
  { immediate: true }
)

watch(
  () => [sectionNav.activeMenuSection.value, draft.value?.admin_access?.role] as const,
  ([section, role]) => {
    if (section === "payouts" && role === "cohost") {
      sectionNav.selectSection("general")
    }
  },
  { immediate: true }
)

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
    saveMessage.value = ui.value.shell.saved
    await syncDraftFromSite({ force: true })
  }

  return ok
}

async function onSave() {
  await persistDraft()
}

function openAccountMenu() {
  if (closeAccountMenuTimer) {
    clearTimeout(closeAccountMenuTimer)
    closeAccountMenuTimer = null
  }

  accountMenuOpen.value = true
}

function closeAccountMenuSoon() {
  if (closeAccountMenuTimer) {
    clearTimeout(closeAccountMenuTimer)
  }

  closeAccountMenuTimer = setTimeout(() => {
    accountMenuOpen.value = false
    closeAccountMenuTimer = null
  }, 140)
}

function openAccountSettings() {
  accountMenuOpen.value = false
  sectionNav.selectSection("account")
}

function openAddPropertyModal() {
  accountMenuOpen.value = false
  subscriptionReturnMessage.value = null
  addPropertyModalOpen.value = true
}

function closeAddPropertyModal() {
  addPropertyModalOpen.value = false
}

function previewUrl(path: string) {
  return propertyAsset(path)
}

watch(
  () => slug.value,
  (value) => {
    if (authenticated.value) {
      writeHostivActivePropertySlug(value)
    }
  }
)

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
  <UApp>
  <div class="admin-page">
    <header ref="adminHeaderRef" class="admin-page__header">
      <div class="admin-page__header-inner">
        <div class="admin-page__brand">
          <NuxtLink
            :to="`/${slug}`"
            class="admin-page__logo admin-page__logo-link"
            :aria-label="ui.header.logoHome"
            :title="ui.header.logoHome"
          >
            <img
              v-if="headerLogoUrl"
              :src="headerLogoUrl"
              :alt="logoAlt"
              class="admin-page__logo-img"
            />
          </NuxtLink>
          <div>
            <h1 class="admin-page__title">{{ brandLabel }}</h1>
            <p v-if="!authenticated" class="admin-page__meta">
              <span class="admin-page__slug">/{{ slug }}</span>
            </p>
          </div>
        </div>

        <div class="admin-page__actions">
          <div v-if="authenticated" class="admin-page__header-tools">
            <AdminPropertySwitcher
              :current-slug="slug"
              :properties="accessibleProperties"
              :loading="propertiesLoading"
              :can-add-property="showAddPropertyButton"
              @add-property="openAddPropertyModal"
            />
          </div>

          <template v-if="userEmail || authenticated">
            <span v-if="showEditor && isDirty" class="admin-page__dirty">
              <span class="admin-page__dirty-dot" aria-hidden="true" />
              {{ ui.header.unsaved }}
            </span>
            <div
              ref="accountMenuRef"
              class="admin-account-menu"
              @mouseenter="openAccountMenu"
              @mouseleave="closeAccountMenuSoon"
            >
              <button
                type="button"
                class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm"
                :aria-expanded="accountMenuOpen"
                aria-haspopup="menu"
                @focus="openAccountMenu"
                @click.stop="accountMenuOpen = !accountMenuOpen"
              >
                <AdminIcon name="user" :size="16" />
                <span class="hostiv-btn__label">{{ ui.header.account }}</span>
              </button>

              <div
                v-if="accountMenuOpen"
                class="admin-account-menu__dropdown"
                role="menu"
                @mouseenter="openAccountMenu"
                @mouseleave="closeAccountMenuSoon"
              >
                <button type="button" class="admin-account-menu__item" role="menuitem" @click="openAccountSettings">
                  <AdminIcon name="settings" :size="14" />
                  {{ ui.header.settings }}
                </button>
                <button
                  type="button"
                  class="admin-account-menu__item admin-account-menu__item--danger"
                  role="menuitem"
                  @click="logout"
                >
                  <AdminIcon name="logout" :size="14" />
                  {{ ui.header.logout }}
                </button>
              </div>
            </div>
          </template>

          <HostivLocaleSelect class="admin-page__locale" />
        </div>
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
        <p>{{ ui.shell.checkingBackoffice }}</p>
      </div>

      <template v-else-if="!configError && propertyExists">
        <div v-if="authenticated && loading" class="admin-loading">
          <div class="admin-loading__spinner" aria-hidden="true" />
          <p>{{ adminUiFormat(ui.shell.loadingProperty, { name: brandLabel }) }}</p>
        </div>

        <template v-else-if="authenticated">
          <div v-if="subscriptionNotice || error || editorError || renderError || saveMessage" class="admin-alerts">
            <AdminAlert v-if="subscriptionNotice" variant="info" :message="subscriptionNotice" />
            <AdminAlert v-if="error" variant="error" :message="error" />
            <AdminAlert v-if="editorError" variant="error" :message="editorError" />
            <AdminAlert v-if="renderError" variant="error" :message="renderError" />
            <AdminAlert v-if="saveMessage" variant="success" :message="saveMessage" />
          </div>

          <AdminMainTabs
            v-if="showEditor && draft"
            :slug="slug"
            :record="draft"
          />

          <section class="admin-workspace">
            <div v-if="!showEditor && !subscriptionBlocksEditor" class="admin-empty">
              <h2 class="admin-empty__title">{{ ui.shell.editorUnavailableTitle }}</h2>
              <p>
                {{
                  authenticated
                    ? ui.shell.editorUnavailableAuthenticated
                    : ui.shell.editorUnavailableSession
                }}
              </p>
              <button type="button" class="admin-btn admin-btn--secondary" @click="fetchSite({ forceLoading: true })">
                {{ ui.common.retry }}
              </button>
            </div>

            <AdminLiveEditor
              v-if="showEditor && draft"
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
          </section>

          <AdminPublishPaywall
            v-if="draft && subscriptionBlocksEditor && subscriptionAccess"
            :open="true"
            variant="access"
            :access="subscriptionAccess"
            :slug="slug"
          />

        </template>
      </template>
    </main>

    <div
      v-if="showEditor && isDirty"
      class="admin-savebar-anchor"
    >
      <footer class="admin-savebar" aria-live="polite">
        <p>{{ ui.shell.savebarUnsaved }} <strong>{{ brandLabel }}</strong></p>
        <button type="button" class="admin-btn admin-btn--primary" :disabled="saving" @click="onSave">
          <AdminIcon name="save" :size="16" />
          {{ saving ? ui.common.saving : ui.common.save }}
        </button>
      </footer>
    </div>

    <AdminProUpgradeModal
      v-if="authenticated && propertyExists"
      :open="modalOpen"
      :feature-id="activeFeature"
      :slug="slug"
      :subscription-access="subscriptionAccess"
      @close="closeProUpgrade"
    />

    <AdminStarterPlusSuccessModal
      v-if="authenticated && propertyExists"
      :open="starterPlusSuccessOpen"
      :access="subscriptionAccess"
      @close="starterPlusSuccessOpen = false"
      @open-welcome-guide="onOpenWelcomeGuideAfterStarterPlus"
    />

    <div class="admin-page__bottom">
      <HostivFooter v-if="propertyExistsChecked && propertyExists" />
    </div>

    <AdminAddPropertyModal
      :open="addPropertyModalOpen"
      :return-slug="slug"
      :pro-plan-only="addPropertyProPlanOnly"
      @close="closeAddPropertyModal"
    />

    <AdminSetupGuide v-if="showEditor && draft" :slug="slug" :record="draft" />
  </div>
  </UApp>
</template>

<style src="../../../../assets/css/pages/admin/admin.css"></style>
