<script setup lang="ts">
import type { HostivStaticPage } from "../../data/hostivStaticPages"

const props = defineProps<{
  page: HostivStaticPage
}>()

const { landing, homePath } = useHostivLocale()
const staticUi = computed(() => landing.value.staticUi)

useHostivPageSeo(props.page.title, props.page.description)
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-static">
      <div class="hostiv-container">
        <header class="hostiv-static__head">
          <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ page.eyebrow }}</p>
          <h1 class="hostiv-h2 hostiv-static__title">{{ page.title }}</h1>
          <p class="hostiv-static__lead">{{ page.lead }}</p>
          <p v-if="page.updatedAt" class="hostiv-static__updated">
            {{ staticUi.lastUpdated }} {{ page.updatedAt }}
          </p>
        </header>

        <div class="hostiv-static__body">
          <section
            v-for="(section, index) in page.sections"
            :key="`${page.id}-section-${index}`"
            class="hostiv-static__section"
          >
            <h2 v-if="section.title" class="hostiv-static__section-title">
              {{ section.title }}
            </h2>
            <p v-for="(paragraph, pIndex) in section.paragraphs" :key="pIndex">
              {{ paragraph }}
            </p>
            <ul v-if="section.list?.length" class="hostiv-static__list">
              <li v-for="item in section.list" :key="item">{{ item }}</li>
            </ul>

            <aside
              v-if="section.info"
              class="hostiv-static__info"
              :aria-label="section.info.title || 'Information'"
            >
              <p v-if="section.info.title" class="hostiv-static__info-title">
                {{ section.info.title }}
              </p>
              <p v-for="(line, lineIndex) in section.info.paragraphs" :key="lineIndex">
                {{ line }}
              </p>
              <ul v-if="section.info.list?.length" class="hostiv-static__info-list">
                <li v-for="item in section.info.list" :key="item">{{ item }}</li>
              </ul>
            </aside>

            <div
              v-if="$slots.actions && index === 0"
              class="hostiv-static__section-actions"
            >
              <slot name="actions" />
            </div>
          </section>
        </div>

        <p class="hostiv-static__back">
          <NuxtLink :to="homePath" class="hostiv-static__back-link">{{ staticUi.backHome }}</NuxtLink>
        </p>
      </div>
    </main>
    <HostivFooter />
    <HostivAccountModal />
  </div>
</template>
