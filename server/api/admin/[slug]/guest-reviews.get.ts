import type { GuestReviewSortField, GuestReviewSortOrder } from "../../../../app/types/guest-review"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import {
  getGuestReviewSummaryForProperty,
  listGuestReviewsForProperty
} from "../../../utils/guest-review-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.pageSize) || 25
  const sortRaw = String(query.sort || "date")
  const orderRaw = String(query.order || "desc")
  const sort: GuestReviewSortField = sortRaw === "rating" ? "rating" : "date"
  const order: GuestReviewSortOrder = orderRaw === "asc" ? "asc" : "desc"

  const [listResult, summary] = await Promise.all([
    listGuestReviewsForProperty(slug, {
      page,
      pageSize,
      sort,
      order
    }),
    getGuestReviewSummaryForProperty(slug)
  ])

  return {
    ...listResult,
    summary
  }
})
