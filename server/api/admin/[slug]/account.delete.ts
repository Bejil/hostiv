import { requirePropertyPrimaryOwner } from "../../../utils/admin-auth"
import type { HostivAccountDeleteBody } from "../../../../app/types/hostiv-account"
import { deleteHostivAccountForProperty } from "../../../utils/hostiv-account"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const access = await requirePropertyPrimaryOwner(event, slug)
  const user = access.user
  const body = await readBody<HostivAccountDeleteBody>(event)
  const confirmSlug =
    body && typeof body.confirm_slug === "string" ? body.confirm_slug.trim().toLowerCase() : ""

  if (confirmSlug !== slug.trim().toLowerCase()) {
    throw createError({
      statusCode: 400,
      message: "Saisissez l’adresse exacte de votre site pour confirmer la suppression."
    })
  }

  await deleteHostivAccountForProperty(slug, user.id)

  return { ok: true }
})
