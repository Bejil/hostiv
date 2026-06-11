import { getGuestReviewFormContext } from "../../utils/guest-review-service"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const slug = String(query.slug || "").trim().toLowerCase()
  const token = String(query.token || "").trim()

  if (!slug || !token) {
    throw createError({ statusCode: 400, message: "Lien d’avis incomplet." })
  }

  const context = await getGuestReviewFormContext(slug, token)

  if (!context) {
    throw createError({ statusCode: 404, message: "Lien d’avis invalide." })
  }

  return context
})
