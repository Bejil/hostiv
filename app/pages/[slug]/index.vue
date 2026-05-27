<script setup lang="ts">
import PropertySitePageView from "../../components/site/PropertySitePageView.vue"
import { validatePropertySlugFormat } from "../../utils/property-slug"

definePageMeta({
  validate(route) {
    const slug = route.params.slug

    if (typeof slug !== "string" || !slug.length) {
      return false
    }

    if (slug.includes(".")) {
      return false
    }

    return validatePropertySlugFormat(slug).valid
  }
})

const { site, slug } = await usePropertySitePage()
</script>

<template>
  <PropertySitePageView :site="site" :slug="slug" />
</template>
