import { getPlatformAdminUi } from "../data/platform-admin-ui"
import type {
  PlatformAdminAlertRow,
  PlatformAdminDashboardStats,
  PlatformAdminGuestReviewRow,
  PlatformAdminMemberRow,
  PlatformAdminReservationRow,
  PlatformAdminReservationsSummary,
  PlatformAdminRevenueBreakdown,
  PlatformAdminSectionId,
  PlatformAdminSignupRow,
  PlatformAdminSiteRow
} from "../types/platform-admin"
import { useSupabaseClient } from "./useSupabaseClient"

const SESSION_READ_TIMEOUT_MS = 8000

export function usePlatformAdminUi() {
  const { locale } = useHostivLocale()

  const ui = computed(() => getPlatformAdminUi(locale.value))

  function formatDate(iso: string | null | undefined) {
    if (!iso?.trim()) {
      return "—"
    }

    const date = new Date(iso)

    if (Number.isNaN(date.getTime())) {
      return "—"
    }

    return date.toLocaleDateString(locale.value === "en" ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  function formatEuro(amount: number) {
    return new Intl.NumberFormat(locale.value === "en" ? "en-GB" : "fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount)
  }

  return { ui, locale, formatDate, formatEuro }
}

function bearerHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}

export function usePlatformAdmin() {
  const authenticated = ref(false)
  const loading = ref(true)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const userEmail = ref<string | null>(null)
  const userFullName = ref<string | null>(null)
  const activeSection = ref<PlatformAdminSectionId>("dashboard")

  let authListenerReady = false
  let bootstrapDone = false

  async function readAccessToken() {
    const supabase = useSupabaseClient()

    try {
      const { data } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("SESSION_TIMEOUT")), SESSION_READ_TIMEOUT_MS)
        })
      ])

      return data.session?.access_token ?? null
    } catch {
      await supabase.auth.signOut()
      return null
    }
  }

  async function authHeaders(accessToken?: string | null) {
    const token = accessToken?.trim() || (await readAccessToken())

    if (!token) {
      return {}
    }

    return bearerHeaders(token)
  }

  async function verifyAccess(accessToken?: string | null) {
    const headers = accessToken?.trim()
      ? bearerHeaders(accessToken.trim())
      : await authHeaders()

    if (!headers.Authorization) {
      authenticated.value = false
      userEmail.value = null
      userFullName.value = null

      return false
    }

    try {
      const me = await $fetch<{ email: string; full_name: string | null }>("/api/platform-admin/me", {
        headers
      })

      authenticated.value = true
      userEmail.value = me.email
      userFullName.value = me.full_name
      error.value = null

      return true
    } catch (cause) {
      authenticated.value = false
      userEmail.value = null
      userFullName.value = null

      const status = (cause as { statusCode?: number })?.statusCode

      if (status === 403) {
        error.value = "Accès réservé aux administrateurs Hostiv."
      } else if (status === 503) {
        error.value = "Admin plateforme non configuré (HOSTIV_PLATFORM_ADMIN_EMAILS)."
      } else if (status !== 401) {
        error.value = "Impossible de vérifier l’accès administrateur."
      }

      return false
    }
  }

  function scheduleVerifyAccess(accessToken?: string | null) {
    queueMicrotask(() => {
      void (async () => {
        loading.value = true

        try {
          const ok = await verifyAccess(accessToken)

          if (!ok && accessToken) {
            await useSupabaseClient().auth.signOut()
          }
        } finally {
          loading.value = false
        }
      })()
    })
  }

  async function login(email: string, password: string) {
    error.value = null
    submitting.value = true

    try {
      const supabase = useSupabaseClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (signInError) {
        error.value =
          signInError.message.toLowerCase().includes("invalid login credentials")
            ? "E-mail ou mot de passe incorrect."
            : signInError.message
        return false
      }

      const ok = await verifyAccess(data.session?.access_token ?? null)

      if (!ok) {
        await supabase.auth.signOut()
      }

      return ok
    } finally {
      submitting.value = false
    }
  }

  async function logout() {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    authenticated.value = false
    userEmail.value = null
    userFullName.value = null
    loading.value = false
  }

  async function bootstrap() {
    loading.value = true
    error.value = null

    try {
      const token = await readAccessToken()

      if (!token) {
        authenticated.value = false
        userEmail.value = null
        userFullName.value = null
        return
      }

      await verifyAccess(token)
    } finally {
      loading.value = false
      bootstrapDone = true
    }
  }

  function initAuthListener() {
    if (authListenerReady || import.meta.server) {
      return
    }

    authListenerReady = true
    const supabase = useSupabaseClient()

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        return
      }

      if (event === "TOKEN_REFRESHED") {
        if (session?.user.email) {
          userEmail.value = session.user.email
        }

        return
      }

      if (event === "SIGNED_OUT") {
        authenticated.value = false
        userEmail.value = null
        userFullName.value = null
        loading.value = false
        return
      }

      if (!bootstrapDone) {
        return
      }

      if (event === "SIGNED_IN" && session?.access_token) {
        userEmail.value = session.user.email ?? null
        scheduleVerifyAccess(session.access_token)
      }
    })
  }

  async function platformRequest<T>(
    path: string,
    options: {
      method?: "GET" | "DELETE" | "PATCH" | "POST"
      body?: unknown
    } = {}
  ): Promise<T> {
    const headers = await authHeaders()
    const method = options.method ?? "GET"

    if (method === "GET") {
      return $fetch<T>(path, { headers })
    }

    return $fetch<T>(path, {
      method,
      headers,
      body: options.body
    })
  }

  async function platformFetch<T>(path: string): Promise<T> {
    return platformRequest<T>(path)
  }

  return {
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
  }
}

export function usePlatformAdminDataLoader<T>(
  platformFetch: (path: string) => Promise<unknown>,
  endpoint: string
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)

  async function load() {
    loading.value = true
    error.value = null

    try {
      data.value = (await platformFetch(endpoint)) as T
    } catch {
      error.value = "Impossible de charger les données."
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, load }
}

export type PlatformAdminReservationsPayload = {
  summary: PlatformAdminReservationsSummary
  rows: PlatformAdminReservationRow[]
}

export type {
  PlatformAdminDashboardStats,
  PlatformAdminSiteRow,
  PlatformAdminMemberRow,
  PlatformAdminRevenueBreakdown,
  PlatformAdminSignupRow,
  PlatformAdminGuestReviewRow,
  PlatformAdminAlertRow
}
