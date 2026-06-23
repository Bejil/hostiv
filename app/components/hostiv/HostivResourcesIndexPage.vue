<script setup lang="ts">
import {
  getHostivResourceArticlePath,
  getHostivResourcesIndex,
  listHostivResourceArticles
} from "../../data/hostivResources"
import { getHostivResourceArticleIcon } from "../../data/hostiv-resource-section-icons"
import { listHostivResourceClusters } from "../../data/hostiv-resource-linking"

const { locale, landing, homePath } = useHostivLocale()
const index = computed(() => getHostivResourcesIndex(locale.value))
const articles = computed(() => listHostivResourceArticles(locale.value))
const clusters = computed(() => listHostivResourceClusters(locale.value))

const breadcrumbs = computed(() => [
  { label: landing.value.seo.breadcrumbHomeLabel, to: homePath.value },
  { label: index.value.title }
])

useHostivMarketingSeo({
  title: () => index.value.seoTitle,
  description: () => index.value.seoDescription,
  ogTitle: () => index.value.seoTitle,
  ogDescription: () => index.value.seoDescription
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-static">
      <div class="hostiv-container">
        <HostivBreadcrumbs :items="breadcrumbs" />

        <header class="hostiv-static__head">
          <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ index.eyebrow }}</p>
          <h1 class="hostiv-h2 hostiv-static__title">{{ index.title }}</h1>
          <p class="hostiv-static__lead">{{ index.intro }}</p>
        </header>

        <div class="hostiv-resource-clusters">
          <section
            v-for="cluster in clusters"
            :key="cluster.id"
            class="hostiv-resource-cluster"
          >
            <header class="hostiv-resource-cluster__head">
              <h2 class="hostiv-resource-cluster__title">{{ cluster.title }}</h2>
              <p class="hostiv-resource-cluster__intro">{{ cluster.description }}</p>
            </header>
            <ul class="hostiv-resource-cluster__list">
              <li v-for="article in cluster.articles" :key="article.id">
                <NuxtLink
                  :to="getHostivResourceArticlePath(article.id, locale)"
                  class="hostiv-resource-cluster__link"
                >
                  <span class="hostiv-resource-cluster__icon" aria-hidden="true">
                    <HostivResourceSectionIcon :name="getHostivResourceArticleIcon(article.id)" />
                  </span>
                  <span>{{ article.title }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>

        <div class="hostiv-resources">
          <NuxtLink
            v-for="article in articles"
            :key="article.id"
            :to="getHostivResourceArticlePath(article.id, locale)"
            class="hostiv-resources__card"
          >
            <header class="hostiv-resources__head">
              <span class="hostiv-resources__icon" aria-hidden="true">
                <HostivResourceSectionIcon :name="getHostivResourceArticleIcon(article.id)" />
              </span>
              <h2 class="hostiv-resources__title">{{ article.title }}</h2>
            </header>
            <p class="hostiv-resources__description">{{ article.description }}</p>
            <p class="hostiv-resources__meta">
              {{ article.readingMinutes }} {{ index.readingTimeLabel }}
            </p>
            <span class="hostiv-resources__link">{{ index.readMoreLabel }}</span>
          </NuxtLink>
        </div>

        <p class="hostiv-static__back">
          <NuxtLink :to="homePath" class="hostiv-static__back-link">
            {{ landing.staticUi.backHome }}
          </NuxtLink>
        </p>
      </div>
    </main>
    <HostivFooter />
    <HostivAccountModal />
    <HostivScrollTop />
  </div>
</template>
