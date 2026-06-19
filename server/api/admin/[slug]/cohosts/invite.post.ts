import { requirePropertyCohostManagement } from "../../../../utils/property-cohost-access"
import {
  buildPropertyCohostInviteUrl,
  createPropertyCohostInvitation
} from "../../../../utils/property-cohost"
import { sendPropertyCohostInviteEmail } from "../../../../utils/transactional-email"

type InviteBody = {
  email?: string
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const { access } = await requirePropertyCohostManagement(event, slug)
  const body = await readBody<InviteBody>(event)
  const email = typeof body?.email === "string" ? body.email.trim() : ""

  if (!email) {
    throw createError({ statusCode: 400, message: "Adresse e-mail requise." })
  }

  const result = await createPropertyCohostInvitation({
    slug,
    email,
    invitedByUserId: access.user.id
  })

  const inviteUrl = buildPropertyCohostInviteUrl(slug, result.token)

  await sendPropertyCohostInviteEmail({
    to: result.invitation.email,
    brandName: result.property.brand_name,
    slug: result.property.slug,
    inviteUrl
  })

  return {
    invitation: result.invitation
  }
})
