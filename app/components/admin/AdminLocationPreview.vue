<script setup lang="ts">
import { computed } from "vue"
import LocationHighlightIcon from "../LocationHighlightIcon.vue"
import LocationMap from "../LocationMap.vue"
import type { PropertyLocation, PropertyNeighborhoodHighlight } from "../../types/property-site"

const props = defineProps<{
  location: PropertyLocation
  highlights: PropertyNeighborhoodHighlight[]
  eyebrow: string
  title: string
  intro: string
  lead: string
}>()

const { ui } = useAdminUi()

const displayEyebrow = computed(
  () => props.eyebrow.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ui.value.previews.common.sectionTitle
)
const displayIntro = computed(
  () => props.intro.trim() || ui.value.previews.common.intro
)
const displayLead = computed(
  () => props.lead.trim() || ui.value.previews.location.lead
)

const displayHighlights = computed(() =>
  props.highlights
    .map((item) => ({
      ...item,
      title: item.title.trim() || ui.value.previews.location.highlightTitle,
      text: item.text.trim() || ui.value.previews.location.highlightText
    }))
    .filter((item) => item.title || item.text)
)

const mapKey = computed(
  () => `${props.location.latitude}:${props.location.longitude}:${props.location.radius_meters}`
)
</script>

<template>
  <div class="admin-location-preview" :aria-label="ui.previews.location.ariaLabel">
    <p class="admin-location-preview__label">{{ ui.previews.common.label }}</p>
    <section class="admin-location-preview__section">
      <div class="admin-location-preview__head">
        <p class="admin-location-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-location-preview__head-row">
          <h2 class="admin-location-preview__title">{{ displayTitle }}</h2>
          <p class="admin-location-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <div class="admin-location-preview__layout">
        <div class="admin-location-preview__map-card">
          <div
            v-if="Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))"
            class="admin-location-preview__leaflet-shell"
          >
            <LocationMap
              :key="mapKey"
              :latitude="Number(location.latitude)"
              :longitude="Number(location.longitude)"
              :radius-meters="Number(location.radius_meters) || 400"
              :address="location.address"
            />
          </div>
          <div v-else class="admin-location-preview__map-placeholder" aria-hidden="true" />
        </div>

        <div class="admin-location-preview__content">
          <p class="admin-location-preview__lead">{{ displayLead }}</p>

          <p v-if="!displayHighlights.length" class="admin-location-preview__empty">
            {{ ui.previews.location.emptyHighlights }}
          </p>

          <div v-else class="admin-location-preview__highlights">
            <article
              v-for="(item, index) in displayHighlights"
              :key="`${item.title}-${index}`"
              class="admin-location-preview__highlight"
            >
              <span class="admin-location-preview__icon" aria-hidden="true">
                <LocationHighlightIcon :name="item.icon" />
              </span>
              <div class="admin-location-preview__highlight-body">
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
