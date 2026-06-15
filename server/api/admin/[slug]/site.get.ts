import { requirePropertyAdminAccess } from "../../../utils/admin-auth"
import { getSubscriptionAccessForOwner } from "../../../utils/hostiv-subscription"
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

  return {
    ...site,
    subscription_access
  }
})
