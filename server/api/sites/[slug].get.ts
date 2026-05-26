import { getPropertySiteBySlug } from "../../../server/utils/property-site-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug manquant" })
  }

  const site = await getPropertySiteBySlug(slug)

  if (!site) {
    throw createError({ statusCode: 404, statusMessage: "Site introuvable" })
  }

  return site
})
