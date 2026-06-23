import { requirePropertyAdminAccess } from "../../../utils/admin-auth"
import { getPropertyTrafficReport } from "../../../utils/property-traffic"

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "").trim().toLowerCase()

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyAdminAccess(event, slug)

  const query = getQuery(event)
  const locale = String(query.locale || "fr").trim().toLowerCase() === "en" ? "en" : "fr"

  return getPropertyTrafficReport({
    slug,
    startDate: String(query.start_date || "").trim() || null,
    endDate: String(query.end_date || "").trim() || null,
    locale
  })
})
