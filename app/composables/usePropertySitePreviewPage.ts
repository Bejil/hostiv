import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteRecord } from "../types/property-site"
import { mapAdminRecordToSitePreview } from "../utils/map-admin-site-preview"
import { usePropertyAdmin } from "./usePropertyAdmin"

export type PropertySitePreviewState = "loading" | "login" | "ready" | "error"

export function usePropertySitePreviewPage() {
  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const {
    authenticated,
    loading: authLoading,
    error: authError,
    userEmail,
    login,
    logout,
    bootstrap,
    initAuthListener
  } = usePropertyAdmin(slug)

  const site = ref<PropertySiteRecord | null>(null)
  const loadError = ref<string | null>(null)
  const pageState = ref<PropertySitePreviewState>("loading")

  async function loadPreviewSite() {
    loadError.value = null

    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      site.value = null
      return
    }

    const admin = await $fetch<PropertyAdminRecord>(`/api/admin/${slug.value}/site`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    site.value = mapAdminRecordToSitePreview(admin)
  }

  async function initPreview() {
    pageState.value = "loading"
    loadError.value = null
    site.value = null

    try {
      await bootstrap()

      if (!authenticated.value) {
        pageState.value = "login"
        return
      }

      await loadPreviewSite()
      pageState.value = "ready"
    } catch (err: unknown) {
      const e = err as { statusCode?: number; data?: { message?: string }; message?: string }

      if (e.statusCode === 401 || e.statusCode === 403) {
        pageState.value = "login"
        loadError.value = e.data?.message || e.message || "Connexion requise."
        return
      }

      pageState.value = "error"
      loadError.value = e.data?.message || e.message || "Impossible de charger l’aperçu."
    }
  }

  onMounted(() => {
    const unsubscribeAuth = initAuthListener()
    void initPreview()

    onUnmounted(() => {
      unsubscribeAuth()
    })
  })

  async function onLogin(email: string, password: string) {
    await login(email, password)

    if (!authenticated.value) {
      pageState.value = "login"
      return
    }

    await initPreview()
  }

  return {
    slug,
    site,
    pageState,
    loadError,
    authError,
    authLoading,
    userEmail,
    onLogin,
    logout,
    retry: initPreview
  }
}
