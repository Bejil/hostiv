import type { PropertyAdminRecord } from "../types/property-admin"
import { clonePropertyAdminRecord, normalizePropertyAdminRecord } from "../utils/normalize-property-admin"
import { useSupabaseClient } from "./useSupabaseClient"

export function usePropertyAdmin(slug: Ref<string> | string) {
  const slugRef = computed(() => {
    const value = typeof slug === "string" ? slug : slug.value

    return String(value || "").replace(/^\/+|\/+$/g, "")
  })

  const authenticated = ref(false)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const site = ref<PropertyAdminRecord | null>(null)
  const userEmail = ref<string | null>(null)
  let authListenerReady = false
  let fetchGeneration = 0

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      return {}
    }

    return { Authorization: `Bearer ${token}` }
  }

  async function login(email: string, password: string) {
    error.value = null
    loading.value = true

    try {
      const supabase = useSupabaseClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      userEmail.value = data.user?.email ?? null
      await fetchSite({ forceLoading: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connexion impossible."

      error.value = message
      authenticated.value = false
      site.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    const supabase = useSupabaseClient()

    await supabase.auth.signOut()
    authenticated.value = false
    site.value = null
    userEmail.value = null
    loading.value = false
    error.value = null
  }

  async function fetchSite(options: { forceLoading?: boolean } = {}) {
    const generation = ++fetchGeneration

    if (options.forceLoading || !site.value) {
      loading.value = true
    }

    error.value = null

    try {
      const headers = await authHeaders()

      if (!headers.Authorization) {
        authenticated.value = false
        site.value = null
        return
      }

      const data = await $fetch<PropertyAdminRecord>(`/api/admin/${slugRef.value}/site`, {
        headers
      })

      if (generation !== fetchGeneration) {
        return
      }

      site.value = normalizePropertyAdminRecord(data)
      authenticated.value = true
      error.value = null
      loading.value = false

      const supabase = useSupabaseClient()
      const { data: sessionData } = await supabase.auth.getSession()

      if (generation !== fetchGeneration) {
        return
      }

      userEmail.value = sessionData.session?.user.email ?? userEmail.value
    } catch (err: unknown) {
      if (generation !== fetchGeneration) {
        return
      }

      const e = err as { statusCode?: number; data?: { message?: string }; message?: string }

      authenticated.value = false
      site.value = null

      if (e.statusCode === 401 || e.statusCode === 403) {
        error.value = e.data?.message || e.message || "Accès refusé."
        return
      }

      if (e.statusCode === 404) {
        showError({
          statusCode: 404,
          statusMessage: "Ce backoffice n’existe pas.",
          fatal: true
        })
        return
      }

      error.value = e.data?.message || e.message || "Impossible de charger le site."
    } finally {
      if (generation === fetchGeneration) {
        loading.value = false
      }
    }
  }

  async function bootstrap() {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        authenticated.value = false
        site.value = null
        userEmail.value = null
        return
      }

      userEmail.value = session.user.email ?? null
      await fetchSite({ forceLoading: true })
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : "Impossible d’initialiser l’administration."
      authenticated.value = false
      site.value = null
    } finally {
      loading.value = false
    }
  }

  async function saveSite(payload: PropertyAdminRecord) {
    error.value = null
    saving.value = true

    try {
      const heroTitle = payload.content.copy.hero?.title ?? ""
      const hostCaption = payload.content.copy.host?.caption ?? ""

      const synced = normalizePropertyAdminRecord({
        ...payload,
        hero_image_alt: heroTitle,
        content: {
          ...payload.content,
          copy: {
            ...payload.content.copy,
            header: {
              ...payload.content.copy.header,
              brand_name: payload.brand_name,
              brand_meta: payload.brand_meta,
              logo_alt: payload.brand_name
            },
            hero: {
              ...payload.content.copy.hero,
              image_alt: heroTitle
            },
            host: {
              ...payload.content.copy.host,
              image_alt: hostCaption
            }
          }
        }
      })

      const headers = await authHeaders()

      site.value = normalizePropertyAdminRecord(
        await $fetch<PropertyAdminRecord>(`/api/admin/${slugRef.value}/site`, {
          method: "PUT",
          headers,
          body: synced
        })
      )

      return true
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }

      error.value = e.data?.message || e.message || "Enregistrement impossible."
      return false
    } finally {
      saving.value = false
    }
  }

  async function uploadAsset(file: File, path: string) {
    const form = new FormData()

    form.append("file", file)
    form.append("path", path)

    const headers = await authHeaders()

    return await $fetch<{ path: string; publicUrl: string }>(
      `/api/admin/${slugRef.value}/upload`,
      {
        method: "POST",
        headers,
        body: form
      }
    )
  }

  function initAuthListener() {
    if (import.meta.server || authListenerReady) {
      return () => {}
    }

    authListenerReady = true
    const supabase = useSupabaseClient()

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        authenticated.value = false
        site.value = null
        userEmail.value = null
        loading.value = false
        error.value = null
        return
      }

      userEmail.value = session.user.email ?? null

      if (event === "SIGNED_IN") {
        void fetchSite({ forceLoading: true })
      }
    })

    return () => data.subscription.unsubscribe()
  }

  return {
    slug: slugRef,
    authenticated,
    loading,
    saving,
    error,
    site,
    userEmail,
    login,
    logout,
    fetchSite,
    bootstrap,
    saveSite,
    uploadAsset,
    initAuthListener,
    clonePropertyAdminRecord
  }
}
