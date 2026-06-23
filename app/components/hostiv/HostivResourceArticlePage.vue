<script setup lang="ts">
import type { HostivResourceArticleId } from "../../data/hostiv-resources.types"
import type { HostivResourceArticle } from "../../data/hostivResources"
import {
  getHostivResourceArticle,
  getHostivResourceArticlePath,
  getHostivResourcesIndex
} from "../../data/hostivResources"
import { getHostivResourceSectionIcon } from "../../data/hostiv-resource-section-icons"
import { getHostivResourcesPath } from "../../data/hostiv-routes"
import {
  buildHostivResourceGuidePath,
  getHostivRelatedResourcesTitle,
  getHostivResourceInlineLinksTitle,
  getRelatedHostivResourceArticles
} from "../../data/hostiv-resource-linking"

const props = defineProps<{
  article: HostivResourceArticle
}>()

const { locale, landing, homePath } = useHostivLocale()
const index = computed(() => getHostivResourcesIndex(locale.value))
const resourcesPath = computed(() => getHostivResourcesPath(locale.value))
const relatedArticles = computed(() => getRelatedHostivResourceArticles(props.article.id, locale.value))

const breadcrumbs = computed(() => [
  { label: landing.value.seo.breadcrumbHomeLabel, to: homePath.value },
  { label: index.value.title, to: resourcesPath.value },
  { label: props.article.title }
])

useHostivMarketingSeo({
  title: () => props.article.seoTitle,
  description: () => props.article.seoDescription,
  ogTitle: () => props.article.seoTitle,
  ogDescription: () => props.article.seoDescription
})

function resolveInlineLinkLabel(articleId: HostivResourceArticleId) {
  const article = getHostivResourceArticle(articleId, locale.value)

  return article?.title ?? ""
}
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-static">
      <div class="hostiv-container">
        <HostivBreadcrumbs :items="breadcrumbs" />

        <header class="hostiv-static__head">
          <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ index.eyebrow }}</p>
          <h1 class="hostiv-h2 hostiv-static__title">{{ article.title }}</h1>
          <p class="hostiv-static__lead">{{ article.description }}</p>
          <p class="hostiv-static__updated">
            {{ article.readingMinutes }} {{ index.readingTimeLabel }}
          </p>
        </header>

        <div class="hostiv-static__body">
          <section class="hostiv-static__section hostiv-static__section--guide">
            <article
              v-for="(block, blockIndex) in article.sections"
              :key="`${article.id}-block-${blockIndex}`"
              class="hostiv-guide-block"
            >
              <header v-if="block.title" class="hostiv-guide-block__head">
                <span class="hostiv-guide-block__icon" aria-hidden="true">
                  <HostivResourceSectionIcon
                    :name="getHostivResourceSectionIcon(article.id, blockIndex)"
                  />
                </span>
                <h2 class="hostiv-static__section-title hostiv-guide-block__title">
                  {{ block.title }}
                </h2>
              </header>
              <p
                v-for="(paragraph, paragraphIndex) in block.paragraphs"
                :key="paragraphIndex"
              >
                {{ paragraph }}
              </p>
              <ul v-if="block.list?.length" class="hostiv-static__list">
                <li v-for="item in block.list" :key="item">{{ item }}</li>
              </ul>
              <div v-if="block.links?.length" class="hostiv-guide-block__links">
                <p class="hostiv-guide-block__links-title">
                  {{ getHostivResourceInlineLinksTitle(locale) }}
                </p>
                <ul class="hostiv-guide-block__links-list">
                  <li v-for="link in block.links" :key="link.articleId">
                    <NuxtLink :to="buildHostivResourceGuidePath(link.articleId, locale)">
                      {{ link.label || resolveInlineLinkLabel(link.articleId) }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </article>
          </section>
        </div>

        <HostivRelatedResources
          :title="getHostivRelatedResourcesTitle(locale)"
          :articles="relatedArticles"
        />

        <p class="hostiv-static__back">
          <NuxtLink :to="resourcesPath" class="hostiv-static__back-link">
            {{ index.backToIndexLabel }}
          </NuxtLink>
        </p>
      </div>
    </main>
    <HostivFooter />
    <HostivAccountModal />
    <HostivScrollTop />
  </div>
</template>
