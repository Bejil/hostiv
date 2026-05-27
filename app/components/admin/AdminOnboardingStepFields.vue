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

const props = defineProps<{
  stepId: AdminOnboardingStepId
}>()

const ctx = useAdminEditorContext()
const record = ctx.record

const brandMetaExamples = ["Le Chesnay · Versailles", "Appartement familial · 10 min du centre"]

const heroPhotoExamples = [
  "Salon lumineux vu depuis l’entrée",
  "Façade ou pièce la plus représentative du logement"
]

const heroEyebrowExamples = [
  "Appartement entier · Le Chesnay",
  "Maison de vacances · 10 min de la mer"
]

const heroTitleExamples = [
  "Séjournez au calme, sans compromis sur le confort",
  "Un pied-à-terre familial, à deux pas du centre-ville"
]

const heroTextExamples = [
  "Un appartement de charme avec arrivée autonome, proche des commerces et des transports.",
  "54 m², 4 voyageurs, espace télétravail et équipements pensés pour les familles."
]

const hostPhotoExamples = [
  "Portrait en situation, regard caméra",
  "Photo naturelle, sourire, dans le logement ou devant l’entrée"
]

const hostCaptionExamples = ["Sophie · votre hôte", "Marc & Julie · vos hôtes"]

const hostTitleExamples = [
  "Une adresse familiale à laquelle nous sommes attachés",
  "Un logement que nous ouvrons avec soin, saison après saison"
]

const hostQuoteExamples = [
  "Un ancien chez-nous que nous ouvrons avec attention — pour que vous vous sentiez attendus.",
  "Nous aimons accueillir des voyageurs curieux, pas seulement des visiteurs de passage."
]

const hostIntroExamples = [
  "Je m’occupe personnellement de l’accueil et reste disponible pendant votre séjour pour répondre à vos questions.",
  "Nous habitons à proximité : arrivée autonome le soir, conseils sur le quartier le lendemain si besoin."
]
</script>

<template>
  <div class="admin-onboarding-fields">
    <!-- Identité -->
    <div v-if="stepId === 'header'" class="admin-onboarding-fields__section">
      <div class="admin-onboarding-fields__row">
        <AdminImageUpload
          cover
          required
          label="Logo"
          :model-value="record.logo_path"
          default-path="branding/header-logo.png"
          :upload="ctx.upload"
          :preview-url="ctx.previewUrl"
          @update:model-value="ctx.patch({ logo_path: $event })"
        />
        <div class="admin-onboarding-fields__stack">
          <AdminField
            label="Nom affiché"
            required
            :model-value="record.brand_name"
            full-width
            @update:model-value="ctx.patchBrandName($event as string)"
          />
          <AdminField
            label="Sous-titre"
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
        Thème <span class="admin-field__required" aria-hidden="true">*</span>
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
            label="Photo principale"
            :model-value="record.hero_image_path"
            default-path="gallery/hero-salon.jpeg"
            :upload="ctx.upload"
            :preview-url="ctx.previewUrl"
            @update:model-value="ctx.patch({ hero_image_path: $event })"
          />
          <AdminOnboardingFieldExamples :examples="heroPhotoExamples" />
        </div>
        <div class="admin-onboarding-fields__stack">
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              label="Sur-titre"
              required
              :model-value="ctx.getCopyField('hero', 'eyebrow')"
              full-width
              @update:model-value="ctx.patchCopySection('hero', 'eyebrow', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="heroEyebrowExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              label="Titre d’accueil"
              required
              :model-value="ctx.getCopyField('hero', 'title')"
              full-width
              @update:model-value="ctx.patchHeroTitle($event as string)"
            />
            <AdminOnboardingFieldExamples :examples="heroTitleExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              label="Texte d’introduction"
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
        hide-intro
        mark-required
        show-field-examples
        :model-value="record"
        :upload="ctx.upload"
        :preview-url="ctx.previewUrl"
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
            label="Photo hôte"
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
              label="Légende photo"
              required
              :model-value="ctx.getCopyField('host', 'caption')"
              full-width
              @update:model-value="ctx.patchHostCaption($event as string)"
            />
            <AdminOnboardingFieldExamples :examples="hostCaptionExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              label="Titre"
              required
              :model-value="ctx.getCopyField('host', 'title')"
              full-width
              @update:model-value="ctx.patchCopySection('host', 'title', $event as string)"
            />
            <AdminOnboardingFieldExamples :examples="hostTitleExamples" />
          </div>
          <div class="admin-onboarding-fields__field-block">
            <AdminField
              label="Citation"
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
          label="Intro 1"
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
        show-field-examples
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
          label="Prix par nuit (€)"
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
          label="Voyageurs inclus"
          type="number"
          required
          :model-value="record.booking_config.included_main_guests"
          full-width
          hint="Nombre de voyageurs couverts par le tarif de base."
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

    <!-- Contact -->
    <div v-else-if="stepId === 'finish'" class="admin-onboarding-fields__section">
      <AdminField
        label="E-mail de réservation"
        type="text"
        required
        :model-value="record.booking_notify_email"
        full-width
        hint="Ex. vous@exemple.com — notifications et demandes de réservation."
        placeholder="vous@exemple.com"
        @update:model-value="ctx.patch({ booking_notify_email: $event as string })"
      />
    </div>
  </div>
</template>
