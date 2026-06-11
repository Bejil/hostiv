<script setup lang="ts">
import { Menu, X } from "@lucide/vue"

const route = useRoute()
const { scrollToTop } = useHostivScrollToTop()
const { openLogin, openSignup } = useHostivAccountModal()
const { ready, isLoggedIn, adminPath, sitePath, logout } = useHostivNavAuth()
const { landing, homePath } = useHostivLocale()

const isOpen = ref(false)

function closeMenu() {
  isOpen.value = false
}

function onLogoClick(event: MouseEvent) {
  closeMenu()

  if (route.path === homePath.value) {
    event.preventDefault()
    scrollToTop()
  }
}

function onLogin() {
  closeMenu()
  openLogin()
}

function onSignup() {
  closeMenu()
  openSignup()
}

async function onLogout() {
  closeMenu()
  await logout()
  await navigateTo(homePath.value)
}
</script>

<template>
  <header class="hostiv-nav">
    <div class="hostiv-container hostiv-nav__inner">
      <NuxtLink :to="homePath" class="hostiv-logo" @click="onLogoClick">
        <span class="hostiv-logo__mark" aria-hidden="true">
          <img src="/hostiv/logo-mark.svg" alt="" width="36" height="36" class="hostiv-logo__mark-img" />
        </span>
        <span class="hostiv-logo__text">Host<span class="hostiv-logo__accent">iv</span></span>
      </NuxtLink>

      <div class="hostiv-nav__actions">
        <HostivLocaleSelect class="hostiv-nav__locale" />

        <template v-if="ready && isLoggedIn">
          <NuxtLink
            v-if="sitePath"
            :to="sitePath"
            class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ landing.navUi.mySite }}
          </NuxtLink>
          <NuxtLink
            v-if="adminPath"
            :to="adminPath"
            class="hostiv-btn hostiv-btn--primary hostiv-btn--sm"
          >
            {{ landing.navUi.myAdmin }}
          </NuxtLink>
          <button type="button" class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm" @click="onLogout">
            {{ landing.navUi.logout }}
          </button>
        </template>
        <template v-else-if="ready">
          <button type="button" class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm" @click="onLogin">
            {{ landing.navUi.login }}
          </button>
          <button type="button" class="hostiv-btn hostiv-btn--primary hostiv-btn--sm" @click="onSignup">
            {{ landing.navUi.signup }}
          </button>
        </template>
        <button
          type="button"
          class="hostiv-nav__toggle"
          :aria-expanded="isOpen"
          aria-controls="hostiv-mobile-menu"
          @click="isOpen = !isOpen"
        >
          <span class="sr-only">{{ landing.navUi.menu }}</span>
          <X v-if="isOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <div v-if="isOpen" id="hostiv-mobile-menu" class="hostiv-container hostiv-nav__mobile">
      <a
        v-for="link in landing.navLinks"
        :key="link.href"
        :href="link.href"
        class="hostiv-nav__mobile-link"
        @click="closeMenu"
      >
        {{ link.label }}
      </a>
      <template v-if="isLoggedIn">
        <NuxtLink
          v-if="sitePath"
          :to="sitePath"
          class="hostiv-btn hostiv-btn--ghost"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeMenu"
        >
          {{ landing.navUi.mySite }}
        </NuxtLink>
        <NuxtLink v-if="adminPath" :to="adminPath" class="hostiv-btn hostiv-btn--primary" @click="closeMenu">
          {{ landing.navUi.myAdmin }}
        </NuxtLink>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="onLogout">
          {{ landing.navUi.logout }}
        </button>
      </template>
      <template v-else>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="onLogin">
          {{ landing.navUi.login }}
        </button>
        <button type="button" class="hostiv-btn hostiv-btn--primary" @click="onSignup">
          {{ landing.navUi.signup }}
        </button>
      </template>
    </div>
  </header>
</template>
