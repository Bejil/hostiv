import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { getPropertySiteBySlug } from "./property-site-repository"
import { requireSupabaseAdmin } from "./supabase"
import {
  getUserEmailById,
  sendHostivPublishSiteReminderEmail,
  sendHostivStripeConnectReminderEmail
} from "./transactional-email"

const PUBLISH_REMINDER_DAYS = 3
const STRIPE_REMINDER_DAYS = 5

type OnboardingEmailsSent = {
  publish_reminder?: string
  stripe_reminder?: string
}

function parseOnboardingEmailsSent(value: unknown): OnboardingEmailsSent {
  if (!value || typeof value !== "object") {
    return {}
  }

  const row = value as Record<string, unknown>

  return {
    publish_reminder:
      typeof row.publish_reminder === "string" ? row.publish_reminder : undefined,
    stripe_reminder:
      typeof row.stripe_reminder === "string" ? row.stripe_reminder : undefined
  }
}

function daysSince(iso: string, now = new Date()) {
  const start = new Date(iso)

  if (Number.isNaN(start.getTime())) {
    return null
  }

  const msPerDay = 24 * 60 * 60 * 1000

  return Math.floor((now.getTime() - start.getTime()) / msPerDay)
}

async function getOwnerPropertyContext(userId: string) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("slug, published, stripe_charges_enabled")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data?.slug) {
    return null
  }

  const slug = String(data.slug).trim().toLowerCase()
  const site = await getPropertySiteBySlug(slug, { publishedOnly: false })

  return {
    slug,
    brandName: site?.brand_name?.trim() || slug,
    published: Boolean(data.published),
    stripeChargesEnabled: Boolean(data.stripe_charges_enabled)
  }
}

export async function runHostivOnboardingReminders(now = new Date()) {
  const supabase = requireSupabaseAdmin()

  const { data: accounts, error } = await supabase
    .from("hostiv_accounts")
    .select("id, paid_until, subscription_started_at, onboarding_emails_sent")
    .not("subscription_started_at", "is", null)

  if (error) {
    console.error("[onboarding-reminders] read accounts:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les comptes Hostiv."
    })
  }

  let publishSent = 0
  let stripeSent = 0

  for (const account of accounts ?? []) {
    const userId = String(account.id)
    const paidUntil = typeof account.paid_until === "string" ? account.paid_until : ""
    const startedAt =
      typeof account.subscription_started_at === "string"
        ? account.subscription_started_at
        : ""

    if (!paidUntil || !startedAt || !isHostivSubscriptionActive(paidUntil, now)) {
      continue
    }

    const days = daysSince(startedAt, now)

    if (days === null) {
      continue
    }

    const property = await getOwnerPropertyContext(userId)
    const ownerEmail = await getUserEmailById(userId)
    const sent = parseOnboardingEmailsSent(account.onboarding_emails_sent)
    const nextSent: OnboardingEmailsSent = { ...sent }
    let shouldUpdate = false

    if (
      ownerEmail &&
      property &&
      !property.published &&
      !sent.publish_reminder &&
      days >= PUBLISH_REMINDER_DAYS
    ) {
      await sendHostivPublishSiteReminderEmail({
        to: ownerEmail,
        slug: property.slug,
        brandName: property.brandName
      })

      nextSent.publish_reminder = now.toISOString()
      shouldUpdate = true
      publishSent += 1
    }

    if (
      ownerEmail &&
      property &&
      !property.stripeChargesEnabled &&
      !sent.stripe_reminder &&
      days >= STRIPE_REMINDER_DAYS
    ) {
      await sendHostivStripeConnectReminderEmail({
        to: ownerEmail,
        slug: property.slug,
        brandName: property.brandName
      })

      nextSent.stripe_reminder = now.toISOString()
      shouldUpdate = true
      stripeSent += 1
    }

    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from("hostiv_accounts")
        .update({ onboarding_emails_sent: nextSent })
        .eq("id", userId)

      if (updateError) {
        console.error("[onboarding-reminders] update:", updateError.message)
      }
    }
  }

  return {
    publishSent,
    stripeSent,
    checked: accounts?.length ?? 0
  }
}
