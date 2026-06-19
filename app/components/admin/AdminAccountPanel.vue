<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import {
  findAdminAccountView,
  isAdminAccountViewId,
  type AdminAccountViewId
} from "../../data/admin-account-sections"
import AdminAccountDeleteModal from "./AdminAccountDeleteModal.vue"
import AdminAccountEditor from "./AdminAccountEditor.vue"
import AdminAccountNav from "./AdminAccountNav.vue"
import AdminAccountPlansPanel from "./AdminAccountPlansPanel.vue"
import AdminCohostsPanel from "./AdminCohostsPanel.vue"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  slug: string
  showCohosts?: boolean
  showPlans?: boolean
}>()

const route = useRoute()
const router = useRouter()
const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const deleteModalOpen = ref(false)
const deleteConfirmSlug = ref("")
const deleteError = ref<string | null>(null)
const deleting = ref(false)

const activeView = computed<AdminAccountViewId>(() => {
  const raw = route.query.account_view
  const value = Array.isArray(raw) ? raw[0] : raw

  if (value === "cohosts" && props.showCohosts) {
    return "cohosts"
  }

  if (value === "plans" && props.showPlans) {
    return "plans"
  }

  return "settings"
})

const activeViewMeta = computed(() => findAdminAccountView(activeView.value, locale.value))

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

function selectAccountView(view: AdminAccountViewId) {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      section: "account",
      account_view: view
    }
  })
}

function openDeleteModal() {
  deleteError.value = null
  deleteConfirmSlug.value = ""
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (deleting.value) {
    return
  }

  deleteModalOpen.value = false
  deleteConfirmSlug.value = ""
  deleteError.value = null
}

async function onDeleteAccount() {
  deleteError.value = null

  if (deleteConfirmSlug.value.trim().toLowerCase() !== props.slug.trim().toLowerCase()) {
    deleteError.value = adminUiFormat(ext.value.account.deleteSlugMismatch, { slug: props.slug })
    return
  }

  deleting.value = true

  try {
    const headers = await authHeaders()

    await $fetch(`/api/admin/${props.slug}/account`, {
      method: "DELETE",
      headers,
      body: { confirm_slug: deleteConfirmSlug.value.trim() }
    })

    const supabase = useSupabaseClient()

    await supabase.auth.signOut()
    deleteModalOpen.value = false
    await navigateTo("/")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    deleteError.value = e.data?.message || e.message || ext.value.account.deleteFailed
  } finally {
    deleting.value = false
  }
}

watch(
  () => route.query.account_view,
  (raw) => {
    const value = Array.isArray(raw) ? raw[0] : raw

    if (value === "cohosts" && !props.showCohosts) {
      selectAccountView("settings")
      return
    }

    if (value === "plans" && !props.showPlans) {
      selectAccountView("settings")
      return
    }

    if (value && !isAdminAccountViewId(value)) {
      selectAccountView("settings")
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-account-panel admin-gallery-editor">
    <div class="admin-gallery-editor__layout">
      <AdminAccountNav
        :active-view="activeView"
        :show-cohosts="showCohosts"
        :show-plans="showPlans"
        @select="selectAccountView"
      />

      <main class="admin-gallery-editor__main">
        <article class="admin-gallery-editor__detail">
          <header
            v-if="activeView === 'settings' || activeView === 'plans'"
            class="admin-gallery-editor__detail-head"
          >
            <div class="admin-gallery-editor__detail-copy">
              <h3>{{ activeViewMeta.title }}</h3>
              <p class="admin-gallery-editor__detail-hint">
                {{
                  activeView === 'settings'
                    ? ext.account.settingsSubtitle
                    : activeViewMeta.lead
                }}
              </p>
            </div>
          </header>

          <AdminAccountEditor
            v-if="activeView === 'settings'"
            :slug="slug"
            form-id="admin-account-form"
            :show-actions="true"
            @request-delete="openDeleteModal"
          />

          <AdminAccountPlansPanel v-else-if="activeView === 'plans'" :slug="slug" />

          <AdminCohostsPanel v-else-if="activeView === 'cohosts'" :slug="slug" />
        </article>
      </main>
    </div>

    <AdminAccountDeleteModal
      :open="deleteModalOpen"
      :slug="slug"
      :loading="deleting"
      :error="deleteError"
      :confirm-slug="deleteConfirmSlug"
      @update:confirm-slug="deleteConfirmSlug = $event"
      @cancel="closeDeleteModal"
      @confirm="onDeleteAccount"
    />
  </div>
</template>
