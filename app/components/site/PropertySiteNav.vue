<script setup lang="ts">
import { Menu, X } from "@lucide/vue"
import type { SiteNavLink } from "../../data/site-ui"

const props = defineProps<{
  links: SiteNavLink[]
  navAriaLabel: string
  openMenuLabel: string
  closeMenuLabel: string
  bookLabel: string
}>()

const emit = defineEmits<{
  book: []
}>()

const menuOpen = ref(false)
const teleportTarget = ref("#site-header-root")

onMounted(() => {
  if (typeof document !== "undefined" && !document.querySelector("#site-header-root")) {
    teleportTarget.value = "body"
  }
})

function closeMenu() {
  menuOpen.value = false
}

function onNavClick() {
  closeMenu()
}

function onBookClick() {
  closeMenu()
  emit("book")
}

watch(menuOpen, (open) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle("site-nav-menu-open", open)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.classList.remove("site-nav-menu-open")
  }
})
</script>

<template>
  <div class="property-site-nav">
    <nav class="property-site-nav__desktop" :aria-label="props.navAriaLabel">
      <a
        v-for="link in props.links"
        :key="link.href"
        :href="link.href"
        class="property-site-nav__link"
        @click="onNavClick"
      >
        {{ link.label }}
      </a>
      <button type="button" class="booking-button property-site-nav__cta" @click="onBookClick">
        {{ props.bookLabel }}
      </button>
    </nav>

    <button
      type="button"
      class="property-site-nav__toggle"
      :aria-expanded="menuOpen"
      :aria-label="menuOpen ? props.closeMenuLabel : props.openMenuLabel"
      @click="menuOpen = !menuOpen"
    >
      <X v-if="menuOpen" :size="20" stroke-width="2.2" aria-hidden="true" />
      <Menu v-else :size="20" stroke-width="2.2" aria-hidden="true" />
    </button>

    <Teleport :to="teleportTarget">
      <Transition name="property-site-nav-mobile">
        <div v-if="menuOpen" class="property-site-nav__mobile-shell">
          <nav class="property-site-nav__mobile" :aria-label="props.navAriaLabel">
            <a
              v-for="link in props.links"
              :key="`mobile-${link.href}`"
              :href="link.href"
              class="property-site-nav__mobile-link"
              @click="onNavClick"
            >
              {{ link.label }}
            </a>
            <button type="button" class="booking-button property-site-nav__cta property-site-nav__cta--mobile" @click="onBookClick">
              {{ props.bookLabel }}
            </button>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.property-site-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 1 auto;
  min-width: 0;
}

.property-site-nav__desktop {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-width: 0;
  max-width: 100%;
  padding: 0.2rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(74, 58, 43, 0.08);
  box-shadow: 0 6px 18px rgba(42, 34, 28, 0.05);
}

.property-site-nav__link {
  flex-shrink: 0;
  padding: 0.42rem 0.72rem;
  border-radius: 999px;
  color: var(--h-ink-soft, #5c5046);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.property-site-nav__link:hover {
  color: var(--h-ink, #2a221c);
  background: rgba(255, 255, 255, 0.82);
}

.property-site-nav__cta {
  flex-shrink: 0;
  margin-left: 0.15rem;
  min-width: 0;
  min-height: 2.15rem;
  padding: 0.48rem 0.9rem;
  border-radius: var(--h-radius-pill, 999px);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.property-site-nav__cta:focus-visible,
.property-site-nav__link:focus-visible,
.property-site-nav__toggle:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--h-accent-deep, #0d9b6e) 55%, white);
  outline-offset: 2px;
}

.property-site-nav__toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  padding: 0;
  border: 1px solid var(--h-border-strong, rgba(74, 58, 43, 0.14));
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--h-ink, #2a221c);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(42, 34, 28, 0.08);
}

.property-site-nav__mobile-shell {
  width: 100%;
  border-top: 1px solid rgba(74, 58, 43, 0.08);
  background: rgba(247, 244, 241, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 14px 30px rgba(42, 34, 28, 0.08);
}

.property-site-nav__mobile {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto;
  padding: 0.65rem 0 0.9rem;
}

.property-site-nav__mobile-link {
  display: block;
  padding: 0.72rem 0.2rem;
  border-radius: 12px;
  color: var(--h-ink, #2a221c);
  font-size: 0.96rem;
  font-weight: 600;
  text-decoration: none;
}

.property-site-nav__mobile-link:hover {
  color: var(--h-accent-deep, #0d9b6e);
}

.property-site-nav__cta--mobile {
  align-self: flex-start;
  margin-top: 0.55rem;
  margin-left: 0;
}

.property-site-nav-mobile-enter-active,
.property-site-nav-mobile-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.property-site-nav-mobile-enter-from,
.property-site-nav-mobile-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1100px) {
  .property-site-nav__desktop {
    gap: 0.15rem;
    padding: 0.16rem;
  }

  .property-site-nav__link {
    padding: 0.38rem 0.55rem;
    font-size: 0.74rem;
  }

  .property-site-nav__cta {
    padding: 0.44rem 0.72rem;
    font-size: 0.74rem;
  }
}

@media (max-width: 900px) {
  .property-site-nav {
    flex: 0 0 auto;
    justify-content: flex-end;
  }

  .property-site-nav__desktop {
    display: none;
  }

  .property-site-nav__toggle {
    display: inline-flex;
  }
}
</style>
