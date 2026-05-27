<script setup lang="ts">
import { Menu, X } from "@lucide/vue"
import { hostivNavLinks } from "../../data/hostivLanding"

const route = useRoute()
const { scrollToTop } = useHostivScrollToTop()
const { openLogin, openSignup } = useHostivAccountModal()
const { ready, isLoggedIn, adminPath, accountPath, sitePath, logout } = useHostivNavAuth()
const isOpen = ref(false)

function closeMenu() {
  isOpen.value = false
}

function onLogoClick(event: MouseEvent) {
  closeMenu()

  if (route.path === "/") {
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
}
</script>

<template>
  <header class="hostiv-nav">
    <div class="hostiv-container hostiv-nav__inner">
      <NuxtLink to="/" class="hostiv-logo" @click="onLogoClick">
        <span class="hostiv-logo__mark" aria-hidden="true">
          <img src="/hostiv/logo-mark.svg" alt="" width="36" height="36" class="hostiv-logo__mark-img" />
        </span>
        <span class="hostiv-logo__text">Host<span class="hostiv-logo__accent">iv</span></span>
      </NuxtLink>

      <div class="hostiv-nav__actions">
        <template v-if="ready && isLoggedIn">
          <NuxtLink
            v-if="sitePath"
            :to="sitePath"
            class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mon site
          </NuxtLink>
          <NuxtLink
            v-if="accountPath"
            :to="accountPath"
            class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm"
          >
            Mon compte
          </NuxtLink>
          <NuxtLink
            v-if="adminPath"
            :to="adminPath"
            class="hostiv-btn hostiv-btn--primary hostiv-btn--sm"
          >
            Mon backoffice
          </NuxtLink>
          <button type="button" class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm" @click="onLogout">
            Déconnexion
          </button>
        </template>
        <template v-else-if="ready">
          <button type="button" class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm" @click="onLogin">
            Connexion
          </button>
          <button type="button" class="hostiv-btn hostiv-btn--primary hostiv-btn--sm" @click="onSignup">
            Commencer
          </button>
        </template>
        <button
          type="button"
          class="hostiv-nav__toggle"
          :aria-expanded="isOpen"
          aria-controls="hostiv-mobile-menu"
          @click="isOpen = !isOpen"
        >
          <span class="sr-only">Menu</span>
          <X v-if="isOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <div v-if="isOpen" id="hostiv-mobile-menu" class="hostiv-container hostiv-nav__mobile">
      <a
        v-for="link in hostivNavLinks"
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
          Mon site
        </NuxtLink>
        <NuxtLink
          v-if="accountPath"
          :to="accountPath"
          class="hostiv-btn hostiv-btn--ghost"
          @click="closeMenu"
        >
          Mon compte
        </NuxtLink>
        <NuxtLink v-if="adminPath" :to="adminPath" class="hostiv-btn hostiv-btn--primary" @click="closeMenu">
          Mon backoffice
        </NuxtLink>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="onLogout">Déconnexion</button>
      </template>
      <template v-else>
        <button type="button" class="hostiv-btn hostiv-btn--ghost" @click="onLogin">Connexion</button>
        <button type="button" class="hostiv-btn hostiv-btn--primary" @click="onSignup">Commencer</button>
      </template>
    </div>
  </header>
</template>
