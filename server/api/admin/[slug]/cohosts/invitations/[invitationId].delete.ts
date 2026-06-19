import { requirePropertyPrimaryOwner } from "../../../../../utils/admin-auth"
import { revokePropertyCohostInvitation } from "../../../../../utils/property-cohost"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const invitationId = getRouterParam(event, "invitationId")

  if (!slug || !invitationId) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  await requirePropertyPrimaryOwner(event, slug)

  return await revokePropertyCohostInvitation(slug, invitationId)
})
