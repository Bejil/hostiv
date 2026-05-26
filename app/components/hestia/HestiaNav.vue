<script setup lang="ts">
import { Menu, X } from "@lucide/vue"
import { hestiaNavLinks } from "../../data/hestiaLanding"

const isOpen = ref(false)

function closeMenu() {
  isOpen.value = false
}
</script>

<template>
  <header class="hestia-nav">
    <div class="hestia-container hestia-nav__inner">
      <NuxtLink to="/" class="hestia-logo" @click="closeMenu">
        <span class="hestia-logo__mark" aria-hidden="true">H</span>
        <span class="hestia-logo__text">Hestia</span>
      </NuxtLink>

      <nav class="hestia-nav__links" aria-label="Navigation principale">
        <a v-for="link in hestiaNavLinks" :key="link.href" :href="link.href" class="hestia-nav__link">
          {{ link.label }}
        </a>
      </nav>

      <div class="hestia-nav__actions">
        <a href="#tarifs" class="hestia-btn hestia-btn--ghost hestia-btn--sm">Connexion</a>
        <a href="#cta" class="hestia-btn hestia-btn--primary hestia-btn--sm">Rejoindre la liste</a>
        <button
          type="button"
          class="hestia-nav__toggle"
          :aria-expanded="isOpen"
          aria-controls="hestia-mobile-menu"
          @click="isOpen = !isOpen"
        >
          <span class="sr-only">Menu</span>
          <X v-if="isOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <div
      v-if="isOpen"
      id="hestia-mobile-menu"
      class="hestia-container hestia-nav__mobile"
    >
      <a
        v-for="link in hestiaNavLinks"
        :key="link.href"
        :href="link.href"
        class="hestia-nav__mobile-link"
        @click="closeMenu"
      >
        {{ link.label }}
      </a>
      <a href="#cta" class="hestia-btn hestia-btn--primary" @click="closeMenu">Rejoindre la liste</a>
    </div>
  </header>
</template>
