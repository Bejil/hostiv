<script setup lang="ts">
import { ChevronDown, CircleHelp } from "@lucide/vue"
import { getHostivPricingPath, getHostivResourcesPath } from "../../data/hostiv-routes"

const { landing, locale } = useHostivLocale()

const faqSection = computed(() => landing.value.faqSection)
const faqGroups = computed(() => landing.value.faqGroups)
const pricingPath = computed(() => getHostivPricingPath(locale.value))
const resourcesPath = computed(() => getHostivResourcesPath(locale.value))
</script>

<template>
  <section
    id="faq"
    class="hostiv-section hostiv-section--faq"
    aria-labelledby="hostiv-faq-title"
  >
    <div class="hostiv-container">
      <header
        class="hostiv-section__head hostiv-section__head--center hostiv-faq__head"
        v-scroll-reveal="{ rootMargin: '0px 0px -6% 0px' }"
      >
        <p class="hostiv-eyebrow hostiv-eyebrow--pill">{{ faqSection.eyebrow }}</p>
        <h2 id="hostiv-faq-title" class="hostiv-h2">{{ faqSection.title }}</h2>
        <p class="hostiv-section__intro hostiv-faq__intro">{{ faqSection.intro }}</p>
      </header>

      <div
        class="hostiv-faq-grid"
        v-scroll-reveal="{ delay: 60, rootMargin: '0px 0px -6% 0px' }"
      >
        <div
          v-for="(group, groupIndex) in faqGroups"
          :key="group.id"
          class="hostiv-faq-group"
          v-scroll-reveal="{ delay: 80 + groupIndex * 40, rootMargin: '0px 0px -6% 0px' }"
        >
          <h3 class="hostiv-faq-group__title">{{ group.label }}</h3>

          <div class="hostiv-faq">
            <details
              v-for="faq in group.items"
              :key="faq.question"
              class="hostiv-faq__item"
            >
              <summary class="hostiv-faq__question">
                <span class="hostiv-faq__question-icon" aria-hidden="true">
                  <CircleHelp :size="18" stroke-width="2" />
                </span>
                <span class="hostiv-faq__question-text">{{ faq.question }}</span>
                <span class="hostiv-faq__chevron" aria-hidden="true">
                  <ChevronDown :size="18" stroke-width="2.25" />
                </span>
              </summary>
              <div class="hostiv-faq__answer-wrap">
                <p class="hostiv-faq__answer">{{ faq.answer }}</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <footer
        class="hostiv-faq__footer"
        v-scroll-reveal="{ delay: 120, rootMargin: '0px 0px -6% 0px' }"
      >
        <NuxtLink :to="pricingPath" class="hostiv-btn hostiv-btn--secondary hostiv-btn--sm">
          {{ faqSection.pricingCta }}
        </NuxtLink>
        <NuxtLink :to="resourcesPath" class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm">
          {{ faqSection.resourcesCta }}
        </NuxtLink>
      </footer>
    </div>
  </section>
</template>
