<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import type { AccordionItem } from "@nuxt/ui"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { useAdminLiveEditorContext } from "../../composables/admin-live-editor-context"
import type { WelcomeGuidePreviewPageId } from "../../utils/admin-welcome-guide-preview-messages"
import type { PropertyWelcomeGuide } from "../../types/welcome-guide"
import { getAdminWelcomeGuideFieldExamples } from "../../data/admin-welcome-guide-field-examples"
import { downloadWelcomeGuidePdf } from "../../utils/download-welcome-guide-pdf"
import AdminCustomizationBlockStatus from "./AdminCustomizationBlockStatus.vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminImageUpload from "./AdminImageUpload.vue"
import AdminWelcomeGuideCheckoutEditor from "./AdminWelcomeGuideCheckoutEditor.vue"
import AdminWelcomeGuideDiningEditor from "./AdminWelcomeGuideDiningEditor.vue"
import AdminWelcomeGuideEmergencyEditor from "./AdminWelcomeGuideEmergencyEditor.vue"
import AdminWelcomeGuidePlacesEditor from "./AdminWelcomeGuidePlacesEditor.vue"
import AdminWelcomeGuideRulesEditor from "./AdminWelcomeGuideRulesEditor.vue"
import {
  isWelcomeGuidePage1Complete,
  isWelcomeGuidePage2Complete,
  isWelcomeGuidePage3Complete,
  isWelcomeGuidePage4Complete,
  isWelcomeGuidePage5Complete,
  isWelcomeGuidePage6Complete,
  isWelcomeGuidePage7Complete
} from "../../utils/welcome-guide-completion"

const { slug, record, getWelcomeGuide, patchWelcomeGuide, upload, previewUrl, saveDraft, siteEditLocale } =
  useAdminEditorContext()
const liveEditor = useAdminLiveEditorContext()
const { ui } = useAdminUi()

const fieldExamples = computed(() => getAdminWelcomeGuideFieldExamples(siteEditLocale.value))

const welcomeGuideImagePreviewRevision = computed(
  () => liveEditor?.welcomeGuidePreviewAssetRevision.value ?? 0
)

function onWelcomeGuideImageUploaded() {
  liveEditor?.bumpWelcomeGuidePreviewAssets()
}

const pdfLoading = ref(false)
const pdfError = ref<string | null>(null)
const activeBlock = ref<string | undefined>("page-1")

const guide = computed(() => getWelcomeGuide())

const accordionItems = computed<AccordionItem[]>(() => {
  const accordion = ui.value.welcomeGuide.accordion

  return [
    { label: accordion.page1, value: "page-1", slot: "page-1" },
    { label: accordion.page2, value: "page-2", slot: "page-2" },
    { label: accordion.page3, value: "page-3", slot: "page-3" },
    { label: accordion.page4, value: "page-4", slot: "page-4" },
    { label: accordion.page5, value: "page-5", slot: "page-5" },
    { label: accordion.page6, value: "page-6", slot: "page-6" },
    { label: accordion.page7, value: "page-7", slot: "page-7" }
  ]
})

const accordionUi = {
  root: "admin-customization-accordion",
  item: "admin-customization-accordion__item rounded-none",
  header: "admin-customization-accordion__header",
  trigger:
    "admin-customization-accordion__trigger group flex w-full items-center justify-between gap-3 rounded-none text-left font-semibold text-[var(--admin-ink)]",
  label: "admin-customization-accordion__label min-w-0 flex-1",
  trailingIcon: "hidden",
  content: "admin-customization-accordion__content",
  body: "admin-customization-accordion__body"
} as const

const page1Complete = computed(() => isWelcomeGuidePage1Complete(guide.value, record.value))

const page2Complete = computed(() => isWelcomeGuidePage2Complete(guide.value, record.value))

const page3Complete = computed(() => isWelcomeGuidePage3Complete(guide.value))

const page5Complete = computed(() => isWelcomeGuidePage5Complete(guide.value))

const page6Complete = computed(() => isWelcomeGuidePage6Complete(guide.value, record.value))

const page7Complete = computed(() => isWelcomeGuidePage7Complete(guide.value))

const page4Complete = computed(() => isWelcomeGuidePage4Complete(guide.value, record.value))

function accordionIcon(value: string | undefined) {
  if (value === "page-1") {
    return "image"
  }

  if (value === "page-3") {
    return "list"
  }

  if (value === "page-4") {
    return "alert"
  }

  if (value === "page-5") {
    return "map-pin"
  }

  if (value === "page-6") {
    return "star"
  }

  if (value === "page-7") {
    return "logout"
  }

  return "user"
}

function blockComplete(value: string | undefined) {
  if (value === "page-1") {
    return page1Complete.value
  }

  if (value === "page-3") {
    return page3Complete.value
  }

  if (value === "page-4") {
    return page4Complete.value
  }

  if (value === "page-5") {
    return page5Complete.value
  }

  if (value === "page-6") {
    return page6Complete.value
  }

  if (value === "page-7") {
    return page7Complete.value
  }

  return page2Complete.value
}

function updateGuide(partial: Partial<PropertyWelcomeGuide>) {
  patchWelcomeGuide(partial)
}

async function authHeaders() {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : ""
}

async function onDownloadPdf() {
  pdfLoading.value = true
  pdfError.value = null

  try {
    if (saveDraft) {
      const saved = await saveDraft()

      if (!saved) {
        pdfError.value = ui.value.welcomeGuide.pdf.saveBefore
        return
      }
    }

    await downloadWelcomeGuidePdf(
      slug.value,
      record.value,
      await authHeaders(),
      welcomeGuideImagePreviewRevision.value,
      siteEditLocale.value
    )
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    pdfError.value = e.data?.message || e.message || ui.value.welcomeGuide.pdf.error
  } finally {
    pdfLoading.value = false
  }
}

watch(
  activeBlock,
  (page) => {
    liveEditor?.setWelcomeGuidePage(page as WelcomeGuidePreviewPageId | undefined)
  },
  { immediate: true }
)

const pageLeads = computed(() => {
  const leads = ui.value.welcomeGuide.pageLeads

  return {
    "page-1": leads.page1,
    "page-2": leads.page2,
    "page-3": leads.page3,
    "page-4": leads.page4,
    "page-5": leads.page5,
    "page-6": leads.page6,
    "page-7": leads.page7
  } as Record<string, string>
})
</script>

<template>
  <section class="admin-panel admin-panel--welcome-guide">
    <div class="admin-customization admin-welcome-guide">
      <button
        type="button"
        class="admin-btn admin-btn--primary admin-welcome-guide__download"
        :disabled="pdfLoading"
        @click="onDownloadPdf"
      >
        <AdminIcon name="file" :size="16" />
        {{ pdfLoading ? ui.welcomeGuide.pdf.generating : ui.welcomeGuide.pdf.download }}
      </button>

      <p v-if="pdfError" class="admin-welcome-guide__error" role="alert">{{ pdfError }}</p>

      <UAccordion
        v-model="activeBlock"
        :items="accordionItems"
        type="single"
        collapsible
        :unmount-on-hide="false"
        :ui="accordionUi"
      >
        <template #trailing="{ open }">
          <ChevronDown
            :size="20"
            stroke-width="2"
            class="admin-customization-accordion__chevron"
            :class="{ 'admin-customization-accordion__chevron--open': open }"
            aria-hidden="true"
          />
        </template>
        <template #default="{ item }">
          <span class="admin-customization-accordion__head">
            <span class="admin-customization-accordion__copy">
              <span class="admin-customization-accordion__title-row">
                <AdminIcon
                  :name="accordionIcon(item.value as string)"
                  :size="20"
                  class="admin-customization-accordion__icon"
                />
                <span class="admin-customization-accordion__title">{{ item.label }}</span>
              </span>
              <span class="admin-customization__block-lead">
                {{ pageLeads[item.value as string] ?? "" }}
              </span>
            </span>
            <AdminCustomizationBlockStatus :complete="blockComplete(item.value as string)" />
          </span>
        </template>

        <template #page-1>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <AdminImageUpload
              cover
              :label="ui.welcomeGuide.fields.coverImage"
              :model-value="guide.cover_image_path"
              :fallback-preview-path="record.hero_image_path"
              default-path="gallery/welcome-guide-cover.jpeg"
              :examples="[...fieldExamples.coverImage]"
              :upload="upload"
              :preview-url="previewUrl"
              :preview-revision="welcomeGuideImagePreviewRevision"
              @update:model-value="updateGuide({ cover_image_path: String($event) })"
              @uploaded="onWelcomeGuideImageUploaded"
            />
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.coverTitle"
                :model-value="guide.cover_title"
                :examples="[...fieldExamples.coverTitle]"
                full-width
                @update:model-value="updateGuide({ cover_title: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.coverSubtitle"
                :model-value="guide.cover_subtitle"
                :examples="[...fieldExamples.coverSubtitle]"
                full-width
                @update:model-value="updateGuide({ cover_subtitle: String($event) })"
              />
            </div>
          </div>
        </template>

        <template #page-2>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <AdminImageUpload
              cover
              :label="ui.welcomeGuide.fields.hostPhoto"
              :model-value="guide.host_image_path"
              :fallback-preview-path="record.host_photo_path"
              default-path="gallery/welcome-guide-host.jpeg"
              :examples="[...fieldExamples.hostPhoto]"
              :upload="upload"
              :preview-url="previewUrl"
              :preview-revision="welcomeGuideImagePreviewRevision"
              @update:model-value="updateGuide({ host_image_path: String($event) })"
              @uploaded="onWelcomeGuideImageUploaded"
            />
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.hostName"
                :model-value="guide.host_name"
                :examples="[...fieldExamples.hostName]"
                full-width
                @update:model-value="updateGuide({ host_name: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.hostSectionTitle"
                :model-value="guide.host_section_title"
                :examples="[...fieldExamples.hostSectionTitle]"
                full-width
                @update:model-value="updateGuide({ host_section_title: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.hostBio"
                type="textarea"
                :rows="4"
                :model-value="guide.host_bio"
                :examples="[...fieldExamples.hostBio]"
                full-width
                @update:model-value="updateGuide({ host_bio: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.hostPhone"
                type="text"
                :model-value="guide.host_phone"
                :examples="[...fieldExamples.hostPhone]"
                full-width
                @update:model-value="updateGuide({ host_phone: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.hostEmail"
                type="email"
                :model-value="guide.host_email"
                :examples="[...fieldExamples.hostEmail]"
                full-width
                @update:model-value="updateGuide({ host_email: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.welcomeEyebrow"
                :model-value="guide.welcome_eyebrow"
                :examples="[...fieldExamples.welcomeEyebrow]"
                full-width
                @update:model-value="updateGuide({ welcome_eyebrow: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.welcomeBanner"
                :model-value="guide.welcome_banner"
                :examples="[...fieldExamples.welcomeBanner]"
                full-width
                @update:model-value="updateGuide({ welcome_banner: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.welcomeSalutation"
                :model-value="guide.welcome_salutation"
                :examples="[...fieldExamples.welcomeSalutation]"
                full-width
                @update:model-value="updateGuide({ welcome_salutation: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.welcomeBody"
                type="textarea"
                :rows="8"
                :model-value="guide.welcome_body"
                :examples="[...fieldExamples.welcomeBody]"
                :hint="ui.welcomeGuide.hints.welcomeBody"
                full-width
                @update:model-value="updateGuide({ welcome_body: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.welcomeSignature"
                :model-value="guide.welcome_signature"
                :examples="[...fieldExamples.welcomeSignature]"
                full-width
                @update:model-value="updateGuide({ welcome_signature: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.wifiNetwork"
                required
                :model-value="guide.wifi_network"
                :examples="[...fieldExamples.wifiNetwork]"
                full-width
                @update:model-value="updateGuide({ wifi_network: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.wifiPassword"
                required
                :model-value="guide.wifi_password"
                :examples="[...fieldExamples.wifiPassword]"
                full-width
                @update:model-value="updateGuide({ wifi_password: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.parkingStreet"
                type="textarea"
                :rows="2"
                :model-value="guide.parking_street"
                :examples="[...fieldExamples.parkingStreet]"
                full-width
                @update:model-value="updateGuide({ parking_street: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.parkingPayment"
                type="textarea"
                :rows="2"
                :model-value="guide.parking_payment"
                :examples="[...fieldExamples.parkingPayment]"
                full-width
                @update:model-value="updateGuide({ parking_payment: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.parkingNote"
                type="textarea"
                :rows="2"
                :model-value="guide.parking_note"
                :examples="[...fieldExamples.parkingNote]"
                full-width
                @update:model-value="updateGuide({ parking_note: String($event) })"
              />
            </div>
          </div>
        </template>

        <template #page-3>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.rulesTitle"
                :model-value="guide.rules_title"
                :examples="[...fieldExamples.rulesTitle]"
                full-width
                @update:model-value="updateGuide({ rules_title: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.rulesBanner"
                :model-value="guide.rules_banner"
                :examples="[...fieldExamples.rulesBanner]"
                full-width
                @update:model-value="updateGuide({ rules_banner: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.rulesFooter"
                type="textarea"
                :rows="2"
                :model-value="guide.rules_footer"
                :examples="[...fieldExamples.rulesFooter]"
                full-width
                @update:model-value="updateGuide({ rules_footer: String($event) })"
              />
            </div>
            <AdminWelcomeGuideRulesEditor
              :model-value="guide.rules ?? []"
              @update:model-value="updateGuide({ rules: $event })"
            />
          </div>
        </template>

        <template #page-4>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <AdminImageUpload
              cover
              :label="ui.welcomeGuide.fields.emergencyImage"
              :model-value="guide.emergency_image_path"
              :fallback-preview-path="record.hero_image_path"
              default-path="gallery/welcome-guide-emergency.jpeg"
              :examples="[...fieldExamples.emergencyImage]"
              :upload="upload"
              :preview-url="previewUrl"
              :preview-revision="welcomeGuideImagePreviewRevision"
              @update:model-value="updateGuide({ emergency_image_path: String($event) })"
              @uploaded="onWelcomeGuideImageUploaded"
            />
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.emergencyEyebrow"
                :model-value="guide.emergency_eyebrow"
                :examples="[...fieldExamples.emergencyEyebrow]"
                full-width
                @update:model-value="updateGuide({ emergency_eyebrow: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.emergencyBanner"
                :model-value="guide.emergency_banner"
                :examples="[...fieldExamples.emergencyBanner]"
                full-width
                @update:model-value="updateGuide({ emergency_banner: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.emergencyIntro"
                type="textarea"
                :rows="3"
                :model-value="guide.emergency_intro"
                :examples="[...fieldExamples.emergencyIntro]"
                full-width
                @update:model-value="updateGuide({ emergency_intro: String($event) })"
              />
            </div>
            <AdminWelcomeGuideEmergencyEditor
              :model-value="guide.emergency_contacts ?? []"
              @update:model-value="updateGuide({ emergency_contacts: $event })"
            />
          </div>
        </template>

        <template #page-5>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.placesCity"
                :model-value="guide.places_city"
                :examples="[...fieldExamples.placesCity]"
                full-width
                @update:model-value="updateGuide({ places_city: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.placesTitle"
                :model-value="guide.places_title"
                :examples="[...fieldExamples.placesTitle]"
                full-width
                @update:model-value="updateGuide({ places_title: String($event) })"
              />
            </div>
            <AdminWelcomeGuidePlacesEditor
              :model-value="guide.places ?? []"
              :upload="upload"
              :preview-url="previewUrl"
              :preview-revision="welcomeGuideImagePreviewRevision"
              :fallback-preview-path="record.hero_image_path"
              :on-image-uploaded="onWelcomeGuideImageUploaded"
              @update:model-value="updateGuide({ places: $event })"
            />
          </div>
        </template>

        <template #page-6>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <AdminImageUpload
              cover
              :label="ui.welcomeGuide.fields.diningImage"
              :model-value="guide.dining_image_path"
              :fallback-preview-path="record.hero_image_path"
              default-path="gallery/welcome-guide-dining.jpeg"
              :examples="[...fieldExamples.diningImage]"
              :upload="upload"
              :preview-url="previewUrl"
              :preview-revision="welcomeGuideImagePreviewRevision"
              @update:model-value="updateGuide({ dining_image_path: String($event) })"
              @uploaded="onWelcomeGuideImageUploaded"
            />
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.diningEyebrow"
                :model-value="guide.dining_eyebrow"
                :examples="[...fieldExamples.diningEyebrow]"
                full-width
                @update:model-value="updateGuide({ dining_eyebrow: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.diningBanner"
                :model-value="guide.dining_banner"
                :examples="[...fieldExamples.diningBanner]"
                full-width
                @update:model-value="updateGuide({ dining_banner: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.diningIntro"
                type="textarea"
                :rows="3"
                :model-value="guide.dining_intro"
                :examples="[...fieldExamples.diningIntro]"
                full-width
                @update:model-value="updateGuide({ dining_intro: String($event) })"
              />
            </div>
            <AdminWelcomeGuideDiningEditor
              :model-value="guide.dining_spots ?? []"
              @update:model-value="updateGuide({ dining_spots: $event })"
            />
          </div>
        </template>

        <template #page-7>
          <div class="admin-customization__panel admin-welcome-guide__panel">
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.checkoutTitle"
                :model-value="guide.checkout_title"
                :examples="[...fieldExamples.checkoutTitle]"
                full-width
                @update:model-value="updateGuide({ checkout_title: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.checkoutBanner"
                :model-value="guide.checkout_banner"
                :examples="[...fieldExamples.checkoutBanner]"
                full-width
                @update:model-value="updateGuide({ checkout_banner: String($event) })"
              />
              <AdminField
                :label="ui.welcomeGuide.fields.checkoutImportant"
                type="textarea"
                :rows="4"
                :hint="ui.welcomeGuide.hints.checkoutImportant"
                :model-value="guide.checkout_important"
                :examples="[...fieldExamples.checkoutImportant]"
                full-width
                @update:model-value="updateGuide({ checkout_important: String($event) })"
              />
            </div>
            <AdminWelcomeGuideCheckoutEditor
              :model-value="guide.checkout_items ?? []"
              @update:model-value="updateGuide({ checkout_items: $event })"
            />
            <div class="admin-welcome-guide__fields">
              <AdminField
                :label="ui.welcomeGuide.fields.checkoutFooter"
                type="textarea"
                :rows="2"
                :model-value="guide.checkout_footer"
                :examples="[...fieldExamples.checkoutFooter]"
                full-width
                @update:model-value="updateGuide({ checkout_footer: String($event) })"
              />
            </div>
          </div>
        </template>
      </UAccordion>
    </div>
  </section>
</template>
