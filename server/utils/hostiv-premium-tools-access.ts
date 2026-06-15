import type { H3Event } from "h3"
import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import { hasHostivPremiumTools } from "../../app/utils/hostiv-premium-tools"
import { requirePropertyAdminAccess, type PropertyAdminAccessContext } from "./admin-auth"
import { getSubscriptionAccessForOwner } from "./hostiv-subscription"

export type PropertyPremiumToolsContext = {
  access: PropertyAdminAccessContext
  subscription: HostivSubscriptionAccess
}

/** Starter + ou Pro actif requis (admin plateforme exempté pour le support). */
export async function requirePropertyPremiumTools(
  event: H3Event,
  slug: string
): Promise<PropertyPremiumToolsContext> {
  const access = await requirePropertyAdminAccess(event, slug)
  const subscription = await getSubscriptionAccessForOwner(access.ownerUserId, slug)

  if (access.isPlatformAdmin) {
    return { access, subscription }
  }

  if (
    !hasHostivPremiumTools({
      plan: subscription.plan,
      paid_until: subscription.paid_until,
      premium_tools_until: subscription.premium_tools_until
    })
  ) {
    throw createError({
      statusCode: 402,
      message: "Cette fonctionnalité nécessite Starter + ou un forfait Pro actif."
    })
  }

  return { access, subscription }
}
