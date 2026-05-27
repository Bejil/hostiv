import type { Session } from "@supabase/supabase-js"

function slugFromUserMetadata(session: Session | null) {
  const raw = session?.user.user_metadata?.property_slug

  if (typeof raw !== "string") {
    return null
  }

  const slug = raw.trim().toLowerCase()

  return slug.length ? slug : null
}

/** Session Supabase + slug du site hôte pour la navigation marketing. */
export function useHostivNavAuth() {
  const session = ref<Session | null>(null)
  const propertySlug = ref<string | null>(null)
  const ready = ref(false)
  const configured = ref(true)

  const isLoggedIn = computed(() => Boolean(session.value))

  const userEmail = computed(() => session.value?.user.email ?? null)

  const adminPath = computed(() =>
    propertySlug.value ? `/${propertySlug.value}/admin` : null
  )

  const accountPath = computed(() =>
    propertySlug.value ? `/${propertySlug.value}/admin?section=account` : null
  )

  const sitePath = computed(() => (propertySlug.value ? `/${propertySlug.value}` : null))

  let unsubscribe: (() => void) | null = null

  async function resolvePropertySlug(activeSession: Session) {
    const fromMeta = slugFromUserMetadata(activeSession)

    if (fromMeta) {
      propertySlug.value = fromMeta
      return
    }

    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from("properties")
        .select("slug")
        .limit(1)

      if (error) {
        propertySlug.value = null
        return
      }

      const row = Array.isArray(data) ? data[0] : null
      const slug = row && typeof row.slug === "string" ? row.slug.trim().toLowerCase() : ""

      propertySlug.value = slug.length ? slug : null
    } catch {
      propertySlug.value = null
    }
  }

  async function refresh() {
    if (!configured.value) {
      ready.value = true
      return
    }

    try {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()
      session.value = data.session ?? null

      if (data.session) {
        await resolvePropertySlug(data.session)
      } else {
        propertySlug.value = null
      }
    } catch {
      session.value = null
      propertySlug.value = null
    } finally {
      ready.value = true
    }
  }

  async function logout() {
    if (!configured.value) {
      return
    }

    const supabase = useSupabaseClient()

    await supabase.auth.signOut()
    session.value = null
    propertySlug.value = null
  }

  onMounted(() => {
    try {
      useSupabaseClient()
    } catch {
      configured.value = false
      ready.value = true
      return
    }

    void refresh()

    const supabase = useSupabaseClient()
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      session.value = nextSession

      if (nextSession) {
        void resolvePropertySlug(nextSession)
      } else {
        propertySlug.value = null
      }
    })

    unsubscribe = () => data.subscription.unsubscribe()
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return {
    ready,
    configured,
    isLoggedIn,
    userEmail,
    adminPath,
    accountPath,
    sitePath,
    logout,
    refresh
  }
}
