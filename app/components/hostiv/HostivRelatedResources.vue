<script setup lang="ts">
import type { HostivResourceArticle } from "../../data/hostivResources"
import { getHostivResourceArticlePath } from "../../data/hostivResources"
import { getHostivResourceArticleIcon } from "../../data/hostiv-resource-section-icons"

const props = defineProps<{
  title: string
  articles: HostivResourceArticle[]
}>()

const { locale } = useHostivLocale()
</script>

<template>
  <aside v-if="props.articles.length" class="hostiv-related-resources">
    <h2 class="hostiv-related-resources__title">{{ props.title }}</h2>
    <ul class="hostiv-related-resources__list">
      <li v-for="article in props.articles" :key="article.id">
        <NuxtLink
          :to="getHostivResourceArticlePath(article.id, locale)"
          class="hostiv-related-resources__link"
        >
          <span class="hostiv-related-resources__icon" aria-hidden="true">
            <HostivResourceSectionIcon :name="getHostivResourceArticleIcon(article.id)" />
          </span>
          <span class="hostiv-related-resources__copy">
            <strong>{{ article.title }}</strong>
            <span>{{ article.description }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>
