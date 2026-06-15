<script setup lang="ts">
import type { AdminNavSectionId } from "../../data/admin-nav-sections"
import AdminBenefitCardsEditor from "./AdminBenefitCardsEditor.vue"
import AdminVisualCardsEditor from "./AdminVisualCardsEditor.vue"
import AdminAmenitiesEditor from "./AdminAmenitiesEditor.vue"
import AdminReviewsEditor from "./AdminReviewsEditor.vue"
import AdminHouseRulesEditor from "./AdminHouseRulesEditor.vue"
import AdminLocationMapEditor from "./AdminLocationMapEditor.vue"
import AdminNeighborhoodHighlightsEditor from "./AdminNeighborhoodHighlightsEditor.vue"
import AdminCopyFields from "./AdminCopyFields.vue"
import AdminFeaturedSpacesEditor from "./AdminFeaturedSpacesEditor.vue"
import AdminPlatformLinksEditor from "./AdminPlatformLinksEditor.vue"
import AdminField from "./AdminField.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { adminCopyFieldExamples } from "../../data/admin-copy-sections"
import {
  getAdminCustomizationHeaderExamples,
  getAdminCustomizationImageExamples
} from "../../data/admin-customization-field-examples"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { AmenityPreviewSection } from "../../types/amenity"
import { withAmenityPreviewHasMore } from "../../utils/amenity-preview"
import { syncAmenityCatalogFromPreview } from "../../utils/sync-amenity-catalog"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"

const props = defineProps<{
  blockId: AdminNavSectionId
}>()

const ctx = useAdminEditorContext()
const liveEditor = useAdminLiveEditorContext()
const sectionNav = inject(adminSectionNavKey)

function onSiteImageUploaded() {
  liveEditor?.bumpSitePreviewAssets()
}

const siteImagePreviewRevision = computed(
  () => liveEditor?.sitePreviewAssetRevision.value ?? 0
)

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)
const headerExamples = computed(() => getAdminCustomizationHeaderExamples(locale.value))
const imageExamples = computed(() => getAdminCustomizationImageExamples(locale.value))
const copyFormLocale = computed(() => ctx.siteEditLocale.value)
const heroEyebrowExamples = computed(() =>
  adminCopyFieldExamples("hero", "eyebrow", copyFormLocale.value)
)
const heroTitleExamples = computed(() =>
  adminCopyFieldExamples("hero", "title", copyFormLocale.value)
)
const heroTextExamples = computed(() =>
  adminCopyFieldExamples("hero", "text", copyFormLocale.value)
)

function patchAmenityPreviewSections(sections: AmenityPreviewSection[]) {
  const previewSections = withAmenityPreviewHasMore(sections)
  const amenity_catalog = syncAmenityCatalogFromPreview(
    previewSections,
    ctx.record.value.content.amenity_catalog
  )

  ctx.patch({
    content: {
      ...ctx.record.value.content,
      amenity_preview_sections: previewSections,
      amenity_catalog
    }
  })
}
</script>

<template>
  <div v-if="blockId === 'header'" class="admin-panel admin-panel--header">
    <div class="admin-header-row">
      <AdminImageUpload
        cover
        :label="ext.customization.fields.logo"
        :examples="[...headerExamples.logo]"
        :model-value="ctx.record.value.logo_path"
        default-path="branding/header-logo.png"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        :preview-revision="siteImagePreviewRevision"
        @update:model-value="ctx.patch({ logo_path: $event })"
        @uploaded="onSiteImageUploaded"
      />
      <div class="admin-header-row__fields">
        <AdminField
          :label="ext.customization.fields.title"
          :examples="[...headerExamples.brandName]"
          :model-value="ctx.getBrandName()"
          full-width
          @update:model-value="ctx.patchBrandName($event as string)"
        />
        <AdminField
          :label="ext.customization.fields.subtitle"
          :examples="[...headerExamples.brandMeta]"
          :model-value="ctx.getBrandMeta()"
          full-width
          @update:model-value="ctx.patchBrandMeta($event as string)"
        />
      </div>
    </div>
  </div>

  <div v-else-if="blockId === 'seo'" class="admin-panel admin-panel--seo">
    <div class="admin-hero-row">
      <AdminImageUpload
        cover
        :label="ext.customization.fields.heroImage"
        :examples="[...imageExamples.hero]"
        :model-value="ctx.record.value.hero_image_path"
        default-path="gallery/hero-salon.jpeg"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        :preview-revision="siteImagePreviewRevision"
        @update:model-value="ctx.patch({ hero_image_path: $event })"
        @uploaded="onSiteImageUploaded"
      />
      <div class="admin-hero-row__fields">
        <AdminField
          :label="ext.customization.fields.eyebrow"
          :examples="heroEyebrowExamples"
          :model-value="ctx.getCopyField('hero', 'eyebrow')"
          full-width
          @update:model-value="ctx.patchCopySection('hero', 'eyebrow', $event as string)"
        />
        <AdminField
          :label="ext.customization.fields.title"
          :examples="heroTitleExamples"
          :model-value="ctx.getCopyField('hero', 'title')"
          full-width
          @update:model-value="ctx.patchHeroTitle($event as string)"
        />
        <AdminField
          :label="ext.customization.fields.text"
          type="textarea"
          :rows="4"
          :examples="heroTextExamples"
          :model-value="ctx.getCopyField('hero', 'text')"
          full-width
          @update:model-value="ctx.patchCopySection('hero', 'text', $event as string)"
        />
      </div>
    </div>
  </div>

  <div v-else-if="blockId === 'platforms'" class="admin-panel admin-panel--platforms">
    <AdminCopyFields
      section-id="platform_stats"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="platform_stats"
      :field-keys="['intro']"
      :columns="1"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminPlatformLinksEditor
      :model-value="ctx.record.value.content.platform_links"
      @update:model-value="ctx.patchContent('platform_links', $event)"
    />
  </div>

  <div v-else-if="blockId === 'host'" class="admin-panel admin-panel--host">
    <div class="admin-host-row">
      <AdminImageUpload
        cover
        :label="ext.customization.fields.hostPhoto"
        :examples="[...imageExamples.hostPhoto]"
        :model-value="ctx.record.value.host_photo_path"
        default-path="about/host-photo.png"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        :preview-revision="siteImagePreviewRevision"
        @update:model-value="ctx.patch({ host_photo_path: $event })"
        @uploaded="onSiteImageUploaded"
      />
      <div class="admin-host-row__fields">
        <AdminCopyFields
          section-id="host"
          :field-keys="['caption']"
          :get-copy-field="ctx.getCopyField"
          :patch-copy-section="ctx.patchCopySection"
        />
        <AdminCopyFields
          section-id="host"
          :field-keys="['eyebrow', 'title']"
          :columns="2"
          :get-copy-field="ctx.getCopyField"
          :patch-copy-section="ctx.patchCopySection"
        />
      </div>
    </div>
    <AdminCopyFields
      class="admin-host-stack"
      section-id="host"
      :field-keys="['quote', 'intro_1', 'intro_2']"
      :columns="1"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
  </div>

  <div v-else-if="blockId === 'featured'" class="admin-panel admin-panel--featured">
    <AdminCopyFields
      section-id="spaces"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="spaces"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminFeaturedSpacesEditor
      :model-value="ctx.getContentList('featured_spaces')"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      @update:model-value="ctx.patchContentList('featured_spaces', $event)"
    />
  </div>

  <div v-else-if="blockId === 'benefits'" class="admin-panel admin-panel--benefits">
    <AdminCopyFields
      section-id="benefits"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminBenefitCardsEditor
      :model-value="ctx.getContentList('benefit_cards')"
      @update:model-value="ctx.patchContentList('benefit_cards', $event)"
    />
  </div>

  <div v-else-if="blockId === 'location'" class="admin-panel admin-panel--location">
    <AdminCopyFields
      section-id="location"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="location"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminLocationMapEditor
      :slug="ctx.record.value.slug"
      :model-value="ctx.record.value.location"
      :lead="ctx.getCopyField('location', 'lead')"
      @update:model-value="ctx.patch({ location: $event })"
      @update:lead="ctx.patchCopySection('location', 'lead', $event)"
    />
    <AdminNeighborhoodHighlightsEditor
      :model-value="ctx.getContentList('neighborhood_highlights')"
      @update:model-value="ctx.patchContentList('neighborhood_highlights', $event)"
    />
  </div>

  <div v-else-if="blockId === 'media'" class="admin-panel admin-panel--media">
    <AdminCopyFields
      section-id="visual"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="visual"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminVisualCardsEditor
      :model-value="ctx.getContentList('visual_cards')"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      @update:model-value="ctx.patchContentList('visual_cards', $event)"
    />
  </div>

  <div v-else-if="blockId === 'booking'" class="admin-panel admin-panel--booking">
    <AdminCopyFields
      section-id="pricing"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="pricing"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <p class="admin-booking-pricing-notice">
      {{ ext.customization.bookingNotice }}
      <strong>{{ ext.customization.bookingNoticeAccounting }}</strong>.
      <button
        v-if="sectionNav"
        type="button"
        class="admin-booking-pricing-notice__link"
        @click="sectionNav.selectSection('payouts')"
      >
        {{ ext.customization.openAccounting }}
      </button>
    </p>
  </div>

  <div v-else-if="blockId === 'amenities'" class="admin-panel admin-panel--amenities">
    <AdminCopyFields
      section-id="amenities"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="amenities"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminAmenitiesEditor
      :preview-sections="ctx.record.value.content.amenity_preview_sections"
      @update:preview-sections="patchAmenityPreviewSections"
    />
  </div>

  <div v-else-if="blockId === 'reviews'" class="admin-panel admin-panel--reviews">
    <AdminImageUpload
      class="admin-reviews-bg"
      cover
      :label="ext.customization.fields.reviewsBg"
      :examples="[...imageExamples.reviewsBg]"
      :model-value="ctx.record.value.testimonials_bg_path"
      default-path="gallery/facade.jpeg"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      :preview-revision="siteImagePreviewRevision"
      @update:model-value="ctx.patch({ testimonials_bg_path: $event })"
      @uploaded="onSiteImageUploaded"
    />
    <AdminCopyFields
      section-id="reviews"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminReviewsEditor
      :slug="ctx.slug.value"
      :model-value="ctx.getContentList('reviews')"
      @update:model-value="ctx.patchContentList('reviews', $event)"
    />
  </div>

  <div v-else-if="blockId === 'rules'" class="admin-panel admin-panel--rules">
    <AdminCopyFields
      section-id="rules"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminCopyFields
      section-id="rules"
      :field-keys="['intro']"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <div class="admin-subpanel admin-rules-schedule-editor">
      <h3>{{ ext.customization.fields.checkInOut }}</h3>
      <AdminCopyFields
        section-id="rules"
        :field-keys="['check_in_time', 'check_out_time']"
        :columns="2"
        :get-copy-field="ctx.getCopyField"
        :patch-copy-section="ctx.patchCopySection"
      />
    </div>
    <AdminHouseRulesEditor
      :model-value="ctx.getContentList('house_rules')"
      @update:model-value="ctx.patchContentList('house_rules', $event)"
    />
  </div>
</template>
