import { requirePropertyPrimaryOwner } from "../../../../utils/admin-auth"
import { removePropertyCohost } from "../../../../utils/property-cohost"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const memberId = getRouterParam(event, "memberId")

  if (!slug || !memberId) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  await requirePropertyPrimaryOwner(event, slug)

  return await removePropertyCohost(slug, memberId)
})
