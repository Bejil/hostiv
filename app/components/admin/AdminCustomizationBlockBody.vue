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
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { AmenityPreviewSection } from "../../types/amenity"
import { withAmenityPreviewHasMore } from "../../utils/amenity-preview"
import { syncAmenityCatalogFromPreview } from "../../utils/sync-amenity-catalog"

const props = defineProps<{
  blockId: AdminNavSectionId
}>()

const ctx = useAdminEditorContext()
const sectionNav = inject(adminSectionNavKey)

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
        label="Logo"
        :model-value="ctx.record.value.logo_path"
        default-path="branding/header-logo.png"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        @update:model-value="ctx.patch({ logo_path: $event })"
      />
      <div class="admin-header-row__fields">
        <AdminField
          label="Titre"
          :model-value="ctx.record.value.brand_name"
          full-width
          @update:model-value="ctx.patchBrandName($event as string)"
        />
        <AdminField
          label="Sous-titre"
          :model-value="ctx.record.value.brand_meta"
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
        label="Image de fond"
        :model-value="ctx.record.value.hero_image_path"
        default-path="gallery/hero-salon.jpeg"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        @update:model-value="ctx.patch({ hero_image_path: $event })"
      />
      <div class="admin-hero-row__fields">
        <AdminField
          label="Sur-titre"
          :model-value="ctx.getCopyField('hero', 'eyebrow')"
          full-width
          @update:model-value="ctx.patchCopySection('hero', 'eyebrow', $event as string)"
        />
        <AdminField
          label="Titre"
          :model-value="ctx.getCopyField('hero', 'title')"
          full-width
          @update:model-value="ctx.patchHeroTitle($event as string)"
        />
        <AdminField
          label="Texte"
          type="textarea"
          :rows="4"
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
        label="Photo hôte"
        :model-value="ctx.record.value.host_photo_path"
        default-path="about/host-photo.png"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
        @update:model-value="ctx.patch({ host_photo_path: $event })"
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
      :model-value="ctx.record.value.content.featured_spaces"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      @update:model-value="ctx.patchContent('featured_spaces', $event)"
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
      :model-value="ctx.record.value.content.benefit_cards"
      @update:model-value="ctx.patchContent('benefit_cards', $event)"
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
      :model-value="ctx.record.value.content.neighborhood_highlights"
      @update:model-value="ctx.patchContent('neighborhood_highlights', $event)"
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
      :model-value="ctx.record.value.content.visual_cards"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      @update:model-value="ctx.patchContent('visual_cards', $event)"
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
      Le paramétrage des tarifs (prix par nuit, remises, voyageurs inclus) se fait dans l’onglet
      <strong>Versements</strong>.
      <button
        v-if="sectionNav"
        type="button"
        class="admin-booking-pricing-notice__link"
        @click="sectionNav.selectSection('payouts')"
      >
        Ouvrir Versements
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
      label="Image de fond"
      :model-value="ctx.record.value.testimonials_bg_path"
      default-path="gallery/facade.jpeg"
      :upload="ctx.upload"
      :preview-url="ctx.previewUrl"
      @update:model-value="ctx.patch({ testimonials_bg_path: $event })"
    />
    <AdminCopyFields
      section-id="reviews"
      :field-keys="['eyebrow', 'title']"
      :columns="2"
      :get-copy-field="ctx.getCopyField"
      :patch-copy-section="ctx.patchCopySection"
    />
    <AdminReviewsEditor
      :model-value="ctx.record.value.content.reviews"
      @update:model-value="ctx.patchContent('reviews', $event)"
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
      <h3>Arrivée & départ</h3>
      <AdminCopyFields
        section-id="rules"
        :field-keys="['check_in_time', 'check_out_time']"
        :columns="2"
        :get-copy-field="ctx.getCopyField"
        :patch-copy-section="ctx.patchCopySection"
      />
    </div>
    <AdminHouseRulesEditor
      :model-value="ctx.record.value.content.house_rules"
      @update:model-value="ctx.patchContent('house_rules', $event)"
    />
  </div>
</template>
