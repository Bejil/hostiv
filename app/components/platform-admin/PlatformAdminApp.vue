<script setup lang="ts">
import AdminAlert from "../admin/AdminAlert.vue"
import HostivFooter from "../hostiv/HostivFooter.vue"
import PlatformAdminDashboardPanel from "./PlatformAdminDashboardPanel.vue"
import PlatformAdminHeader from "./PlatformAdminHeader.vue"
import PlatformAdminLoginGate from "./PlatformAdminLoginGate.vue"
import PlatformAdminMembersPanel from "./PlatformAdminMembersPanel.vue"
import PlatformAdminNav from "./PlatformAdminNav.vue"
import PlatformAdminPromoCodesPanel from "./PlatformAdminPromoCodesPanel.vue"
import PlatformAdminRevenuePanel from "./PlatformAdminRevenuePanel.vue"
import PlatformAdminSitesPanel from "./PlatformAdminSitesPanel.vue"
import type { PlatformAdminSectionId } from "../../types/platform-admin"

const {
  authenticated,
  loading,
  submitting,
  error,
  userEmail,
  userFullName,
  activeSection,
  login,
  logout,
  bootstrap,
  initAuthListener,
  platformFetch,
  platformRequest
} = usePlatformAdmin()

const loginEmail = ref("")
const loginPassword = ref("")
const refreshKey = ref(0)

const dashboardRef = ref<{ load: () => Promise<void> } | null>(null)
const sitesRef = ref<{ load: () => Promise<void> } | null>(null)
const membersRef = ref<{ load: () => Promise<void> } | null>(null)
const promoCodesRef = ref<{ load: () => Promise<void> } | null>(null)
const revenueRef = ref<{ load: () => Promise<void> } | null>(null)

onMounted(() => {
  void (async () => {
    await bootstrap()
    initAuthListener()

    try {
      const config = await $fetch<{ configured: boolean }>("/api/platform-admin/config")

      if (!config.configured) {
        error.value = "Admin plateforme non configuré (HOSTIV_PLATFORM_ADMIN_EMAILS)."
      }
    } catch {
      // ignore
    }
  })()
})

async function onLoginSubmit() {
  await login(loginEmail.value, loginPassword.value)
}

function onSelectSection(section: PlatformAdminSectionId) {
  activeSection.value = section
}

async function refreshCurrentPanel() {
  refreshKey.value += 1

  const refMap = {
    dashboard: dashboardRef,
    sites: sitesRef,
    members: membersRef,
    "promo-codes": promoCodesRef,
    revenue: revenueRef
  } as const

  await refMap[activeSection.value].value?.load?.()
}
</script>

<template>
  <UApp>
    <div class="admin-page platform-admin-page">
      <PlatformAdminHeader
        :authenticated="authenticated"
        :user-email="userEmail"
        :user-full-name="userFullName"
        @refresh="refreshCurrentPanel"
        @logout="logout"
      />

      <PlatformAdminLoginGate
        v-if="!authenticated"
        v-model:email="loginEmail"
        v-model:password="loginPassword"
        :checking="loading"
        :submitting="submitting"
        :error="error"
        @submit="onLoginSubmit"
      />

      <main v-else class="admin-main">
        <AdminAlert v-if="error" variant="error" :message="error" />

        <PlatformAdminNav :active-section="activeSection" @select="onSelectSection" />

        <div class="platform-admin-panels">
          <PlatformAdminDashboardPanel
            v-if="activeSection === 'dashboard'"
            :key="`dashboard-${refreshKey}`"
            ref="dashboardRef"
            :platform-fetch="platformFetch"
          />
          <PlatformAdminSitesPanel
            v-if="activeSection === 'sites'"
            :key="`sites-${refreshKey}`"
            ref="sitesRef"
            :platform-fetch="platformFetch"
            :platform-request="platformRequest"
          />
          <PlatformAdminMembersPanel
            v-if="activeSection === 'members'"
            :key="`members-${refreshKey}`"
            ref="membersRef"
            :platform-fetch="platformFetch"
            :platform-request="platformRequest"
          />
          <PlatformAdminPromoCodesPanel
            v-if="activeSection === 'promo-codes'"
            :key="`promo-codes-${refreshKey}`"
            ref="promoCodesRef"
            :platform-fetch="platformFetch"
            :platform-request="platformRequest"
          />
          <PlatformAdminRevenuePanel
            v-if="activeSection === 'revenue'"
            :key="`revenue-${refreshKey}`"
            ref="revenueRef"
            :platform-fetch="platformFetch"
          />
        </div>
      </main>

      <div class="admin-page__bottom">
        <HostivFooter />
      </div>
    </div>
  </UApp>
</template>
