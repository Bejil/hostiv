import { requirePropertyPrimaryOwner } from "../../../utils/admin-auth"
import { listPropertyCohosts } from "../../../utils/property-cohost"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyPrimaryOwner(event, slug)

  return await listPropertyCohosts(slug)
})
