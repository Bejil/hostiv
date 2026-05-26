import type { Session } from "@supabase/supabase-js"

function slugFromSession(session: Session | null) {
  const raw = session?.user.user_metadata?.property_slug

  if (typeof raw !== "string") {
    return null
  }

  const slug = raw.trim().toLowerCase()

  return slug.length ? slug : null
}

/** Slug du backoffice de l’utilisateur connecté (metadata ou propriété possédée). */
export async function resolveHostivAdminPath(session: Session | null) {
  const fromMeta = slugFromSession(session)

  if (fromMeta) {
    return `/${fromMeta}/admin`
  }

  if (!session) {
    return null
  }

  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from("properties")
      .select("slug")
      .eq("owner_user_id", session.user.id)
      .limit(1)

    if (error) {
      return null
    }

    const row = Array.isArray(data) ? data[0] : null
    const slug = row && typeof row.slug === "string" ? row.slug.trim().toLowerCase() : ""

    return slug.length ? `/${slug}/admin` : null
  } catch {
    return null
  }
}
