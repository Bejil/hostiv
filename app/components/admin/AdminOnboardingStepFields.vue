<script setup lang="ts">
import AdminCopyFields from "./AdminCopyFields.vue"
import AdminField from "./AdminField.vue"
import AdminOnboardingFieldExamples from "./AdminOnboardingFieldExamples.vue"
import AdminGeneralImagesEditor from "./AdminGeneralImagesEditor.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminLocationMapEditor from "./AdminLocationMapEditor.vue"
import AdminTemplateEditor from "./AdminTemplateEditor.vue"
import type { AdminOnboardingStepId } from "../../data/admin-onboarding-steps"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"

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

const brandMetaExamples = computed(() => [...onboardingFields.value.examples.brandMeta])
const heroPhotoExamples = computed(() => [...onboardingFields.value.examples.heroPhoto])
const heroEyebrowExamples = computed(() => [...onboardingFields.value.examples.heroEyebrow])
const heroTitleExamples = computed(() => [...onboardingFields.value.examples.heroTitle])
const heroTextExamples = computed(() => [...onboardingFields.value.examples.heroText])
const hostPhotoExamples = computed(() => [...onboardingFields.value.examples.hostPhoto])
const hostCaptionExamples = computed(() => [...onboardingFields.value.examples.hostCaption])
const hostTitleExamples = computed(() => [...onboardingFields.value.examples.hostTitle])
const hostQuoteExamples = computed(() => [...onboardingFields.value.examples.hostQuote])
const hostIntroExamples = computed(() => [...onboardingFields.value.examples.hostIntro])
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
            :model-value="record.brand_name"
            full-width
            @update:model-value="ctx.patchBrandName($event as string)"
          />
          <AdminField
            :label="onboardingFields.labels.brandMeta"
            required
            :model-value="record.brand_meta"
            full-width
            @update:model-value="ctx.patchBrandMeta($event as string)"
          />
          <AdminOnboardingFieldExamples :examples="brandMetaExamples" />
        </div>
      </div>
    </div>

    <!-- Template -->
    <div v-else-if="stepId === 'template'" class="admin-onboarding-fields__section">
      <p class="admin-onboarding-fields__legend">
        {{ onboardingFields.themeLegend }}
        <span class="admin-field__required" aria-hidden="true">*</span>
      </p>
      <AdminTemplateEditor
        :model-value="record.content.template.id"
        @update:model-value="ctx.patchContent('template', { id: $event })"
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
            :model-value="record.hero_image_path"
            default-path="gallery/hero-salon.jpeg"
            :upload="ctx.upload"
            :preview-url="ctx.previewUrl"
            @update:model-value="ctx.patch({ hero_image_path: $event })"
            @uploaded="onSiteImageUploaded"
          />
          <AdminOnboardingFieldExamples :examples="heroPhotoExamples" />
        </div>
        <div class="admin-onboarding-fields__stack">
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.heroEyebrow"
              required
              :model-value="ctx.getCopyField('hero', 'eyebrow')"
              full-width
              @update:model-value="ctx.patchCopySection('hero', 'eyebrow', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="heroEyebrowExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.heroTitle"
              required
              :model-value="ctx.getCopyField('hero', 'title')"
              full-width
              @update:model-value="ctx.patchHeroTitle($event as string)"
            />
            <AdminOnboardingFieldExamples :examples="heroTitleExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.heroText"
              type="textarea"
              required
              :rows="4"
              :model-value="ctx.getCopyField('hero', 'text')"
              full-width
              @update:model-value="ctx.patchCopySection('hero', 'text', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="heroTextExamples" />
          </div>
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
            :model-value="record.host_photo_path"
            default-path="about/host-photo.png"
            :upload="ctx.upload"
            :preview-url="ctx.previewUrl"
            @update:model-value="ctx.patch({ host_photo_path: $event })"
          />
          <AdminOnboardingFieldExamples :examples="hostPhotoExamples" />
        </div>
        <div class="admin-onboarding-fields__stack">
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.hostCaption"
              required
              :model-value="ctx.getCopyField('host', 'caption')"
              full-width
              @update:model-value="ctx.patchHostCaption($event as string)"
            />
            <AdminOnboardingFieldExamples :examples="hostCaptionExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.hostTitle"
              required
              :model-value="ctx.getCopyField('host', 'title')"
              full-width
              @update:model-value="ctx.patchCopySection('host', 'title', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="hostTitleExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              :label="onboardingFields.labels.hostQuote"
              type="textarea"
              required
              :rows="3"
              :model-value="ctx.getCopyField('host', 'quote')"
              full-width
              @update:model-value="ctx.patchCopySection('host', 'quote', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="hostQuoteExamples" />
          </div>
        </div>
      </div>
      <div class="admin-onboarding-fields__field-block admin-onboarding-fields__field-block--full">
        <AdminField
          :label="onboardingFields.labels.hostIntro"
          type="textarea"
          required
          :rows="4"
          full-width
          :model-value="ctx.getCopyField('host', 'intro_1')"
          @update:model-value="ctx.patchCopySection('host', 'intro_1', $event as string)"
        />
        <AdminOnboardingFieldExamples :examples="hostIntroExamples" />
      </div>
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
