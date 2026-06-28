import type { HostivLocale } from "../../app/types/hostiv-locale"
import { hasHostivPremiumTools } from "../../app/utils/hostiv-premium-tools"
import { isWelcomeGuideComplete } from "../../app/utils/welcome-guide-completion"
import { getEditableWelcomeGuide } from "../../app/utils/welcome-guide-locale"
import { getPropertyAdminBySlug, getPropertyOwnerUserId } from "./property-admin-repository"
import { getSubscriptionAccessForOwner } from "./hostiv-subscription"
import { buildWelcomeGuidePdf, welcomeGuidePdfFilename } from "./welcome-guide-pdf"

export type BookingWelcomeGuideAttachment = {
  filename: string
  content: Buffer
}

export async function buildBookingWelcomeGuideAttachment(
  slug: string,
  locale: HostivLocale = "fr"
): Promise<BookingWelcomeGuideAttachment | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const property = await getPropertyAdminBySlug(normalizedSlug)

  if (!property) {
    return null
  }

  const ownerUserId = await getPropertyOwnerUserId(normalizedSlug)

  if (!ownerUserId) {
    return null
  }

  const subscription = await getSubscriptionAccessForOwner(ownerUserId, normalizedSlug)

  if (
    !hasHostivPremiumTools({
      plan: subscription.plan,
      paid_until: subscription.paid_until,
      premium_tools_until: subscription.premium_tools_until
    })
  ) {
    return null
  }

  const guide = getEditableWelcomeGuide(property.content, locale, property)

  if (!isWelcomeGuideComplete(guide, property)) {
    return null
  }

  try {
    const content = await buildWelcomeGuidePdf(property, guide, { locale })

    return {
      filename: welcomeGuidePdfFilename(normalizedSlug),
      content
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)

    console.error("[welcome-guide-booking-email] pdf:", detail)

    return null
  }
}
