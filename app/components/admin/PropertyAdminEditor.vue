<script setup lang="ts">
import AdminCustomizationPanel from "./AdminCustomizationPanel.vue"
import AdminGeneralImagesEditor from "./AdminGeneralImagesEditor.vue"
import AdminReservationsEditor from "./AdminReservationsEditor.vue"
import AdminPayoutsEditor from "./AdminPayoutsEditor.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminToggle from "./AdminToggle.vue"
import AdminPublishPaywall from "./AdminPublishPaywall.vue"
import AdminOnboarding from "./AdminOnboarding.vue"
import { adminEditorContextKey } from "../../composables/admin-editor-context"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { PropertyAdminRecord } from "../../types/property-admin"
import { findAdminNavMeta } from "../../data/admin-nav-sections"

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

function seoLengthHint(length: number, ideal: number) {
  if (!length) {
    return `Recommandé : environ ${ideal} caractères`
  }

  if (length > ideal) {
    return `${length} car. — au-delà de ~${ideal} caractères`
  }

  return `${length} car. — idéal ~${ideal}`
}

const seoSearchPreviewTitle = computed(
  () => record.value.seo_title.trim() || record.value.brand_name
)
const seoSearchPreviewDescription = computed(
  () => record.value.seo_description.trim() || record.value.brand_meta
)
const seoSocialPreviewTitle = computed(
  () =>
    record.value.seo_og_title.trim() ||
    record.value.seo_title.trim() ||
    record.value.brand_name
)
const seoSocialPreviewDescription = computed(
  () => record.value.seo_og_description.trim() || record.value.seo_description.trim()
)
const seoSocialPreviewImage = computed(() => {
  const path = record.value.seo_og_image_path.trim() || record.value.hero_image_path

  return path ? props.previewUrl(path) : ""
})

const activeSectionMeta = computed(() =>
  findAdminNavMeta(
    activeMenuSection.value === "customization" && activeCustomizationBlock.value
      ? activeCustomizationBlock.value
      : activeMenuSection.value
  )
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

function replaceRecord(value: PropertyAdminRecord) {
  record.value = value
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

              <div class="admin-subpanel admin-general-card admin-general-card--seo">
                <div class="admin-subpanel__head admin-general-card__head">
                  <div>
                    <p class="admin-general-card__kicker">Référencement</p>
                    <h3>SEO</h3>
                  </div>
                  <p class="admin-general-card__hint">
                    Métadonnées pour Google, l’onglet du navigateur et le partage sur les réseaux sociaux.
                  </p>
                </div>

                <div class="admin-general-seo">
                  <div class="admin-general-seo__block">
                    <p class="admin-general-seo__heading">Recherche Google</p>
                    <div class="admin-general-fields-grid">
                      <AdminField
                        label="Titre SEO"
                        :model-value="record.seo_title"
                        :hint="seoLengthHint(record.seo_title.length, 60)"
                        placeholder="Ex. The Grand Appartement | Proche Versailles"
                        full-width
                        @update:model-value="patch({ seo_title: $event as string })"
                      />
                      <AdminField
                        label="Description SEO"
                        :model-value="record.seo_description"
                        type="textarea"
                        :rows="3"
                        :hint="seoLengthHint(record.seo_description.length, 160)"
                        placeholder="Résumé du logement pour les résultats de recherche."
                        full-width
                        @update:model-value="patch({ seo_description: $event as string })"
                      />
                      <AdminField
                        label="Mots-clés"
                        :model-value="record.seo_keywords"
                        :hint="'Séparez par des virgules (ex. location, Versailles, appartement familial).'"
                        placeholder="location courte durée, Versailles, appartement familial"
                        full-width
                        @update:model-value="patch({ seo_keywords: $event as string })"
                      />
                    </div>
                    <div class="admin-general-preview">
                      <p class="admin-general-preview__label">Aperçu Google</p>
                      <div class="admin-general-preview__card admin-general-preview__card--search">
                        <div class="admin-general-preview__content">
                          <p class="admin-general-preview__status">Résultat de recherche</p>
                          <h3>{{ seoSearchPreviewTitle }}</h3>
                          <p>{{ seoSearchPreviewDescription || "Ajoutez une description pour apparaître sous le titre." }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="admin-general-seo__block">
                    <p class="admin-general-seo__heading">Partage social (Open Graph)</p>
                    <p class="admin-general-seo__intro">
                      Utilisé par Facebook, LinkedIn, iMessage, etc. Laissez vide pour reprendre le titre et la description SEO.
                    </p>
                    <div class="admin-general-fields-grid">
                      <AdminField
                        label="Titre de partage"
                        :model-value="record.seo_og_title"
                        :hint="seoLengthHint(record.seo_og_title.length, 60)"
                        placeholder="Optionnel — sinon titre SEO"
                        full-width
                        @update:model-value="patch({ seo_og_title: $event as string })"
                      />
                      <AdminField
                        label="Description de partage"
                        :model-value="record.seo_og_description"
                        type="textarea"
                        :rows="3"
                        :hint="seoLengthHint(record.seo_og_description.length, 160)"
                        placeholder="Optionnel — sinon description SEO"
                        full-width
                        @update:model-value="patch({ seo_og_description: $event as string })"
                      />
                      <label class="admin-field admin-field--full">
                        <span class="admin-field__label">Carte Twitter / X</span>
                        <select
                          class="admin-field__control"
                          :value="record.seo_twitter_card"
                          @change="
                            patch({
                              seo_twitter_card: ($event.target as HTMLSelectElement).value as
                                | 'summary'
                                | 'summary_large_image'
                            })
                          "
                        >
                          <option value="summary_large_image">Grande image (recommandé)</option>
                          <option value="summary">Petite vignette</option>
                        </select>
                        <span class="admin-field__hint">
                          Format de l’aperçu lors du partage sur X (Twitter).
                        </span>
                      </label>
                    </div>
                    <AdminImageUpload
                      compact
                      label="Image de partage"
                      :model-value="record.seo_og_image_path"
                      default-path="seo/og-share.jpeg"
                      :upload="upload"
                      :preview-url="previewUrl"
                      @update:model-value="patch({ seo_og_image_path: $event })"
                    />
                    <p class="admin-general-seo__intro admin-general-seo__intro--tight">
                      Sans image dédiée, l’image hero du site est utilisée (1200×630 px recommandé).
                    </p>
                    <div class="admin-general-preview">
                      <p class="admin-general-preview__label">Aperçu partage</p>
                      <div class="admin-general-preview__card admin-general-preview__card--social">
                        <div
                          v-if="seoSocialPreviewImage"
                          class="admin-general-preview__og-image"
                        >
                          <img :src="seoSocialPreviewImage" alt="" />
                        </div>
                        <div class="admin-general-preview__content">
                          <p class="admin-general-preview__status">{{ record.brand_name }}</p>
                          <h3>{{ seoSocialPreviewTitle }}</h3>
                          <p>
                            {{
                              seoSocialPreviewDescription ||
                                "Ajoutez une description pour enrichir l’aperçu."
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="admin-general-seo__block admin-general-seo__block--robots">
                    <AdminToggle
                      :model-value="record.seo_noindex"
                      label="Demander aux moteurs de ne pas indexer"
                      hint="Ajoute noindex,nofollow. Un site en brouillon n’est jamais indexé, même si cette option est désactivée."
                      @update:model-value="patch({ seo_noindex: $event })"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <AdminCustomizationPanel
          v-else-if="activeMenuSection === 'customization'"
          :open-block-id="activeCustomizationBlock"
          @update:open-block-id="onCustomizationAccordionChange"
        />

        <section v-else-if="activeMenuSection === 'images'" class="admin-panel admin-panel--general-images">
          <AdminGeneralImagesEditor
            :model-value="record"
            :upload="upload"
            :preview-url="previewUrl"
            @update:model-value="replaceRecord"
          />
        </section>

        <section v-else-if="activeMenuSection === 'reservations'" class="admin-panel admin-panel--reservations">
          <AdminReservationsEditor
            :slug="slug"
            :model-value="record.calendar_config"
            @update:model-value="patch({ calendar_config: $event })"
            @reservations-changed="loadUpcomingReservationCount"
          />
        </section>

        <section v-else-if="activeMenuSection === 'payouts'" class="admin-panel admin-panel--payouts">
          <AdminPayoutsEditor :slug="slug" />
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
