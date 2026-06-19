<script setup lang="ts">
import type { HostivResourceArticle } from "../../data/hostivResources"
import { getHostivResourcesIndex } from "../../data/hostivResources"
import { getHostivResourceSectionIcon } from "../../data/hostiv-resource-section-icons"
import { getHostivResourcesPath } from "../../data/hostiv-routes"

const props = defineProps<{
  article: HostivResourceArticle
}>()

const { locale } = useHostivLocale()
const index = computed(() => getHostivResourcesIndex(locale.value))
const resourcesPath = computed(() => getHostivResourcesPath(locale.value))

useHostivMarketingSeo({
  title: () => props.article.seoTitle,
  description: () => props.article.seoDescription,
  ogTitle: () => props.article.seoTitle,
  ogDescription: () => props.article.seoDescription
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-static">
      <div class="hostiv-container">
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
            </article>
          </section>
        </div>

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
