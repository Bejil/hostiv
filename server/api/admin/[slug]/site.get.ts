import { requirePropertyAdminAccess } from "../../../utils/admin-auth"
import { getSubscriptionAccessForOwner } from "../../../utils/hostiv-subscription"
import { hasHostivPremiumTools } from "../../../../app/utils/hostiv-premium-tools"
import {
  getPropertyAdminBySlug,
  propertyExistsBySlug
} from "../../../utils/property-admin-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  if (!(await propertyExistsBySlug(slug))) {
    throw createError({ statusCode: 404, statusMessage: "Ce backoffice n’existe pas." })
  }

  const access = await requirePropertyAdminAccess(event, slug)

  const subscription_access = await getSubscriptionAccessForOwner(access.ownerUserId, slug)

  const site = await getPropertyAdminBySlug(slug)

  if (!site) {
    throw createError({ statusCode: 404, statusMessage: "Ce backoffice n’existe pas." })
  }

  const canManageCohosts =
    access.isPrimaryOwner &&
    hasHostivPremiumTools({
      plan: subscription_access.plan,
      paid_until: subscription_access.paid_until,
      premium_tools_until: subscription_access.premium_tools_until
    })

  return {
    ...site,
    subscription_access,
    admin_access: {
      role: access.role,
      is_primary_owner: access.isPrimaryOwner,
      can_manage_cohosts: canManageCohosts
    }
  }
})
