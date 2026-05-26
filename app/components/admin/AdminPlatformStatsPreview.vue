<script setup lang="ts">
import { computed } from "vue"
import { getPresetPlatform, isPresetPlatformId } from "../../data/admin-platform-tabs"
import type { PropertyPlatformLink } from "../../types/property-site"
import { isPlatformLinkHidden } from "../../utils/platform-links"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  links: PropertyPlatformLink[]
  eyebrow: string
  title: string
  intro: string
  previewUrl: (path: string) => string
}>()

const previewLinks = computed(() =>
  props.links
    .filter((link) => !isPlatformLinkHidden(link))
    .map((link) => {
      const preset = getPresetPlatform(link.id)
      const rating = link.rating.trim()
      const name = link.name.trim() || preset?.defaultName || ""

      return {
        ...link,
        name,
        rating,
        stars: ratingToStars(rating),
        logo: link.logo.trim() || preset?.defaultLogo || ""
      }
    })
    .filter((link) => link.name || link.rating || link.url.trim())
)

function logoSrc(path: string) {
  const trimmed = path.trim()

  if (!trimmed) {
    return ""
  }

  return props.previewUrl(trimmed)
}
</script>

<template>
  <div class="admin-platform-stats-preview" aria-label="Aperçu des plateformes">
    <p class="admin-platform-stats-preview__label">Aperçu</p>
    <section class="admin-platform-stats-preview__section">
      <div class="admin-platform-stats-preview__head">
        <p class="admin-platform-stats-preview__eyebrow">{{ eyebrow || "Sur-titre" }}</p>
        <h3 class="admin-platform-stats-preview__title">{{ title || "Titre" }}</h3>
        <p class="admin-platform-stats-preview__intro">{{ intro || "Introduction" }}</p>
      </div>

      <p v-if="!previewLinks.length" class="admin-platform-stats-preview__empty">
        Renseignez au moins une plateforme pour afficher l’aperçu.
      </p>

      <div v-else class="admin-platform-stats-preview__grid">
        <article
          v-for="platform in previewLinks"
          :key="platform.id"
          class="admin-platform-stats-preview__card"
        >
          <span
            class="admin-platform-stats-preview__logo"
            :class="isPresetPlatformId(platform.id) ? `admin-platform-stats-preview__logo--${platform.id}` : ''"
          >
            <img
              v-if="logoSrc(platform.logo)"
              :src="logoSrc(platform.logo)"
              :alt="`${platform.name} logo`"
              class="admin-platform-stats-preview__logo-img"
            />
          </span>
          <div class="admin-platform-stats-preview__main">
            <strong class="admin-platform-stats-preview__name">{{ platform.name }}</strong>
            <div class="admin-platform-stats-preview__ratings">
              <span
                class="admin-platform-stats-preview__stars"
                :class="{ 'admin-platform-stats-preview__stars--empty': !platform.stars }"
              >
                {{ platform.stars || "☆☆☆☆☆" }}
              </span>
              <span v-if="platform.rating" class="admin-platform-stats-preview__score">
                Note moyenne de {{ platform.rating }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
