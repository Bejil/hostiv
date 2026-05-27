import { requirePropertyOwner } from "../../../utils/admin-auth"
import { hostivAccountProfileFromUser } from "../../../utils/hostiv-account"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const user = await requirePropertyOwner(event, slug)

  return hostivAccountProfileFromUser(user)
})
