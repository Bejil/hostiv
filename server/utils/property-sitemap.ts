import type { PropertySiteRecord } from "../../app/types/property-site"
import { requireSupabaseAdmin } from "./supabase"

export type PropertySitemapEntry = {
  slug: string
  updatedAt: string | null
  site: Pick<PropertySiteRecord, "seo_keywords_en_enabled" | "content">
}

export async function listPublishedPropertySitemapEntries(): Promise<PropertySitemapEntry[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at, seo_keywords_en_enabled, content")
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

  return (data ?? [])
    .map((row) => ({
      slug: String(row.slug ?? "").trim().toLowerCase(),
      updatedAt: row.updated_at ? String(row.updated_at) : null,
      site: {
        seo_keywords_en_enabled: Boolean(row.seo_keywords_en_enabled),
        content: row.content as PropertySiteRecord["content"]
      }
    }))
    .filter((row) => row.slug.length > 0)
}
