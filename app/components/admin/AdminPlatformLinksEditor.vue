<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminPlatformStatsPreview from "./AdminPlatformStatsPreview.vue"
import AdminToggle from "./AdminToggle.vue"
import {
  ADMIN_PRESET_PLATFORMS,
  getPresetPlatform,
  isPresetPlatformId
} from "../../data/admin-platform-tabs"
import type { PropertyPlatformLink } from "../../types/property-site"
import { isPlatformLinkHidden } from "../../utils/platform-links"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  modelValue: PropertyPlatformLink[]
  previewUrl: (path: string) => string
  platformStatsEyebrow: string
  platformStatsTitle: string
  platformStatsIntro: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyPlatformLink[]]
}>()

const activeTabId = ref<AdminPresetPlatformId | string>(ADMIN_PRESET_PLATFORMS[0].id)

const tabs = computed(() => {
  const preset = ADMIN_PRESET_PLATFORMS.map((item) => ({
    id: item.id,
    label: item.label
  }))

  const custom = props.modelValue
    .filter((link) => !isPresetPlatformId(link.id))
    .map((link) => ({
      id: link.id,
      label: link.name.trim() || "Nouvelle plateforme"
    }))

  return [...preset, ...custom]
})

function createEmptyLink(id: string): PropertyPlatformLink {
  const preset = getPresetPlatform(id)

  return {
    id,
    name: preset?.defaultName ?? "",
    rating: "",
    stars: "",
    label: "",
    logo: preset?.defaultLogo ?? "",
    url: "",
    hidden: false
  }
}

function isTabHidden(tabId: string): boolean {
  const link = props.modelValue.find((item) => item.id === tabId)

  return link ? isPlatformLinkHidden(link) : false
}

function linkForTab(tabId: string): PropertyPlatformLink {
  return props.modelValue.find((link) => link.id === tabId) ?? createEmptyLink(tabId)
}

const activeLink = computed(() => linkForTab(activeTabId.value))

const isPresetTab = computed(() => isPresetPlatformId(activeTabId.value))
const isCustomTab = computed(() => !isPresetTab.value)

const activeStars = computed(() => ratingToStars(activeLink.value.rating))

function updateActiveLink(partial: Partial<PropertyPlatformLink>) {
  const tabId = activeTabId.value
  const links = [...props.modelValue]
  const index = links.findIndex((link) => link.id === tabId)
  const next: Partial<PropertyPlatformLink> = { ...partial }

  if ("rating" in partial) {
    next.stars = ratingToStars(String(partial.rating ?? ""))
  }

  if (index >= 0) {
    links[index] = { ...links[index], ...next }
  } else {
    links.push({ ...createEmptyLink(tabId), ...next })
  }

  emit("update:modelValue", links)
}

function updateRating(value: string) {
  updateActiveLink({ rating: value })
}

function selectTab(tabId: string) {
  activeTabId.value = tabId
}

function addCustomPlatform() {
  const id = `platform-${Date.now()}`
  const links = [...props.modelValue, createEmptyLink(id)]

  emit("update:modelValue", links)
  activeTabId.value = id
}

function removeCustomPlatform() {
  if (isPresetPlatformId(activeTabId.value)) {
    return
  }

  const removedId = activeTabId.value
  const links = props.modelValue.filter((link) => link.id !== removedId)

  emit("update:modelValue", links)
  activeTabId.value = ADMIN_PRESET_PLATFORMS[0].id
}

watch(
  tabs,
  (items) => {
    if (items.some((tab) => tab.id === activeTabId.value)) {
      return
    }

    activeTabId.value = items[0]?.id ?? ADMIN_PRESET_PLATFORMS[0].id
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-platform-links">
    <div class="admin-subpanel__head admin-platform-links__head">
      <h3>Liens plateformes</h3>
      <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addCustomPlatform">
        <AdminIcon name="plus" :size="16" />
        Ajouter une plateforme
      </button>
    </div>

    <div class="admin-tabs-shell">
      <div class="admin-tabs" role="tablist" aria-label="Plateformes">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="admin-tabs__btn"
          :class="{
            'admin-tabs__btn--active': activeTabId === tab.id,
            'admin-tabs__btn--hidden': isTabHidden(tab.id)
          }"
          :aria-selected="activeTabId === tab.id"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="admin-platform-links__panel" role="tabpanel">
      <header class="admin-platform-links__panel-top">
        <div>
          <p class="admin-platform-links__panel-kicker">
            {{ isPresetTab ? "Plateforme" : "Plateforme personnalisée" }}
          </p>
          <h4 class="admin-platform-links__panel-title">
            {{ activeLink.name || "Sans nom" }}
          </h4>
        </div>
        <div class="admin-platform-links__panel-actions">
          <AdminToggle
            v-if="isPresetTab"
            :model-value="!activeLink.hidden"
            label="Afficher sur le site"
            hint="Désactivez si votre annonce n’est pas sur cette plateforme"
            @update:model-value="updateActiveLink({ hidden: !$event })"
          />
          <button
            v-if="isCustomTab"
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
            @click="removeCustomPlatform"
          >
            <AdminIcon name="trash" :size="16" />
            Supprimer
          </button>
        </div>
      </header>

      <div class="admin-platform-links__fields">
        <AdminField
          label="Nom"
          :model-value="activeLink.name"
          full-width
          @update:model-value="updateActiveLink({ name: $event as string })"
        />
        <div class="admin-platform-links__rating-row">
          <div class="admin-platform-links__rating-field">
            <AdminField
              label="Note"
              hint="Toute note au format score / max (ex. 4,97/5, 9/10, 18/40) est convertie sur 5 étoiles"
              :model-value="activeLink.rating"
              @update:model-value="updateRating($event as string)"
            />
            <p
              class="admin-platform-links__stars-display"
              :class="{ 'admin-platform-links__stars-display--empty': !activeStars }"
              aria-label="Aperçu des étoiles"
            >
              {{ activeStars || "☆☆☆☆☆" }}
            </p>
          </div>
        </div>
        <AdminField
          v-if="isCustomTab"
          label="Logo"
          :model-value="activeLink.logo"
          hint="Chemin Storage, ex. /platforms/ma-plateforme.svg"
          full-width
          @update:model-value="updateActiveLink({ logo: $event as string })"
        />
        <AdminField
          label="URL"
          :model-value="activeLink.url"
          type="url"
          full-width
          @update:model-value="updateActiveLink({ url: $event as string })"
        />
      </div>
    </div>

    <AdminPlatformStatsPreview
      :links="modelValue"
      :eyebrow="platformStatsEyebrow"
      :title="platformStatsTitle"
      :intro="platformStatsIntro"
      :preview-url="previewUrl"
    />
  </div>
</template>
