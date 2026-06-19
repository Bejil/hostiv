import type { H3Event } from "h3"
import { hasHostivPremiumTools } from "../../app/utils/hostiv-premium-tools"
import { requirePropertyPrimaryOwner, type PropertyAdminAccessContext } from "./admin-auth"
import { getSubscriptionAccessForOwner } from "./hostiv-subscription"

export async function requirePropertyCohostManagement(event: H3Event, slug: string) {
  const access = await requirePropertyPrimaryOwner(event, slug)
  const subscription = await getSubscriptionAccessForOwner(access.ownerUserId, slug)

  if (
    !hasHostivPremiumTools({
      plan: subscription.plan,
      paid_until: subscription.paid_until,
      premium_tools_until: subscription.premium_tools_until
    })
  ) {
    throw createError({
      statusCode: 402,
      message: "Les co-hôtes sont disponibles avec le forfait Pro ou Starter +."
    })
  }

  return { access, subscription }
}

export type PropertyCohostManagementContext = {
  access: PropertyAdminAccessContext
  subscription: Awaited<ReturnType<typeof getSubscriptionAccessForOwner>>
}
