import { submitGuestReview } from "../../utils/guest-review-service"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const token = typeof body?.token === "string" ? body.token.trim() : ""
  const rating = Number(body?.rating)
  const comment = typeof body?.comment === "string" ? body.comment : ""

  if (!slug || !token) {
    throw createError({ statusCode: 400, message: "Lien d’avis incomplet." })
  }

  const review = await submitGuestReview({ slug, token, rating, comment })

  return { ok: true as const, review }
})
