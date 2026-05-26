import type { PropertyAdminUpdatePayload } from "../../../../app/types/property-admin"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import {
  assertCanPublishProperty,
  getSubscriptionAccessForOwner
} from "../../../utils/hostiv-subscription"
import { getPropertyAdminBySlug, updatePropertyAdmin } from "../../../utils/property-admin-repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const user = await requirePropertyOwner(event, slug)

  const existing = await getPropertyAdminBySlug(slug)

  if (!existing) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const body = await readBody<PropertyAdminUpdatePayload>(event)

  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, message: "Corps de requête invalide." })
  }

  if (body.slug !== existing.slug) {
    throw createError({ statusCode: 400, message: "Le slug ne peut pas être modifié." })
  }

  if (body.published === true && !existing.published) {
    await assertCanPublishProperty(user.id)
  }

  const updated = await updatePropertyAdmin(slug, {
    ...body,
    id: existing.id,
    slug: existing.slug
  })

  const subscription_access = await getSubscriptionAccessForOwner(user.id, slug)

  return {
    ...updated,
    subscription_access
  }
})
