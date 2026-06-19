import { requireSupabaseAdmin } from "./supabase"

export type PropertySitemapEntry = {
  slug: string
  updatedAt: string | null
}

export async function listPublishedPropertySitemapEntries(): Promise<PropertySitemapEntry[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("published", true)
    .eq("seo_noindex", false)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("[property-sitemap] Supabase error:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger les sites publiés pour le sitemap"
    })
  }

  return (data ?? []).map((row) => ({
    slug: String(row.slug ?? "").trim().toLowerCase(),
    updatedAt: row.updated_at ? String(row.updated_at) : null
  })).filter((row) => row.slug.length > 0)
}
