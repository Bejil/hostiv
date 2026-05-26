import { validatePropertySlugFormat } from "../../app/utils/property-slug"
import { requireSupabaseAdmin } from "./supabase"

export async function isPropertySlugTaken(slug: string): Promise<boolean> {
  const validity = validatePropertySlugFormat(slug)

  if (!validity.valid) {
    return false
  }

  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", validity.slug)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de vérifier la disponibilité du nom."
    })
  }

  return Boolean(data)
}
