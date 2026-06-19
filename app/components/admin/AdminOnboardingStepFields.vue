<script setup lang="ts">
import AdminCopyFields from "./AdminCopyFields.vue"
import AdminField from "./AdminField.vue"
import AdminGeneralImagesEditor from "./AdminGeneralImagesEditor.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminLocationMapEditor from "./AdminLocationMapEditor.vue"
import AdminSiteAppearanceEditor from "./AdminSiteAppearanceEditor.vue"
import type { AdminOnboardingStepId } from "../../data/admin-onboarding-steps"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"
import { normalizeSiteTemplate } from "../../data/site-layouts"

defineProps<{
  stepId: AdminOnboardingStepId
}>()

const ctx = useAdminEditorContext()
const liveEditor = useAdminLiveEditorContext()
const record = ctx.record

function onSiteImageUploaded() {
  liveEditor?.bumpSitePreviewAssets()
}

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)
const onboardingFields = computed(() => ext.value.onboardingFields)
const fieldExamples = computed(() => onboardingFields.value.examples)

const brandNameExamples = computed(() => [...fieldExamples.value.brandName])
const logoExamples = computed(() => [...fieldExamples.value.logo])
const brandMetaExamples = computed(() => [...fieldExamples.value.brandMeta])
const heroPhotoExamples = computed(() => [...fieldExamples.value.heroPhoto])
const heroEyebrowExamples = computed(() => [...fieldExamples.value.heroEyebrow])
const heroTitleExamples = computed(() => [...fieldExamples.value.heroTitle])
const heroTextExamples = computed(() => [...fieldExamples.value.heroText])
const hostPhotoExamples = computed(() => [...fieldExamples.value.hostPhoto])
const hostCaptionExamples = computed(() => [...fieldExamples.value.hostCaption])
const hostTitleExamples = computed(() => [...fieldExamples.value.hostTitle])
const hostQuoteExamples = computed(() => [...fieldExamples.value.hostQuote])
const hostIntroExamples = computed(() => [...fieldExamples.value.hostIntro])
const nightPriceExamples = computed(() => [...fieldExamples.value.nightPrice])
const includedGuestsExamples = computed(() => [...fieldExamples.value.includedGuests])

function patchTemplate(patch: Parameters<typeof normalizeSiteTemplate>[0]) {
  ctx.patchContent(
    "template",
    normalizeSiteTemplate({
      ...record.value.content.template,
      ...patch
    })
  )
}
</script>

<template>
  <div class="admin-onboarding-fields">
    <!-- Identité -->
    <div v-if="stepId === 'header'" class="admin-onboarding-fields__section">
      <div class="admin-onboarding-fields__row">
        <AdminImageUpload
          cover
          required
          :label="onboardingFields.labels.logo"
          :examples="logoExamples"
          :model-value="record.logo_path"
          default-path="branding/header-logo.png"
          :upload="ctx.upload"
          :preview-url="ctx.previewUrl"
          @update:model-value="ctx.patch({ logo_path: $event })"
        />
        <div class="admin-onboarding-fields__stack">
          <AdminField
            :label="onboardingFields.labels.brandName"
            required
            :examples="brandNameExamples"
            :model-value="record.brand_name"
            full-width
            @update:model-value="ctx.patchBrandName($event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.brandMeta"
            required
            :examples="brandMetaExamples"
            :model-value="record.brand_meta"
            full-width
            @update:model-value="ctx.patchBrandMeta($event as string)"
          />
        </div>
      </div>
    </div>

    <!-- Template -->
    <div v-else-if="stepId === 'template'" class="admin-onboarding-fields__section">
      <AdminSiteAppearanceEditor
        :layout="record.content.template.layout"
        :theme="record.content.template.theme ?? record.content.template.id"
        @update:layout="patchTemplate({ layout: $event })"
        @update:theme="patchTemplate({ theme: $event, id: $event })"
      />
    </div>

    <!-- Hero -->
    <div v-else-if="stepId === 'seo'" class="admin-onboarding-fields__section">
      <div class="admin-onboarding-fields__row">
        <div class="admin-onboarding-fields__media">
          <AdminImageUpload
            cover
            required
            :label="onboardingFields.labels.heroPhoto"
            :examples="heroPhotoExamples"
            :model-value="record.hero_image_path"
            default-path="gallery/hero-salon.jpeg"
            :upload="ctx.upload"
            :preview-url="ctx.previewUrl"
            @update:model-value="ctx.patch({ hero_image_path: $event })"
            @uploaded="onSiteImageUploaded"
          />
        </div>
        <div class="admin-onboarding-fields__stack">
          <AdminField
            :label="onboardingFields.labels.heroEyebrow"
            required
            :examples="heroEyebrowExamples"
            :model-value="ctx.getCopyField('hero', 'eyebrow')"
            full-width
            @update:model-value="ctx.patchCopySection('hero', 'eyebrow', $event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.heroTitle"
            required
            :examples="heroTitleExamples"
            :model-value="ctx.getCopyField('hero', 'title')"
            full-width
            @update:model-value="ctx.patchHeroTitle($event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.heroText"
            type="textarea"
            required
            :rows="4"
            :examples="heroTextExamples"
            :model-value="ctx.getCopyField('hero', 'text')"
            full-width
            @update:model-value="ctx.patchCopySection('hero', 'text', $event as string)"
          />
        </div>
      </div>
    </div>

    <!-- Galerie -->
    <div v-else-if="stepId === 'images'" class="admin-onboarding-fields__section admin-onboarding-fields__section--wide">
      <AdminGeneralImagesEditor
        mark-required
        show-field-examples
        :model-value="record"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        :save-draft="ctx.saveDraft"
        @update:model-value="ctx.replaceRecord"
      />
    </div>

    <!-- Hôte -->
    <div v-else-if="stepId === 'host'" class="admin-onboarding-fields__section">
      <div class="admin-onboarding-fields__row">
        <div class="admin-onboarding-fields__media">
          <AdminImageUpload
            cover
            required
            :label="onboardingFields.labels.hostPhoto"
            :examples="hostPhotoExamples"
            :model-value="record.host_photo_path"
            default-path="about/host-photo.png"
            :upload="ctx.upload"
            :preview-url="ctx.previewUrl"
            @update:model-value="ctx.patch({ host_photo_path: $event })"
          />
        </div>
        <div class="admin-onboarding-fields__stack">
          <AdminField
            :label="onboardingFields.labels.hostCaption"
            required
            :examples="hostCaptionExamples"
            :model-value="ctx.getCopyField('host', 'caption')"
            full-width
            @update:model-value="ctx.patchHostCaption($event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.hostTitle"
            required
            :examples="hostTitleExamples"
            :model-value="ctx.getCopyField('host', 'title')"
            full-width
            @update:model-value="ctx.patchCopySection('host', 'title', $event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.hostQuote"
            type="textarea"
            required
            :rows="3"
            :examples="hostQuoteExamples"
            :model-value="ctx.getCopyField('host', 'quote')"
            full-width
            @update:model-value="ctx.patchCopySection('host', 'quote', $event as string)"
          />
        </div>
      </div>
      <AdminField
        class="admin-onboarding-fields__field-block--full"
        :label="onboardingFields.labels.hostIntro"
        type="textarea"
        required
        :rows="4"
        full-width
        :examples="hostIntroExamples"
        :model-value="ctx.getCopyField('host', 'intro_1')"
        @update:model-value="ctx.patchCopySection('host', 'intro_1', $event as string)"
      />
    </div>

    <!-- Localisation -->
    <div v-else-if="stepId === 'location'" class="admin-onboarding-fields__section admin-onboarding-fields__section--wide">
      <AdminLocationMapEditor
        mark-required
        :slug="record.slug"
        :model-value="record.location"
        :lead="ctx.getCopyField('location', 'lead')"
        @update:model-value="ctx.patch({ location: $event })"
        @update:lead="ctx.patchCopySection('location', 'lead', $event)"
      />
    </div>

    <!-- Tarifs -->
    <div v-else-if="stepId === 'booking'" class="admin-onboarding-fields__section">
      <div class="admin-onboarding-fields__stack admin-onboarding-fields__stack--2col">
        <AdminField
          :label="onboardingFields.labels.nightPrice"
          type="number"
          required
          :examples="nightPriceExamples"
          :model-value="record.booking_config.base_night_price_eur"
          full-width
          @update:model-value="
            ctx.patch({
              booking_config: {
                ...record.booking_config,
                base_night_price_eur: Number($event) || 0
              }
            })
          "
        />
        <AdminField
          :label="onboardingFields.labels.includedGuests"
          type="number"
          required
          :examples="includedGuestsExamples"
          :model-value="record.booking_config.included_main_guests"
          full-width
          :hint="onboardingFields.includedGuestsHint"
          @update:model-value="
            ctx.patch({
              booking_config: {
                ...record.booking_config,
                included_main_guests: Number($event) || 0
              }
            })
          "
        />
      </div>
    </div>
  </div>
</template>
