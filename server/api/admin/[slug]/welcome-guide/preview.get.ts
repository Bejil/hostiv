import { requirePropertyOwner } from "../../../../utils/admin-auth"
import { getPropertyAdminBySlug } from "../../../../utils/property-admin-repository"
import { buildWelcomeGuideHtml } from "../../../../utils/welcome-guide-html"
import { normalizeWelcomeGuide } from "../../../../../app/utils/welcome-guide-content"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Paramètre manquant." })
  }

  await requirePropertyOwner(event, slug)

  const property = await getPropertyAdminBySlug(slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const guide = normalizeWelcomeGuide(
    property.content.welcome_guide,
    property.brand_name,
    property
  )
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || ""
  const html = buildWelcomeGuideHtml(property, guide, { supabaseUrl })

  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8")
  setResponseHeader(event, "Cache-Control", "no-store")

  return html
})
