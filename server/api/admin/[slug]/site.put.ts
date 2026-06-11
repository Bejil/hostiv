import type { PropertyAdminUpdatePayload } from "../../../../app/types/property-admin"
import { requirePropertyOwner } from "../../../utils/admin-auth"
import {
  assertCanPublishProperty,
  getSubscriptionAccessForOwner
} from "../../../utils/hostiv-subscription"
import { assertStripeReadyForPublish } from "../../../utils/stripe-connect"
import { getPropertyAdminBySlug, updatePropertyAdmin } from "../../../utils/property-admin-repository"
import { sendHostivSitePublishedEmail } from "../../../utils/transactional-email"

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

  if (body.published === true) {
    await assertStripeReadyForPublish(slug)
    await assertCanPublishProperty(user.id)
  }

  const wasPublished = Boolean(existing.published)
  const willPublish = body.published === true

  const updated = await updatePropertyAdmin(slug, {
    ...body,
    id: existing.id,
    slug: existing.slug
  })

  if (!wasPublished && willPublish && updated.published) {
    const ownerEmail = user.email?.trim()

    if (ownerEmail) {
      void sendHostivSitePublishedEmail({
        to: ownerEmail,
        brandName: updated.brand_name,
        slug: updated.slug
      })
    }
  }

  const subscription_access = await getSubscriptionAccessForOwner(user.id, slug)

  return {
    ...updated,
    subscription_access
  }
})
