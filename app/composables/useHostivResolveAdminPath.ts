import type { Session } from "@supabase/supabase-js"
import type { HostivAccessibleProperty } from "../types/hostiv-property"
import { readHostivActivePropertySlug, writeHostivActivePropertySlug } from "../utils/hostiv-active-property"

function slugFromSession(session: Session | null) {
  const raw = session?.user.user_metadata?.property_slug

  if (typeof raw !== "string") {
    return null
  }

  const slug = raw.trim().toLowerCase()

  return slug.length ? slug : null
}

function pickPreferredSlug(
  properties: HostivAccessibleProperty[],
  session: Session | null
): string | null {
  if (!properties.length) {
    return null
  }

  const slugs = new Set(properties.map((property) => property.slug))
  const stored = readHostivActivePropertySlug()

  if (stored && slugs.has(stored)) {
    return stored
  }

  const fromMeta = slugFromSession(session)

  if (fromMeta && slugs.has(fromMeta)) {
    return fromMeta
  }

  const owned = properties.find((property) => property.role === "owner")

  return owned?.slug ?? properties[0]?.slug ?? null
}

async function fetchAccessibleProperties(
  session: Session
): Promise<HostivAccessibleProperty[]> {
  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    return []
  }

  try {
    const response = await $fetch<{ properties: HostivAccessibleProperty[] }>("/api/hostiv/properties", {
      headers: { Authorization: `Bearer ${token}` }
    })

    return response.properties
  } catch {
    return []
  }
}

/** Slug du backoffice de l’utilisateur connecté (metadata, propriétés accessibles ou co-hôte). */
export async function resolveHostivAdminPath(session: Session | null) {
  if (!session) {
    return null
  }

  const properties = await fetchAccessibleProperties(session)
  const slug = pickPreferredSlug(properties, session)

  if (slug) {
    writeHostivActivePropertySlug(slug)
    return `/${slug}/admin`
  }

  return null
}

export async function listHostivAccessibleProperties(session: Session | null) {
  if (!session) {
    return []
  }

  return fetchAccessibleProperties(session)
}
