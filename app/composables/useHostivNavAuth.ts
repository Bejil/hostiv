import type { Session } from "@supabase/supabase-js"
import { listHostivAccessibleProperties } from "./useHostivResolveAdminPath"
import { readHostivActivePropertySlug, writeHostivActivePropertySlug } from "../utils/hostiv-active-property"

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

  const sitePath = computed(() => (propertySlug.value ? `/${propertySlug.value}` : null))

  let unsubscribe: (() => void) | null = null

  async function resolvePropertySlug(activeSession: Session) {
    const properties = await listHostivAccessibleProperties(activeSession)

    if (properties.length) {
      const slugs = new Set(properties.map((property) => property.slug))
      const stored = readHostivActivePropertySlug()

      if (stored && slugs.has(stored)) {
        propertySlug.value = stored
        return
      }

      const fromMeta = slugFromUserMetadata(activeSession)

      if (fromMeta && slugs.has(fromMeta)) {
        propertySlug.value = fromMeta
        writeHostivActivePropertySlug(fromMeta)
        return
      }

      const owned = properties.find((property) => property.role === "owner")
      const slug = owned?.slug ?? properties[0]?.slug ?? null

      propertySlug.value = slug
      if (slug) {
        writeHostivActivePropertySlug(slug)
      }

      return
    }

    propertySlug.value = slugFromUserMetadata(activeSession)
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
    sitePath,
    logout,
    refresh
  }
}
