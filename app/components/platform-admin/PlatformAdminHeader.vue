<script setup lang="ts">
import AdminIcon from "../admin/AdminIcon.vue"
import HostivLocaleSelect from "../hostiv/HostivLocaleSelect.vue"

defineProps<{
  authenticated: boolean
  userEmail: string | null
  userFullName: string | null
}>()

const emit = defineEmits<{
  refresh: []
  logout: []
}>()

const { ui } = usePlatformAdminUi()
const { homePath } = useHostivLocale()

const headerRef = ref<HTMLElement | null>(null)
const accountMenuOpen = ref(false)
const accountMenuRef = ref<HTMLElement | null>(null)

let closeAccountMenuTimer: ReturnType<typeof setTimeout> | null = null

useAdminHeaderStickyTop(headerRef)

function openAccountMenu() {
  if (closeAccountMenuTimer) {
    clearTimeout(closeAccountMenuTimer)
    closeAccountMenuTimer = null
  }

  accountMenuOpen.value = true
}

function closeAccountMenuSoon() {
  if (closeAccountMenuTimer) {
    clearTimeout(closeAccountMenuTimer)
  }

  closeAccountMenuTimer = setTimeout(() => {
    accountMenuOpen.value = false
    closeAccountMenuTimer = null
  }, 140)
}

function onRefresh() {
  accountMenuOpen.value = false
  emit("refresh")
}

function onLogout() {
  accountMenuOpen.value = false
  emit("logout")
}
</script>

<template>
  <header ref="headerRef" class="admin-page__header">
    <div class="admin-page__header-inner">
      <div class="admin-page__brand">
        <NuxtLink
          :to="homePath"
          class="admin-page__logo admin-page__logo-link"
          :aria-label="ui.header.logoHome"
          :title="ui.header.logoHome"
        >
          <img
            src="/hostiv/logo-mark.svg"
            alt=""
            width="40"
            height="40"
            class="admin-page__logo-img"
          />
        </NuxtLink>
        <div>
          <h1 class="admin-page__title">{{ ui.shell.title }}</h1>
          <p class="admin-page__meta">
            <span class="admin-page__slug">/admin</span>
            <span>{{ ui.header.platformLabel }}</span>
          </p>
        </div>
      </div>

      <div class="admin-page__actions">
        <template v-if="authenticated">
          <div
            ref="accountMenuRef"
            class="admin-account-menu"
            @mouseenter="openAccountMenu"
            @mouseleave="closeAccountMenuSoon"
          >
            <button
              type="button"
              class="hostiv-btn hostiv-btn--ghost hostiv-btn--sm"
              :aria-expanded="accountMenuOpen"
              aria-haspopup="menu"
              @focus="openAccountMenu"
              @click.stop="accountMenuOpen = !accountMenuOpen"
            >
              <AdminIcon name="user" :size="16" />
              <span class="hostiv-btn__label">{{ ui.header.account }}</span>
            </button>

            <div
              v-if="accountMenuOpen"
              class="admin-account-menu__dropdown"
              role="menu"
              @mouseenter="openAccountMenu"
              @mouseleave="closeAccountMenuSoon"
            >
              <p v-if="userFullName || userEmail" class="admin-account-menu__identity">
                <strong>{{ userFullName || userEmail }}</strong>
                <span v-if="userFullName && userEmail">{{ userEmail }}</span>
              </p>
              <button type="button" class="admin-account-menu__item" role="menuitem" @click="onRefresh">
                <AdminIcon name="clock" :size="14" />
                {{ ui.header.refresh }}
              </button>
              <button
                type="button"
                class="admin-account-menu__item admin-account-menu__item--danger"
                role="menuitem"
                @click="onLogout"
              >
                <AdminIcon name="logout" :size="14" />
                {{ ui.header.logout }}
              </button>
            </div>
          </div>
        </template>

        <HostivLocaleSelect class="admin-page__locale" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-account-menu__identity {
  margin: 0;
  padding: 0.35rem 0.55rem 0.5rem;
  border-bottom: 1px solid var(--admin-border);
  color: var(--admin-muted);
  font-size: 0.75rem;
  line-height: 1.35;
}

.admin-account-menu__identity strong {
  display: block;
  color: var(--admin-ink);
  font-size: 0.8125rem;
}

.admin-account-menu__identity span {
  display: block;
  margin-top: 0.1rem;
  word-break: break-all;
}
</style>
