<script setup lang="ts">
import AdminAlert from "../../../components/admin/AdminAlert.vue"
import AdminAccountSettingsModal from "../../../components/admin/AdminAccountSettingsModal.vue"
import AdminIcon from "../../../components/admin/AdminIcon.vue"
import AdminLoginModal from "../../../components/admin/AdminLoginModal.vue"
import AdminLiveEditor from "../../../components/admin/AdminLiveEditor.vue"
import AdminMainTabs from "../../../components/admin/AdminMainTabs.vue"
import AdminProUpgradeModal from "../../../components/admin/AdminProUpgradeModal.vue"
import AdminStarterPlusSuccessModal from "../../../components/admin/AdminStarterPlusSuccessModal.vue"
import AdminPublishPaywall from "../../../components/admin/AdminPublishPaywall.vue"
import AdminSetupGuide from "../../../components/admin/AdminSetupGuide.vue"
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
import { withPropertyAdminSubscriptionAccess } from "../../../utils/merge-property-admin-subscription-access"
import type { PropertySiteRecord } from "../../../types/property-site"
import { faviconMimeType } from "../../../utils/favicon-mime"
import {
  applySignupPropertyNameToRecord,
  readSignupPropertyName
} from "../../../utils/signup-property-name"
import { useSupabaseClient } from "../../../composables/useSupabaseClient"
import { verifyHostivSubscriptionCheckout } from "../../../composables/useHostivSubscriptionCheckout"
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
const sectionNav = useAdminSectionNavigation(slug)

provide(adminSectionNavKey, sectionNav)

const editorRef = ref<InstanceType<typeof AdminLiveEditor> | null>(null)
const adminHeaderRef = ref<HTMLElement | null>(null)
const accountMenuOpen = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)

useAdminHeaderStickyTop(adminHeaderRef)
const accountModalOpen = ref(false)
let closeAccountMenuTimer: ReturnType<typeof setTimeout> | null = null

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

function onSubscriptionRenewed(plan: PropertyAdminRecord["subscription_plan"]) {
  if (!draft.value) {
    return
  }

  draft.value = {
    ...draft.value,
    subscription_plan: plan,
    subscription_access: draft.value.subscription_access
      ? { ...draft.value.subscription_access, plan }
      : undefined
  }

  void fetchSite({ forceLoading: true })
}

async function clearSubscriptionQuery() {
  const query = { ...route.query }

  delete query.subscription
  delete query.session_id

  await navigateTo({ path: route.path, query }, { replace: true })
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
  try {
    await $fetch<{ ok: true }>(`/api/properties/${slug.value}/exists`)
    propertyExists.value = true
  } catch (err: unknown) {
    const e = err as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }

    if (e.statusCode === 404) {
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
  }

  if (site.value) {
    site.value = withPropertyAdminSubscriptionAccess(site.value, access)
  }
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
      draft.value = withPropertyAdminSubscriptionAccess(
        clonePropertyAdminRecord(storedDraft),
        freshAccess
      )
      isDirty.value = true
      return
    }

    if (isDirty.value && draft.value) {
      if (freshAccess) {
        draft.value = withPropertyAdminSubscriptionAccess(draft.value, freshAccess)
      }

      return
    }
  } else {
    clearAdminDraft(slug.value)
  }

  try {
    draft.value = withPropertyAdminSubscriptionAccess(
      clonePropertyAdminRecord(site.value),
      freshAccess
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
  draft.value = value
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
  accountModalOpen.value = true
}

function closeAccountSettings() {
  accountModalOpen.value = false
}

function previewUrl(path: string) {
  return propertyAsset(path)
}

const savebarDocked = ref(false)
const savebarDockSentinelRef = ref<HTMLElement | null>(null)
let savebarDockObserver: IntersectionObserver | null = null

function teardownSavebarDockObserver() {
  savebarDockObserver?.disconnect()
  savebarDockObserver = null
  savebarDocked.value = false
}

function setupSavebarDockObserver() {
  teardownSavebarDockObserver()

  const node = savebarDockSentinelRef.value

  if (!node || !showEditor.value || !isDirty.value) {
    return
  }

  const savebarEl = node.previousElementSibling

  const marginBottom =
    savebarEl instanceof HTMLElement && savebarEl.offsetHeight > 0
      ? savebarEl.offsetHeight
      : 60

  savebarDockObserver = new IntersectionObserver(
    ([entry]) => {
      savebarDocked.value = entry.isIntersecting
    },
    { threshold: 0, rootMargin: `0px 0px -${marginBottom}px 0px` }
  )

  savebarDockObserver.observe(node)
}

watch(
  [savebarDockSentinelRef, showEditor, isDirty],
  () => {
    void nextTick(() => setupSavebarDockObserver())
  },
  { flush: "post" }
)

onUnmounted(() => {
  teardownSavebarDockObserver()
})

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
            </p>
          </div>
        </div>

        <div class="admin-page__actions">
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

          <AdminMainTabs v-if="showEditor && draft" :slug="slug" :record="draft" />

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
            @plan-updated="onSubscriptionRenewed"
          />

        </template>
      </template>
    </main>

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
      <footer
        v-if="showEditor && isDirty"
        class="admin-savebar"
        :class="{ 'admin-savebar--floating': !savebarDocked }"
        aria-live="polite"
      >
        <p>{{ ui.shell.savebarUnsaved }} <strong>{{ brandLabel }}</strong></p>
        <button type="button" class="admin-btn admin-btn--primary" :disabled="saving" @click="onSave">
          <AdminIcon name="save" :size="16" />
          {{ saving ? ui.common.saving : ui.common.save }}
        </button>
      </footer>

      <div
        v-if="showEditor && isDirty"
        ref="savebarDockSentinelRef"
        class="admin-savebar-dock-sentinel"
        aria-hidden="true"
      />

      <HostivFooter v-if="propertyExistsChecked && propertyExists" />
    </div>

    <AdminAccountSettingsModal
      :open="accountModalOpen"
      :slug="slug"
      @close="closeAccountSettings"
    />

    <AdminSetupGuide v-if="showEditor && draft" :slug="slug" :record="draft" />
  </div>
  </UApp>
</template>

<style src="../../../../assets/css/pages/admin/admin.css"></style>
