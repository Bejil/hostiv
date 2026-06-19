<script setup lang="ts">
import type { SiteLayoutId } from "../../data/site-layouts"

defineProps<{
  layout: SiteLayoutId
}>()
</script>

<template>
  <div
    class="admin-layout-wireframe"
    :class="[`admin-layout-wireframe--${layout}`]"
    aria-hidden="true"
  >
    <template v-if="layout === 'classic'">
      <span class="admin-layout-wireframe__block admin-layout-wireframe__hero" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__booking-inline" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__line" />
    </template>

    <template v-else-if="layout === 'split'">
      <span class="admin-layout-wireframe__block admin-layout-wireframe__hero admin-layout-wireframe__hero--split" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__sidebar" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__line" />
    </template>

    <template v-else-if="layout === 'hotel'">
      <span class="admin-layout-wireframe__block admin-layout-wireframe__hero admin-layout-wireframe__hero--hotel" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__booking-bar" />
      <span class="admin-layout-wireframe__row">
        <span class="admin-layout-wireframe__block admin-layout-wireframe__tile" />
        <span class="admin-layout-wireframe__block admin-layout-wireframe__tile" />
      </span>
    </template>

    <template v-else>
      <span class="admin-layout-wireframe__block admin-layout-wireframe__hero admin-layout-wireframe__hero--editorial" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__line" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__booking-inline admin-layout-wireframe__booking-inline--narrow" />
      <span class="admin-layout-wireframe__block admin-layout-wireframe__line admin-layout-wireframe__line--short" />
    </template>
  </div>
</template>
