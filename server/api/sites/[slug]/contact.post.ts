import {
  bookingSiteQueryOptions,
  isOwnerBookingPreview,
  readBookingPropertySlug
} from "../../../utils/booking-owner-preview"
import { getPropertyBookingNotifyEmail } from "../../../utils/property-site-repository"
import {
  parseSiteGuestContactBody,
  sendSiteGuestContactEmails,
  siteGuestContactErrors
} from "../../../utils/site-guest-contact"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug manquant." })
  }

  const config = useRuntimeConfig()
  const resendApiKey = String(config.resendApiKey || "").trim()
  const from = String(config.bookingEmailFrom || "").replace(/\s+#.*$/, "").trim()
  const body = await readBody(event)
  const locale = body?.locale === "en" ? "en" : "fr"
  const errors = siteGuestContactErrors(locale)

  if (!resendApiKey || !from) {
    throw createError({
      statusCode: 503,
      message: errors.unavailable
    })
  }

  const bodySlug = readBookingPropertySlug(body)
  const ownerPreview =
    bodySlug && bodySlug === slug.trim().toLowerCase()
      ? await isOwnerBookingPreview(event, bodySlug)
      : false

  const parsed = await parseSiteGuestContactBody(slug, body, bookingSiteQueryOptions(ownerPreview))

  if (!parsed.ok) {
    throw createError({
      statusCode: 400,
      message: parsed.message
    })
  }

  if (parsed.honeypot) {
    return { ok: true as const }
  }

  const notifyTo = await getPropertyBookingNotifyEmail(parsed.propertySlug, {
    publishedOnly: !ownerPreview
  })

  if (!notifyTo) {
    throw createError({
      statusCode: 503,
      message: errors.hostEmailMissing
    })
  }

  try {
    await sendSiteGuestContactEmails({
      resendApiKey,
      from,
      hostTo: notifyTo,
      parsed
    })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause)

    console.error("[site-guest-contact]", detail)

    throw createError({
      statusCode: 502,
      message: errors.sendFailed
    })
  }

  return { ok: true as const }
})
