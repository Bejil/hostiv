import { requirePropertyOwner } from "../../../utils/admin-auth"
import { getSubscriptionAccessForOwner } from "../../../utils/hostiv-subscription"
import { updateHostivSubscriptionPlan } from "../../../utils/hostiv-update-subscription-plan"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const user = await requirePropertyOwner(event, slug)
  const body = await readBody(event)

  const subscription_plan = await updateHostivSubscriptionPlan(
    user.id,
    slug,
    body && typeof body === "object"
      ? (body as Record<string, unknown>).subscription_plan
      : null
  )

  const subscription_access = await getSubscriptionAccessForOwner(user.id, slug)

  return {
    subscription_plan,
    subscription_access
  }
})
