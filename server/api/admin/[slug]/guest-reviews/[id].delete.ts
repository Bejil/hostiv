import { requirePropertyOwner } from "../../../../utils/admin-auth"
import { deleteGuestReview } from "../../../../utils/guest-review-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")
  const id = getRouterParam(event, "id")

  if (!slug || !id) {
    throw createError({ statusCode: 400, message: "Paramètres manquants." })
  }

  await requirePropertyOwner(event, slug)
  await deleteGuestReview(slug, id)

  return { ok: true as const }
})
