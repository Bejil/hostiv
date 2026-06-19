import type { PropertyAdminUpdatePayload } from "../../../../app/types/property-admin"
import { requirePropertyAdminAccess } from "../../../utils/admin-auth"
import { assertCanPublishProperty } from "../../../utils/hostiv-property-subscription"
import { getSubscriptionAccessForOwner } from "../../../utils/hostiv-subscription"
import { assertStripeReadyForPublish } from "../../../utils/stripe-connect"
import { getPropertyAdminBySlug, updatePropertyAdmin } from "../../../utils/property-admin-repository"
import { requireSupabaseAdmin } from "../../../utils/supabase"
import { sendHostivSitePublishedEmail } from "../../../utils/transactional-email"
import { assertValidCalendarConfigFeeds } from "../../../utils/validate-calendar-config"

async function readOwnerEmail(ownerUserId: string) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase.auth.admin.getUserById(ownerUserId)

  if (error || !data.user?.email) {
    return ""
  }

  return data.user.email.trim()
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const access = await requirePropertyAdminAccess(event, slug)
  const { user, ownerUserId } = access

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
    if (!access.isPrimaryOwner && !access.isPlatformAdmin) {
      throw createError({
        statusCode: 403,
        message: "Seul l’hôte principal peut publier le site."
      })
    }

    await assertStripeReadyForPublish(slug)
    await assertCanPublishProperty(ownerUserId, slug)
  }

  if (body.published === false && existing.published && !access.isPrimaryOwner && !access.isPlatformAdmin) {
    throw createError({
      statusCode: 403,
      message: "Seul l’hôte principal peut dépublier le site."
    })
  }

  if (body.calendar_config) {
    assertValidCalendarConfigFeeds(body.calendar_config)
  }

  const wasPublished = Boolean(existing.published)
  const willPublish = body.published === true

  const updated = await updatePropertyAdmin(slug, {
    ...body,
    id: existing.id,
    slug: existing.slug
  })

  if (!wasPublished && willPublish && updated.published) {
    const ownerEmail = access.isPlatformAdmin
      ? await readOwnerEmail(ownerUserId)
      : user.email?.trim() ?? ""

    if (ownerEmail) {
      void sendHostivSitePublishedEmail({
        to: ownerEmail,
        brandName: updated.brand_name,
        slug: updated.slug
      })
    }
  }

  const subscription_access = await getSubscriptionAccessForOwner(ownerUserId, slug)

  return {
    ...updated,
    subscription_access
  }
})
