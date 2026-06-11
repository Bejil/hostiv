import type { GuestReviewSortField, GuestReviewSortOrder } from "../../../../app/types/guest-review"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import { listGuestReviewsForProperty } from "../../../utils/guest-review-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const sortRaw = String(query.sort || "date")
  const orderRaw = String(query.order || "desc")
  const sort: GuestReviewSortField = sortRaw === "rating" ? "rating" : "date"
  const order: GuestReviewSortOrder = orderRaw === "asc" ? "asc" : "desc"

  return listGuestReviewsForProperty(slug, {
    page,
    pageSize: 25,
    sort,
    order
  })
})
