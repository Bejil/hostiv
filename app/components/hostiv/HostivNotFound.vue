<script setup lang="ts">
import { getHostivLanding } from "../../data/hostivLanding"

const props = defineProps<{
  title?: string
  message?: string
  slug?: string
}>()

const { locale, homePath } = useHostivLocale()
const notFoundUi = computed(() => getHostivLanding(locale.value).notFound)

const displayTitle = computed(() => props.title ?? notFoundUi.value.titles.page)
const displayMessage = computed(() => props.message ?? notFoundUi.value.messages.page)

const { openSignup } = useHostivAccountModal()
</script>

<template>
  <main class="hostiv-not-found">
    <div class="hostiv-container hostiv-not-found__inner">
      <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ notFoundUi.eyebrow }}</p>
      <p class="hostiv-not-found__code" aria-hidden="true">404</p>
      <h1 class="hostiv-h2 hostiv-not-found__title">{{ displayTitle }}</h1>
      <p class="hostiv-not-found__message">{{ displayMessage }}</p>
      <p v-if="slug" class="hostiv-not-found__slug">
        {{ notFoundUi.requestedAddress }} <code>/{{ slug }}</code>
      </p>

      <div class="hostiv-not-found__actions">
        <NuxtLink :to="homePath" class="hostiv-btn hostiv-btn--primary">
          {{ notFoundUi.backHome }}
        </NuxtLink>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="openSignup">
          {{ notFoundUi.createSite }}
        </button>
      </div>
    </div>
  </main>
</template>
