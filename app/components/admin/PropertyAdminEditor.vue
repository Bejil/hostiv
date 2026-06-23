<script setup lang="ts">
import AdminCustomizationPanel from "./AdminCustomizationPanel.vue"
import AdminGeneralImagesEditor from "./AdminGeneralImagesEditor.vue"
import AdminGuestReviewsEditor from "./AdminGuestReviewsEditor.vue"
import AdminReservationsEditor from "./AdminReservationsEditor.vue"
import AdminPayoutsEditor from "./AdminPayoutsEditor.vue"
import AdminWelcomeGuideEditor from "./AdminWelcomeGuideEditor.vue"
import AdminAccountPanel from "./AdminAccountPanel.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminToggle from "./AdminToggle.vue"
import AdminGeneralSubscriptionCard from "./AdminGeneralSubscriptionCard.vue"
import AdminGeneralTrafficPanel from "./AdminGeneralTrafficPanel.vue"
import AdminPublishStripeRequiredModal from "./AdminPublishStripeRequiredModal.vue"
import AdminOnboarding from "./AdminOnboarding.vue"
import { useAdminProFeatureGate } from "../../composables/admin-pro-feature-context"
import { adminEditorContextKey } from "../../composables/admin-editor-context"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { PropertyAdminRecord } from "../../types/property-admin"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"
import { withPropertyAdminAccess } from "../../utils/merge-property-admin-subscription-access"
import { findAdminNavMeta } from "../../data/admin-nav-sections"
import { getHostivLanding } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"
import type { HostivLocale } from "../../types/hostiv-locale"
import type { PropertySiteCopy } from "../../types/property-site"
import {
  getSiteContentList,
  localizedSiteCopyKey,
  localizedSiteListKey,
  mergeSiteCopyOverride,
  mergeSiteCopyPrimaryFirst,
  seedLocalizedSiteLists,
  seedLocalizedAmenityContent,
  type LocalizedSiteListKey
} from "../../utils/site-content-locale"
import type { PropertyWelcomeGuide } from "../../types/welcome-guide"
import {
  getActiveWelcomeGuide,
  getStoredWelcomeGuide,
  localizedWelcomeGuideKey,
  seedWelcomeGuide
} from "../../utils/welcome-guide-locale"

const props = defineProps<{
  modelValue: PropertyAdminRecord
  slug: string
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  saveDraft?: () => Promise<boolean>
  saveError?: string | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyAdminRecord]
}>()

const record = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const sectionNav = inject(adminSectionNavKey)

if (!sectionNav) {
  throw new Error("PropertyAdminEditor requires adminSectionNavKey")
}

const {
  activeMenuSection,
  activeCustomizationBlock,
  selectSection,
  onCustomizationAccordionChange,
  loadUpcomingReservationCount,
  registerEditorScrollRoot,
  syncFromRouteOnMount
} = sectionNav

const editorScrollRef = ref<HTMLElement | null>(null)

watch(editorScrollRef, (element) => {
  registerEditorScrollRoot(element)
})

onUnmounted(() => {
  registerEditorScrollRoot(null)
})

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const liveEditor = useAdminLiveEditorContext()
const fallbackSiteEditLocale = ref<HostivLocale>("fr")
const siteEditLocale = liveEditor?.siteEditLocale ?? fallbackSiteEditLocale

const activeSeoKeywordLocale = ref<HostivLocale>(locale.value)

watch(locale, (value) => {
  activeSeoKeywordLocale.value = value
})

const starterPlusPrice = computed(
  () => getHostivLanding(locale.value).pricing.premiumAddon.price
)

const welcomeGuideLockedLead = computed(() =>
  adminUiFormat(ext.value.welcomeGuide.lockedLead, { price: starterPlusPrice.value })
)

const activeSectionMeta = computed(() =>
  findAdminNavMeta(
    activeMenuSection.value === "customization" && activeCustomizationBlock.value
      ? activeCustomizationBlock.value
      : activeMenuSection.value,
    locale.value
  )
)

function patch(partial: Partial<PropertyAdminRecord>) {
  record.value = { ...record.value, ...partial }
}

const subscriptionAccess = computed<HostivSubscriptionAccess>(
  () =>
    record.value.subscription_access ?? {
      plan: record.value.subscription_plan ?? "pro",
      active: true,
      paid_until: null,
      subscription_started_at: null,
      premium_tools_until: null,
      premium_tools_started_at: null,
      has_premium_tools: false,
      has_starter_plus: false,
      requires_payment: false
    }
)

const publishStripeModalOpen = ref(false)
const onboardingRef = ref<InstanceType<typeof AdminOnboarding> | null>(null)
const route = useRoute()
const router = useRouter()

const proFeatureGate = useAdminProFeatureGate()

const isPrimaryOwner = computed(() => record.value.admin_access?.is_primary_owner !== false)
const isCohost = computed(() => record.value.admin_access?.role === "cohost")

const stripeBlocksPublish = computed(
  () =>
    sectionNav.stripeConnectLoading.value || sectionNav.stripeConnectNeedsAttention.value
)

function onPublishedChange(value: boolean) {
  if (!isPrimaryOwner.value) {
    return
  }

  if (value && stripeBlocksPublish.value) {
    publishStripeModalOpen.value = true
    return
  }

  patch({ published: value })
}

function openStripeSetupFromPublishModal() {
  publishStripeModalOpen.value = false
  selectSection("payouts")

  router.replace({
    path: route.path,
    query: { ...route.query, section: "payouts", accounting: "payments" }
  })
}

function replaceRecord(value: PropertyAdminRecord) {
  const adminAccess = value.admin_access ?? record.value.admin_access

  record.value = adminAccess ? withPropertyAdminAccess(value, adminAccess) : value
}

function activeCopyRoot(): PropertySiteCopy {
  const content = record.value.content

  if (siteEditLocale.value === "en") {
    return mergeSiteCopyOverride(content.copy, content.copy_en)
  }

  return mergeSiteCopyPrimaryFirst(content.copy, content.copy_en)
}

function ensureLocalizedCopyExists(locale: HostivLocale) {
  if (locale !== "en" || record.value.content.copy_en) {
    return
  }

  patchContent("copy_en", JSON.parse(JSON.stringify(record.value.content.copy)))
}

function ensureLocalizedWelcomeGuideExists(locale: HostivLocale) {
  const seededGuide = seedWelcomeGuide(record.value.content, locale)

  if (seededGuide) {
    patch({ content: seededGuide })
  }
}

function seedLocalizedContentForLocale(locale: HostivLocale) {
  ensureLocalizedCopyExists(locale)
  ensureLocalizedWelcomeGuideExists(locale)

  const seededLists = seedLocalizedSiteLists(record.value.content, locale)

  if (seededLists) {
    patch({ content: seededLists })
  }

  const seededAmenities = seedLocalizedAmenityContent(record.value.content, locale)

  if (seededAmenities) {
    patch({ content: seededAmenities })
  }
}

watch(siteEditLocale, (locale) => {
  if (!liveEditor) {
    return
  }

  seedLocalizedContentForLocale(locale)
})

function patchActiveCopy(nextCopy: PropertySiteCopy) {
  const copyKey = localizedSiteCopyKey(siteEditLocale.value)
  patchContent(copyKey, nextCopy as PropertyAdminRecord["content"][typeof copyKey])
}

function getBrandName() {
  return activeCopyRoot().header?.brand_name ?? record.value.brand_name
}

function getBrandMeta() {
  return activeCopyRoot().header?.brand_meta ?? record.value.brand_meta
}

function patchBrandName(value: string) {
  if (siteEditLocale.value === "en") {
    const copy = { ...activeCopyRoot() }
    const header = { ...(copy.header ?? { brand_name: "", brand_meta: "", logo_alt: "" }) }

    patchActiveCopy({
      ...copy,
      header: {
        ...header,
        brand_name: value,
        logo_alt: value
      }
    })
    return
  }

  const copy = { ...record.value.content.copy }
  const header = { ...(copy.header ?? { brand_name: "", brand_meta: "", logo_alt: "" }) }

  record.value = {
    ...record.value,
    brand_name: value,
    content: {
      ...record.value.content,
      copy: {
        ...copy,
        header: {
          ...header,
          brand_name: value,
          logo_alt: value
        }
      } as PropertyAdminRecord["content"]["copy"]
    }
  }
}

function patchBrandMeta(value: string) {
  if (siteEditLocale.value === "en") {
    const copy = { ...activeCopyRoot() }
    const header = { ...(copy.header ?? { brand_name: "", brand_meta: "", logo_alt: "" }) }

    patchActiveCopy({
      ...copy,
      header: {
        ...header,
        brand_meta: value
      }
    })
    return
  }

  const copy = { ...record.value.content.copy }
  const header = { ...(copy.header ?? { brand_name: "", brand_meta: "", logo_alt: "" }) }

  record.value = {
    ...record.value,
    brand_meta: value,
    content: {
      ...record.value.content,
      copy: {
        ...copy,
        header: {
          ...header,
          brand_meta: value
        }
      } as PropertyAdminRecord["content"]["copy"]
    }
  }
}

function patchContent<K extends keyof PropertyAdminRecord["content"]>(
  key: K,
  value: PropertyAdminRecord["content"][K]
) {
  record.value = {
    ...record.value,
    content: { ...record.value.content, [key]: value }
  }
}

function getCopyField(sectionId: string, fieldKey: string) {
  const copy = activeCopyRoot()
  const section = (copy as Record<string, Record<string, string> | undefined>)[sectionId]

  return section?.[fieldKey] ?? ""
}

function patchHeroTitle(value: string) {
  const copy = { ...activeCopyRoot() }
  const hero = { ...(copy.hero ?? { eyebrow: "", title: "", text: "", image_alt: "" }) }
  const nextHero = {
    ...hero,
    title: value,
    image_alt: value
  }

  if (siteEditLocale.value === "en") {
    patchActiveCopy({
      ...copy,
      hero: nextHero
    })
    return
  }

  record.value = {
    ...record.value,
    hero_image_alt: value,
    content: {
      ...record.value.content,
      copy: {
        ...copy,
        hero: nextHero
      } as PropertyAdminRecord["content"]["copy"]
    }
  }
}

function patchHostCaption(value: string) {
  const copy = { ...activeCopyRoot() }
  const host = {
    ...(copy.host ?? {
      caption: "",
      eyebrow: "",
      title: "",
      quote: "",
      intro_1: "",
      intro_2: "",
      image_alt: "",
      cta: ""
    }),
    caption: value,
    image_alt: value
  }

  patchActiveCopy({
    ...copy,
    host
  })
}

function patchCopySection(sectionId: string, fieldKey: string, value: string) {
  if (sectionId === "host" && fieldKey === "caption") {
    patchHostCaption(value)
    return
  }

  const copy = { ...activeCopyRoot() }
  const existing = (copy as Record<string, Record<string, string>>)[sectionId] ?? {}

  ;(copy as Record<string, Record<string, string>>)[sectionId] = {
    ...existing,
    [fieldKey]: value
  }

  patchActiveCopy(copy)
}

function getContentList<K extends LocalizedSiteListKey>(key: K) {
  return getSiteContentList(record.value.content, key, siteEditLocale.value)
}

function patchContentList<K extends LocalizedSiteListKey>(
  key: K,
  value: PropertyAdminRecord["content"][K] | PropertyAdminRecord["content"][`${K}_en`]
) {
  const storageKey = localizedSiteListKey(key, siteEditLocale.value)
  patchContent(storageKey as keyof PropertyAdminRecord["content"], value)
}

function getWelcomeGuide(): PropertyWelcomeGuide {
  return getActiveWelcomeGuide(record.value.content, siteEditLocale.value, record.value)
}

function patchWelcomeGuide(partial: Partial<PropertyWelcomeGuide>) {
  if (siteEditLocale.value === "en") {
    ensureLocalizedWelcomeGuideExists("en")
  }

  const storageKey = localizedWelcomeGuideKey(siteEditLocale.value)
  const stored = getStoredWelcomeGuide(record.value.content, siteEditLocale.value)

  patchContent(storageKey, {
    ...stored,
    ...partial
  })
}

provide(adminEditorContextKey, {
  slug: computed(() => props.slug),
  record,
  upload: props.upload,
  previewUrl: props.previewUrl,
  patch,
  replaceRecord,
  patchContent,
  patchBrandName,
  patchBrandMeta,
  patchHeroTitle,
  patchHostCaption,
  siteEditLocale,
  getBrandName,
  getBrandMeta,
  getCopyField,
  patchCopySection,
  getContentList,
  patchContentList,
  getWelcomeGuide,
  patchWelcomeGuide,
  saveDraft: props.saveDraft,
  subscriptionAccess,
  onPublishedChange
})

onMounted(() => {
  syncFromRouteOnMount()

  nextTick(() => {
    onboardingRef.value?.tryAutoLaunch()
  })
})

defineExpose({
  reopenOnboarding: () => onboardingRef.value?.reopenTour(),
  tryAutoLaunch: () => onboardingRef.value?.tryAutoLaunch()
})
</script>

<template>
  <div class="admin-editor admin-editor--with-onboarding">
    <AdminOnboarding
      ref="onboardingRef"
      :slug="slug"
      :record="record"
      :select-section="selectSection"
      :save-draft="saveDraft"
      :save-error="saveError"
    />

    <div class="admin-editor__body">
      <div ref="editorScrollRef" class="admin-editor__scroll">
        <section v-if="activeMenuSection === 'general'" class="admin-panel admin-panel--general">
          <div class="admin-general-layout admin-general-layout--single">
            <div class="admin-general-main">
              <AdminGeneralSubscriptionCard
                v-if="isPrimaryOwner"
                :slug="slug"
                :access="subscriptionAccess"
              />

              <div class="admin-subpanel admin-general-card admin-general-card--publication">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">{{ ext.general.statusKicker }}</p>
                    <h3>{{ ext.general.publicationTitle }}</h3>
                  </div>
                  <span
                    class="admin-general-status"
                    :class="record.published ? 'admin-general-status--on' : 'admin-general-status--off'"
                  >
                    {{ record.published ? ext.general.publishedOn : ext.general.publishedOff }}
                  </span>
                </div>
                <AdminToggle
                  :model-value="record.published"
                  :label="ext.general.publishedToggleLabel"
                  :hint="ext.general.publishedToggleHint"
                  :disabled="!isPrimaryOwner"
                  @update:model-value="onPublishedChange"
                />
              </div>

              <div class="admin-subpanel admin-general-card admin-general-card--traffic">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">{{ ext.general.trafficKicker }}</p>
                    <h3>{{ ext.general.trafficTitle }}</h3>
                    <p class="admin-general-card__hint">{{ ext.general.trafficHint }}</p>
                  </div>
                </div>

                <AdminGeneralTrafficPanel :slug="slug" :published="record.published" />
              </div>

              <div class="admin-subpanel admin-general-card admin-general-card--seo">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">{{ ext.general.seoKicker }}</p>
                    <h3>{{ ext.general.seoTitle }}</h3>
                  </div>
                  <HostivLocalePillToggle
                    v-model="activeSeoKeywordLocale"
                    :aria-label="ext.seoKeywords.pillAria"
                  />
                </div>

                <AdminSeoKeywordsPanel
                  v-model:keyword-locale="activeSeoKeywordLocale"
                  :record="record"
                  @patch="patch"
                />
              </div>

            </div>
          </div>
        </section>

        <section v-else-if="activeMenuSection === 'account'" class="admin-panel admin-panel--account">
          <AdminAccountPanel
            :slug="slug"
            :show-cohosts="isPrimaryOwner"
            :show-plans="isPrimaryOwner"
          />
        </section>

        <AdminCustomizationPanel
          v-else-if="activeMenuSection === 'customization'"
          :open-block-id="activeCustomizationBlock"
          @update:open-block-id="onCustomizationAccordionChange"
        />

        <AdminWelcomeGuideEditor
          v-else-if="activeMenuSection === 'welcome-guide' && proFeatureGate.isProPlan.value"
        />

        <section
          v-else-if="activeMenuSection === 'welcome-guide'"
          class="admin-panel admin-panel--welcome-guide-locked"
        >
          <div class="admin-empty admin-empty--inline">
            <h2 class="admin-empty__title">{{ ext.welcomeGuide.lockedTitle }}</h2>
            <p>
              {{ welcomeGuideLockedLead }}
            </p>
            <button
              type="button"
              class="admin-btn admin-btn--primary"
              @click="proFeatureGate.openProUpgrade('welcome-guide')"
            >
              {{ ext.welcomeGuide.unlockCta }}
            </button>
          </div>
        </section>

        <section v-else-if="activeMenuSection === 'images'" class="admin-panel admin-panel--general-images">
          <AdminGeneralImagesEditor
            :model-value="record"
            :upload="upload"
            :preview-url="previewUrl"
            :save-draft="saveDraft"
            @update:model-value="replaceRecord"
          />
        </section>

        <section v-else-if="activeMenuSection === 'reservations'" class="admin-panel admin-panel--reservations">
          <AdminReservationsEditor
            :slug="slug"
            :model-value="record.calendar_config"
            :save-draft="saveDraft"
            :can-access-accounting="!isCohost"
            @update:model-value="patch({ calendar_config: $event })"
            @reservations-changed="loadUpcomingReservationCount"
          />
        </section>

        <section
          v-else-if="activeMenuSection === 'guest-reviews'"
          class="admin-panel admin-panel--guest-reviews"
        >
          <AdminGuestReviewsEditor :slug="slug" />
        </section>

        <section v-else-if="activeMenuSection === 'payouts' && !isCohost" class="admin-panel admin-panel--payouts">
          <AdminPayoutsEditor :slug="slug" />
        </section>

      </div>
    </div>

    <AdminPublishStripeRequiredModal
      :open="publishStripeModalOpen"
      @close="publishStripeModalOpen = false"
      @configure="openStripeSetupFromPublishModal"
    />
  </div>
</template>
