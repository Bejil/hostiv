import { propertyExistsBySlug } from "../../../utils/property-admin-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Slug manquant." })
  }

  const exists = await propertyExistsBySlug(slug)

  if (!exists) {
    throw createError({ statusCode: 404, statusMessage: "Site introuvable." })
  }

  return { ok: true as const }
})
