<script setup lang="ts">
import AdminBenefitCardsEditor from "./AdminBenefitCardsEditor.vue"
import AdminBenefitsPreview from "./AdminBenefitsPreview.vue"
import AdminVisualCardsEditor from "./AdminVisualCardsEditor.vue"
import AdminVisualPreview from "./AdminVisualPreview.vue"
import AdminBookingConfigEditor from "./AdminBookingConfigEditor.vue"
import AdminPricingPreview from "./AdminPricingPreview.vue"
import AdminAmenitiesEditor from "./AdminAmenitiesEditor.vue"
import AdminAmenitiesPreview from "./AdminAmenitiesPreview.vue"
import AdminReviewsEditor from "./AdminReviewsEditor.vue"
import AdminReviewsPreview from "./AdminReviewsPreview.vue"
import AdminHouseRulesEditor from "./AdminHouseRulesEditor.vue"
import AdminRulesPreview from "./AdminRulesPreview.vue"
import AdminLocationMapEditor from "./AdminLocationMapEditor.vue"
import AdminLocationPreview from "./AdminLocationPreview.vue"
import AdminNeighborhoodHighlightsEditor from "./AdminNeighborhoodHighlightsEditor.vue"
import AdminGeneralImagesEditor from "./AdminGeneralImagesEditor.vue"
import AdminReservationsEditor from "./AdminReservationsEditor.vue"
import AdminPayoutsEditor from "./AdminPayoutsEditor.vue"
import AdminAccountEditor from "./AdminAccountEditor.vue"
import AdminTemplateEditor from "./AdminTemplateEditor.vue"
import AdminCopyFields from "./AdminCopyFields.vue"
import AdminFeaturedPreview from "./AdminFeaturedPreview.vue"
import AdminFeaturedSpacesEditor from "./AdminFeaturedSpacesEditor.vue"
import AdminPlatformLinksEditor from "./AdminPlatformLinksEditor.vue"
import AdminField from "./AdminField.vue"
import AdminHeaderPreview from "./AdminHeaderPreview.vue"
import AdminHeroPreview from "./AdminHeroPreview.vue"
import AdminHostPreview from "./AdminHostPreview.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminToggle from "./AdminToggle.vue"
import AdminPublishPaywall from "./AdminPublishPaywall.vue"
import AdminOnboarding from "./AdminOnboarding.vue"
import { adminEditorContextKey } from "../../composables/admin-editor-context"
import type { AdminBookingReservation } from "../../types/booking-reservation"
import type { PropertyAdminRecord } from "../../types/property-admin"
import type { AmenityPreviewSection } from "../../types/amenity"
import { withAmenityPreviewHasMore } from "../../utils/amenity-preview"
import { syncAmenityCatalogFromPreview } from "../../utils/sync-amenity-catalog"
import {
  adminAllNavItems,
  adminNavItems,
  adminTopNavItems,
  isAdminSectionId,
  type AdminSectionId
} from "../../data/admin-nav-sections"

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

const route = useRoute()
const router = useRouter()

function sectionFromQuery(): AdminSectionId {
  const raw = route.query.section
  const id = (Array.isArray(raw) ? raw[0] : raw) ?? ""

  return isAdminSectionId(id) ? id : "general"
}

const activeSection = ref<AdminSectionId>(sectionFromQuery())

const activeSectionMeta = computed(
  () => adminAllNavItems.find((item) => item.id === activeSection.value) ?? adminTopNavItems[0]
)
const upcomingReservationCount = ref(0)

function selectSection(id: AdminSectionId) {
  activeSection.value = id

  if (route.query.section === id) {
    return
  }

  router.replace({
    path: route.path,
    query: { ...route.query, section: id }
  })
}

watch(
  () => route.query.section,
  () => {
    const next = sectionFromQuery()

    if (activeSection.value !== next) {
      activeSection.value = next
    }
  }
)

onMounted(() => {
  const next = sectionFromQuery()
  activeSection.value = next

  if (route.query.section !== next) {
    router.replace({
      path: route.path,
      query: { ...route.query, section: next }
    })
  }

  void loadUpcomingReservationCount()
})

watch(
  () => props.slug,
  () => {
    void loadUpcomingReservationCount()
  }
)

/** Incrémenté à chaque changement de logo pour rafraîchir l’aperçu (même chemin Storage). */
const logoPreviewRevision = ref(0)

watch(
  () => record.value.logo_path,
  () => {
    logoPreviewRevision.value += 1
  }
)

const heroPreviewRevision = ref(0)

watch(
  () => record.value.hero_image_path,
  () => {
    heroPreviewRevision.value += 1
  }
)

const hostPreviewRevision = ref(0)

watch(
  () => record.value.host_photo_path,
  () => {
    hostPreviewRevision.value += 1
  }
)

const featuredPreviewRevision = ref(0)

watch(
  () => record.value.content.featured_spaces.map((space) => space.image).join("|"),
  () => {
    featuredPreviewRevision.value += 1
  }
)

const visualPreviewRevision = ref(0)

watch(
  () => record.value.content.visual_cards.map((card) => card.image).join("|"),
  () => {
    visualPreviewRevision.value += 1
  }
)

function patch(partial: Partial<PropertyAdminRecord>) {
  record.value = { ...record.value, ...partial }
}

const publishPaywallOpen = ref(false)
const onboardingRef = ref<InstanceType<typeof AdminOnboarding> | null>(null)

const subscriptionAccess = computed(
  () =>
    record.value.subscription_access ?? {
      plan: record.value.subscription_plan ?? "pro",
      active: false,
      paid_until: null,
      requires_payment: true
    }
)

function onPublishedChange(value: boolean) {
  if (value && subscriptionAccess.value.requires_payment) {
    publishPaywallOpen.value = true
    return
  }

  patch({ published: value })
}

function onPaywallPlanUpdated(plan: PropertyAdminRecord["subscription_plan"]) {
  patch({
    subscription_plan: plan,
    subscription_access: {
      ...subscriptionAccess.value,
      plan
    }
  })
}

function asText(value: unknown) {
  return typeof value === "string" ? value : ""
}

function replaceRecord(value: PropertyAdminRecord) {
  record.value = value
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function loadUpcomingReservationCount() {
  try {
    const response = await $fetch<{ reservations: AdminBookingReservation[] }>(
      `/api/admin/${props.slug}/reservations`,
      {
        headers: await authHeaders()
      }
    )

    upcomingReservationCount.value = response.reservations.filter(
      (reservation) => reservation.display_status === "upcoming"
    ).length
  } catch {
    upcomingReservationCount.value = 0
  }
}

function patchBrandName(value: string) {
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

function patchAmenityPreviewSections(sections: AmenityPreviewSection[]) {
  const previewSections = withAmenityPreviewHasMore(sections)
  const amenity_catalog = syncAmenityCatalogFromPreview(
    previewSections,
    record.value.content.amenity_catalog
  )

  record.value = {
    ...record.value,
    content: {
      ...record.value.content,
      amenity_preview_sections: previewSections,
      amenity_catalog
    }
  }
}

function getCopyField(sectionId: string, fieldKey: string) {
  const section = (record.value.content.copy as Record<string, Record<string, string> | undefined>)[
    sectionId
  ]

  return section?.[fieldKey] ?? ""
}

function patchHeroTitle(value: string) {
  const copy = { ...record.value.content.copy }
  const hero = { ...(copy.hero ?? { eyebrow: "", title: "", text: "", image_alt: "" }) }

  record.value = {
    ...record.value,
    hero_image_alt: value,
    content: {
      ...record.value.content,
      copy: {
        ...copy,
        hero: {
          ...hero,
          title: value,
          image_alt: value
        }
      } as PropertyAdminRecord["content"]["copy"]
    }
  }
}

function patchHostCaption(value: string) {
  const copy = { ...record.value.content.copy }
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

  patchContent("copy", {
    ...copy,
    host
  } as PropertyAdminRecord["content"]["copy"])
}

function patchCopySection(sectionId: string, fieldKey: string, value: string) {
  if (sectionId === "host" && fieldKey === "caption") {
    patchHostCaption(value)
    return
  }

  const copy = { ...record.value.content.copy }
  const existing = (copy as Record<string, Record<string, string>>)[sectionId] ?? {}

  ;(copy as Record<string, Record<string, string>>)[sectionId] = {
    ...existing,
    [fieldKey]: value
  }

  patchContent("copy", copy as PropertyAdminRecord["content"]["copy"])
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
  getCopyField,
  patchCopySection,
  logoPreviewRevision,
  heroPreviewRevision,
  hostPreviewRevision,
  subscriptionAccess,
  onPublishedChange
})

onMounted(() => {
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

    <aside class="admin-sidebar">
      <nav class="admin-sidebar__nav admin-sidebar__nav--primary" aria-label="Paramètres du site">
        <button
          v-for="item in adminTopNavItems"
          :key="item.id"
          type="button"
          class="admin-sidebar__btn"
          :class="{ 'admin-sidebar__btn--active': activeSection === item.id }"
          @click="selectSection(item.id)"
        >
          <AdminIcon :name="item.icon" :size="18" />
          <span class="admin-sidebar__btn-label">{{ item.label }}</span>
          <span
            v-if="item.id === 'reservations'"
            class="admin-sidebar__pill"
            aria-label="Réservations à venir"
          >
            {{ upcomingReservationCount }}
          </span>
        </button>
      </nav>
      <p class="admin-sidebar__label">Personnalisation</p>
      <nav class="admin-sidebar__nav" aria-label="Personnalisation du site">
        <button
          v-for="item in adminNavItems"
          :key="item.id"
          type="button"
          class="admin-sidebar__btn"
          :class="{ 'admin-sidebar__btn--active': activeSection === item.id }"
          @click="selectSection(item.id)"
        >
          <AdminIcon :name="item.icon" :size="18" />
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="admin-editor__body">
      <header class="admin-panel-header">
        <h2 class="admin-panel-header__title">{{ activeSectionMeta.title }}</h2>
        <p class="admin-panel-header__lead">{{ activeSectionMeta.description }}</p>
      </header>

      <div class="admin-editor__scroll">
        <!-- Général -->
        <section v-if="activeSection === 'general'" class="admin-panel admin-panel--general">
          <div class="admin-general-layout">
            <div class="admin-general-main">
              <div class="admin-subpanel admin-general-card admin-general-card--publication">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">Statut</p>
                    <h3>Publication</h3>
                  </div>
                  <span
                    class="admin-general-status"
                    :class="record.published ? 'admin-general-status--on' : 'admin-general-status--off'"
                  >
                    {{ record.published ? "Publié" : "Brouillon" }}
                  </span>
                </div>
                <AdminToggle
                  :model-value="record.published"
                  label="Site publié"
                  :hint="
                    subscriptionAccess.requires_payment
                      ? 'Forfait Hostiv requis pour publier (12 mois). Vous pouvez personnaliser en brouillon.'
                      : 'Visible par les visiteurs sur l’URL publique.'
                  "
                  @update:model-value="onPublishedChange"
                />
              </div>

              <div class="admin-subpanel admin-general-card">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">Référencement</p>
                    <h3>SEO</h3>
                  </div>
                  <p class="admin-general-card__hint">Titre navigateur et description des résultats de recherche.</p>
                </div>
                <div class="admin-general-fields-grid">
                  <AdminField
                    label="Titre SEO"
                    :model-value="record.seo_title"
                    full-width
                    @update:model-value="patch({ seo_title: $event as string })"
                  />
                  <AdminField
                    label="Description SEO"
                    :model-value="record.seo_description"
                    type="textarea"
                    :rows="4"
                    full-width
                    @update:model-value="patch({ seo_description: $event as string })"
                  />
                </div>
              </div>

              <div class="admin-subpanel admin-general-card">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">Réservations</p>
                    <h3>Contact</h3>
                  </div>
                  <p class="admin-general-card__hint">Adresse qui reçoit les demandes et notifications de réservation.</p>
                </div>
                <AdminField
                  label="E-mail réservations"
                  :model-value="record.booking_notify_email"
                  type="email"
                  full-width
                  @update:model-value="patch({ booking_notify_email: $event as string })"
                />
              </div>

              <div class="admin-general-pricing">
                <AdminBookingConfigEditor
                  :model-value="record.booking_config"
                  @update:model-value="patch({ booking_config: $event })"
                />
              </div>
            </div>

            <aside class="admin-general-aside">
              <div class="admin-subpanel admin-general-card admin-general-card--asset">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">Identité</p>
                    <h3>Favicon</h3>
                  </div>
                </div>
                <AdminImageUpload
                  compact
                  label="Icône du navigateur"
                  :model-value="record.favicon_path"
                  default-path="branding/favicon.png"
                  :upload="upload"
                  :preview-url="previewUrl"
                  @update:model-value="patch({ favicon_path: $event })"
                />
                <p class="admin-general-card__note">
                  Utilisé dans l’onglet du navigateur et comme icône de partage si le logo n’est pas disponible.
                </p>
              </div>

              <div class="admin-general-preview" aria-label="Aperçu général">
                <p class="admin-general-preview__label">Aperçu</p>
                <div class="admin-general-preview__card">
                  <div class="admin-general-preview__favicon">
                    <img
                      v-if="record.favicon_path"
                      :src="previewUrl(asText(record.favicon_path))"
                      alt=""
                      class="admin-general-preview__favicon-img"
                    />
                    <AdminIcon v-else name="image" :size="18" />
                  </div>
                  <div class="admin-general-preview__content">
                    <p class="admin-general-preview__status">
                      {{ record.published ? "Site en ligne" : "Site en brouillon" }}
                    </p>
                    <h3>{{ asText(record.seo_title).trim() || "Titre SEO" }}</h3>
                    <p>{{ asText(record.seo_description).trim() || "Description SEO affichée dans les résultats de recherche." }}</p>
                  </div>
                  <div class="admin-general-preview__meta">
                    <span>{{ record.slug }}</span>
                    <span>{{ asText(record.booking_notify_email).trim() || "email de réservation" }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <!-- Template -->
        <section v-if="activeSection === 'template'" class="admin-panel admin-panel--template">
          <div class="admin-subpanel admin-general-card">
            <div class="admin-subpanel__head admin-general-card__head">
              <div>
                <p class="admin-general-card__kicker">Ambiance</p>
                <h3>Template du site</h3>
              </div>
              <p class="admin-general-card__hint">
                Change l’atmosphère visuelle du site public sans modifier les contenus.
              </p>
            </div>
            <AdminTemplateEditor
              :model-value="record.content.template.id"
              @update:model-value="patchContent('template', { id: $event })"
            />
          </div>
        </section>

        <!-- Images globales -->
        <section v-if="activeSection === 'images'" class="admin-panel admin-panel--general-images">
          <AdminGeneralImagesEditor
            :model-value="record"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="replaceRecord"
          />
        </section>

        <!-- Réservations -->
        <section v-if="activeSection === 'reservations'" class="admin-panel admin-panel--reservations">
          <AdminReservationsEditor
            :slug="slug"
            :model-value="record.calendar_config"
            @update:model-value="patch({ calendar_config: $event })"
            @reservations-changed="loadUpcomingReservationCount"
          />
        </section>

        <!-- Versements -->
        <section v-if="activeSection === 'payouts'" class="admin-panel admin-panel--payouts">
          <AdminPayoutsEditor :slug="slug" />
        </section>

        <!-- Compte Hostiv -->
        <section v-if="activeSection === 'account'" class="admin-panel admin-panel--account">
          <AdminAccountEditor :slug="slug" />
        </section>

        <!-- En-tête -->
        <section v-show="activeSection === 'header'" class="admin-panel admin-panel--header">
          <div class="admin-header-row">
            <AdminImageUpload
              cover
              label="Logo"
              :model-value="record.logo_path"
              default-path="branding/header-logo.png"
              :upload="upload"
              :preview-url="previewUrl"
              @update:model-value="patch({ logo_path: $event })"
            />
            <div class="admin-header-row__fields">
              <AdminField
                label="Titre"
                :model-value="record.brand_name"
                full-width
                @update:model-value="patchBrandName($event as string)"
              />
              <AdminField
                label="Sous-titre"
                :model-value="record.brand_meta"
                full-width
                @update:model-value="patchBrandMeta($event as string)"
              />
            </div>
          </div>
          <AdminHeaderPreview
            :logo-path="record.logo_path"
            :brand-name="record.brand_name"
            :brand-meta="record.brand_meta"
            :logo-revision="logoPreviewRevision"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Hero / moteur de recherche -->
        <section v-show="activeSection === 'seo'" class="admin-panel admin-panel--seo">
          <div class="admin-hero-row">
            <AdminImageUpload
              cover
              label="Image de fond"
              :model-value="record.hero_image_path"
              default-path="gallery/hero-salon.jpeg"
              :upload="upload"
              :preview-url="previewUrl"
              @update:model-value="patch({ hero_image_path: $event })"
            />
            <div class="admin-hero-row__fields">
              <AdminField
                label="Sur-titre"
                :model-value="getCopyField('hero', 'eyebrow')"
                full-width
                @update:model-value="patchCopySection('hero', 'eyebrow', $event as string)"
              />
              <AdminField
                label="Titre"
                :model-value="getCopyField('hero', 'title')"
                full-width
                @update:model-value="patchHeroTitle($event as string)"
              />
              <AdminField
                label="Texte"
                type="textarea"
                :rows="4"
                :model-value="getCopyField('hero', 'text')"
                full-width
                @update:model-value="patchCopySection('hero', 'text', $event as string)"
              />
            </div>
          </div>
          <AdminHeroPreview
            :hero-image-path="record.hero_image_path"
            :hero-revision="heroPreviewRevision"
            :eyebrow="getCopyField('hero', 'eyebrow')"
            :title="getCopyField('hero', 'title')"
            :text="getCopyField('hero', 'text')"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Plateformes -->
        <section v-show="activeSection === 'platforms'" class="admin-panel">
          <AdminCopyFields
            section-id="platform_stats"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <div class="admin-subpanel">
            <AdminPlatformLinksEditor
              :model-value="record.content.platform_links"
              :preview-url="previewUrl"
              :platform-stats-eyebrow="getCopyField('platform_stats', 'eyebrow')"
              :platform-stats-title="getCopyField('platform_stats', 'title')"
              :platform-stats-intro="getCopyField('platform_stats', 'intro')"
              @update:model-value="patchContent('platform_links', $event)"
            />
          </div>
        </section>

        <!-- Hôte -->
        <section v-show="activeSection === 'host'" class="admin-panel admin-panel--host">
          <div class="admin-host-row">
            <AdminImageUpload
              cover
              label="Photo hôte"
              :model-value="record.host_photo_path"
              default-path="about/host-photo.png"
              :upload="upload"
              :preview-url="previewUrl"
              @update:model-value="patch({ host_photo_path: $event })"
            />
            <div class="admin-host-row__fields">
              <AdminCopyFields
                section-id="host"
                :field-keys="['caption']"
                :get-copy-field="getCopyField"
                :patch-copy-section="patchCopySection"
              />
              <AdminCopyFields
                section-id="host"
                :field-keys="['eyebrow', 'title']"
                :columns="2"
                :get-copy-field="getCopyField"
                :patch-copy-section="patchCopySection"
              />
              <AdminCopyFields
                section-id="host"
                :field-keys="['quote']"
                :get-copy-field="getCopyField"
                :patch-copy-section="patchCopySection"
              />
            </div>
          </div>
          <AdminCopyFields
            section-id="host"
            :field-keys="['intro_1', 'intro_2']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminHostPreview
            :host-photo-path="record.host_photo_path"
            :host-revision="hostPreviewRevision"
            :caption="getCopyField('host', 'caption')"
            :eyebrow="getCopyField('host', 'eyebrow')"
            :title="getCopyField('host', 'title')"
            :quote="getCopyField('host', 'quote')"
            :intro1="getCopyField('host', 'intro_1')"
            :intro2="getCopyField('host', 'intro_2')"
            :cta="getCopyField('host', 'cta')"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Coups de cœur -->
        <section v-show="activeSection === 'featured'" class="admin-panel admin-panel--featured">
          <AdminCopyFields
            section-id="spaces"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="spaces"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminFeaturedSpacesEditor
            :model-value="record.content.featured_spaces"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="patchContent('featured_spaces', $event)"
          />
          <AdminFeaturedPreview
            :spaces="record.content.featured_spaces"
            :eyebrow="getCopyField('spaces', 'eyebrow')"
            :title="getCopyField('spaces', 'title')"
            :intro="getCopyField('spaces', 'intro')"
            :image-revision="featuredPreviewRevision"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Atouts -->
        <section v-show="activeSection === 'benefits'" class="admin-panel admin-panel--benefits">
          <AdminCopyFields
            section-id="benefits"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminBenefitCardsEditor
            :model-value="record.content.benefit_cards"
            @update:model-value="patchContent('benefit_cards', $event)"
          />
          <AdminBenefitsPreview
            :cards="record.content.benefit_cards"
            :eyebrow="getCopyField('benefits', 'eyebrow')"
            :title="getCopyField('benefits', 'title')"
          />
        </section>

        <!-- Localisation -->
        <section v-if="activeSection === 'location'" class="admin-panel admin-panel--location">
          <AdminCopyFields
            section-id="location"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="location"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminLocationMapEditor
            :slug="record.slug"
            :model-value="record.location"
            :lead="getCopyField('location', 'lead')"
            @update:model-value="patch({ location: $event })"
            @update:lead="patchCopySection('location', 'lead', $event)"
          />
          <AdminNeighborhoodHighlightsEditor
            :model-value="record.content.neighborhood_highlights"
            @update:model-value="patchContent('neighborhood_highlights', $event)"
          />
          <AdminLocationPreview
            :location="record.location"
            :highlights="record.content.neighborhood_highlights"
            :eyebrow="getCopyField('location', 'eyebrow')"
            :title="getCopyField('location', 'title')"
            :intro="getCopyField('location', 'intro')"
            :lead="getCopyField('location', 'lead')"
          />
        </section>

        <!-- Images -->
        <section v-if="activeSection === 'media'" class="admin-panel admin-panel--media">
          <AdminCopyFields
            section-id="visual"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="visual"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminVisualCardsEditor
            :model-value="record.content.visual_cards"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="patchContent('visual_cards', $event)"
          >
            <template #cta-fields>
              <AdminCopyFields
                section-id="visual"
                :field-keys="['gallery_cta_eyebrow', 'gallery_cta_title']"
                :columns="2"
                :get-copy-field="getCopyField"
                :patch-copy-section="patchCopySection"
              />
              <AdminCopyFields
                section-id="visual"
                :field-keys="['gallery_cta_text']"
                :get-copy-field="getCopyField"
                :patch-copy-section="patchCopySection"
              />
            </template>
          </AdminVisualCardsEditor>
          <AdminVisualPreview
            :cards="record.content.visual_cards"
            :eyebrow="getCopyField('visual', 'eyebrow')"
            :title="getCopyField('visual', 'title')"
            :intro="getCopyField('visual', 'intro')"
            :cta-eyebrow="getCopyField('visual', 'gallery_cta_eyebrow')"
            :cta-title="getCopyField('visual', 'gallery_cta_title')"
            :cta-text="getCopyField('visual', 'gallery_cta_text')"
            :cta-action="getCopyField('visual', 'gallery_cta_action')"
            :image-revision="visualPreviewRevision"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Tarifs & réservation -->
        <section v-if="activeSection === 'booking'" class="admin-panel admin-panel--booking">
          <AdminCopyFields
            section-id="pricing"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="pricing"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminBookingConfigEditor
            :model-value="record.booking_config"
            @update:model-value="patch({ booking_config: $event })"
          />
          <AdminPricingPreview
            :booking-config="record.booking_config"
            :eyebrow="getCopyField('pricing', 'eyebrow')"
            :title="getCopyField('pricing', 'title')"
            :intro="getCopyField('pricing', 'intro')"
          />
        </section>

        <!-- Équipements -->
        <section v-if="activeSection === 'amenities'" class="admin-panel admin-panel--amenities">
          <AdminCopyFields
            section-id="amenities"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="amenities"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminAmenitiesEditor
            :preview-sections="record.content.amenity_preview_sections"
            @update:preview-sections="patchAmenityPreviewSections"
          />
          <AdminAmenitiesPreview
            :sections="record.content.amenity_preview_sections"
            :eyebrow="getCopyField('amenities', 'eyebrow')"
            :title="getCopyField('amenities', 'title')"
            :intro="getCopyField('amenities', 'intro')"
          />
        </section>

        <!-- Verbatim -->
        <section v-if="activeSection === 'reviews'" class="admin-panel admin-panel--reviews">
          <AdminCopyFields
            section-id="reviews"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <div class="admin-reviews-bg-row">
            <AdminImageUpload
              cover
              label="Image de fond"
              :model-value="record.testimonials_bg_path"
              default-path="gallery/facade.jpeg"
              :upload="upload"
              :preview-url="previewUrl"
              @update:model-value="patch({ testimonials_bg_path: $event })"
            />
            <p class="admin-reviews-bg-row__hint">
              Photo visible derrière le bandeau sombre de la section témoignages sur le site.
            </p>
          </div>
          <AdminReviewsEditor
            :model-value="record.content.reviews"
            @update:model-value="patchContent('reviews', $event)"
          />
          <AdminReviewsPreview
            :reviews="record.content.reviews"
            :eyebrow="getCopyField('reviews', 'eyebrow')"
            :title="getCopyField('reviews', 'title')"
            :background-path="record.testimonials_bg_path"
            :preview-url="previewUrl"
          />
        </section>

        <!-- Règlement -->
        <section v-if="activeSection === 'rules'" class="admin-panel admin-panel--rules">
          <AdminCopyFields
            section-id="rules"
            :field-keys="['eyebrow', 'title']"
            :columns="2"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <AdminCopyFields
            section-id="rules"
            :field-keys="['intro']"
            :get-copy-field="getCopyField"
            :patch-copy-section="patchCopySection"
          />
          <div class="admin-subpanel admin-rules-schedule-editor">
            <h3>Arrivée & départ</h3>
            <AdminCopyFields
              section-id="rules"
              :field-keys="['check_in_time', 'check_out_time']"
              :columns="2"
              :get-copy-field="getCopyField"
              :patch-copy-section="patchCopySection"
            />
          </div>
          <AdminHouseRulesEditor
            :model-value="record.content.house_rules"
            @update:model-value="patchContent('house_rules', $event)"
          />
          <AdminRulesPreview
            :house-rules="record.content.house_rules"
            :eyebrow="getCopyField('rules', 'eyebrow')"
            :title="getCopyField('rules', 'title')"
            :intro="getCopyField('rules', 'intro')"
            :check-in-label="getCopyField('rules', 'check_in_label')"
            :check-in-time="getCopyField('rules', 'check_in_time')"
            :check-out-label="getCopyField('rules', 'check_out_label')"
            :check-out-time="getCopyField('rules', 'check_out_time')"
          />
        </section>

      </div>
    </div>

    <AdminPublishPaywall
      :open="publishPaywallOpen"
      :access="subscriptionAccess"
      :slug="slug"
      @close="publishPaywallOpen = false"
      @plan-updated="onPaywallPlanUpdated"
    />
  </div>
</template>
