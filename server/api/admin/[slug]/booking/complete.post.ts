import { requirePropertyOwner } from "../../../../utils/admin-auth"
import { completeBookingPayment } from "../../../../utils/booking-complete-payment"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  await requirePropertyOwner(event, slug)

  const body = await readBody(event)

  return completeBookingPayment(event, body, {
    publishedOnly: false,
    expectedPropertySlug: slug
  })
})
