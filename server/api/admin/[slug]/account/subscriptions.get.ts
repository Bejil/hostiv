import { requirePropertyPrimaryOwner } from "../../../../utils/admin-auth"
import { getHostivAccountSubscriptionsPayload } from "../../../../utils/hostiv-account-subscriptions"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const access = await requirePropertyPrimaryOwner(event, slug)

  return getHostivAccountSubscriptionsPayload(access.ownerUserId)
})
