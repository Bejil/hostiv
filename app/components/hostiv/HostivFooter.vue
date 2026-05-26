<script setup lang="ts">
import { hostivFooter } from "../../data/hostivLanding"

const year = new Date().getFullYear()

function isInternalLink(href: string) {
  return href.startsWith("/")
}
</script>

<template>
  <footer class="hostiv-footer">
    <div class="hostiv-container hostiv-footer__grid">
      <div class="hostiv-footer__brand">
        <NuxtLink to="/" class="hostiv-logo hostiv-logo--footer">
          <span class="hostiv-logo__mark" aria-hidden="true">
            <img src="/hostiv/logo-mark.svg" alt="" width="32" height="32" class="hostiv-logo__mark-img" />
          </span>
          <span class="hostiv-logo__text">Host<span class="hostiv-logo__accent">iv</span></span>
        </NuxtLink>
        <p class="hostiv-footer__baseline">{{ hostivFooter.baseline }}</p>
        <p class="hostiv-footer__copyright">© {{ year }} Hostiv</p>
      </div>

      <nav class="hostiv-footer__nav" aria-label="Liens du pied de page">
        <div
          v-for="column in hostivFooter.columns"
          :key="column.id"
          class="hostiv-footer__col"
        >
          <h3 class="hostiv-footer__col-title">{{ column.title }}</h3>
          <ul class="hostiv-footer__links">
            <li v-for="link in column.links" :key="link.label">
              <NuxtLink v-if="isInternalLink(link.href)" :to="link.href">
                {{ link.label }}
              </NuxtLink>
              <a v-else :href="link.href">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>
