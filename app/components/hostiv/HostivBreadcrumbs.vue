<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string; to?: string; href?: string }>
}>()
</script>

<template>
  <nav class="hostiv-breadcrumbs" aria-label="Breadcrumb">
    <ol class="hostiv-breadcrumbs__list">
      <li
        v-for="(item, index) in props.items"
        :key="`${item.label}-${index}`"
        class="hostiv-breadcrumbs__item"
      >
        <NuxtLink
          v-if="item.to && index < props.items.length - 1"
          :to="item.to"
          class="hostiv-breadcrumbs__link"
        >
          {{ item.label }}
        </NuxtLink>
        <a
          v-else-if="item.href && index < props.items.length - 1"
          :href="item.href"
          class="hostiv-breadcrumbs__link"
        >
          {{ item.label }}
        </a>
        <span v-else class="hostiv-breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>
        <span
          v-if="index < props.items.length - 1"
          class="hostiv-breadcrumbs__sep"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>
