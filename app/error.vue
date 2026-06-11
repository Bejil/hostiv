<script setup lang="ts">
import type { NuxtError } from "#app"
import { adminUiFormat } from "./data/admin-ui"
import { getHostivLanding } from "./data/hostivLanding"
import HostivAccountModal from "./components/hostiv/HostivAccountModal.vue"
import HostivNotFound from "./components/hostiv/HostivNotFound.vue"
import HostivNav from "./components/hostiv/HostivNav.vue"
import { resolveHostivNotFoundKind } from "./utils/hostiv-not-found"

const props = defineProps<{
  error: NuxtError
}>()

useHostivMarketingHead()

const { locale, homePath } = useHostivLocale()
const landing = computed(() => getHostivLanding(locale.value))
const notFoundUi = computed(() => landing.value.notFound)

const is404 = computed(() => props.error.statusCode === 404)

const notFoundKind = computed(() => resolveHostivNotFoundKind(props.error))

const notFoundTitle = computed(() => notFoundUi.value.titles[notFoundKind.value])

const notFoundMessage = computed(() => {
  const data = props.error.data as { notFoundKind?: string } | undefined

  if (data?.notFoundKind) {
    return notFoundUi.value.messages[notFoundKind.value]
  }

  const message = props.error.statusMessage?.trim()

  if (message) {
    return message
  }

  return notFoundUi.value.messages[notFoundKind.value]
})

const requestedSlug = computed(() => {
  const path = useRoute().path
  const match = path.match(/^\/([^/]+)(?:\/admin)?\/?$/)

  return match?.[1] && match[1] !== "admin" ? match[1] : ""
})

const genericErrorEyebrow = computed(() =>
  adminUiFormat(notFoundUi.value.error.eyebrow, {
    code: props.error.statusCode || 500
  })
)

useSeoMeta({
  title: () =>
    is404.value
      ? `${notFoundTitle.value}${notFoundUi.value.seoTitleSuffix}`
      : notFoundUi.value.error.seoTitle,
  robots: "noindex, nofollow"
})

function goHome() {
  clearError({ redirect: homePath.value })
}
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <HostivNotFound
      v-if="is404"
      :title="notFoundTitle"
      :message="notFoundMessage"
      :slug="requestedSlug"
    />
    <main v-else class="hostiv-not-found">
      <div class="hostiv-container hostiv-not-found__inner">
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ genericErrorEyebrow }}</p>
        <h1 class="hostiv-h2 hostiv-not-found__title">{{ notFoundUi.error.title }}</h1>
        <p class="hostiv-not-found__message">
          {{ error.statusMessage || notFoundUi.error.message }}
        </p>
        <div class="hostiv-not-found__actions">
          <button type="button" class="hostiv-btn hostiv-btn--primary" @click="goHome">
            {{ notFoundUi.error.backHome }}
          </button>
        </div>
      </div>
    </main>
    <HostivAccountModal />
  </div>
</template>

<style src="../assets/css/pages/hostiv/hostiv.css"></style>
