import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { getPropertySiteBySlug } from "./property-site-repository"
import { requireSupabaseAdmin } from "./supabase"
import { getUserEmailById, sendHostivSubscriptionExpiringSoonEmail } from "./transactional-email"

export type SubscriptionReminderMilestone = "30d" | "7d" | "1d"

const MILESTONE_DAYS: Record<SubscriptionReminderMilestone, number> = {
  "30d": 30,
  "7d": 7,
  "1d": 1
}

type RemindersSentState = {
  paid_until?: string
  sent?: string[]
}

function daysUntilExpiry(paidUntil: string, now = new Date()) {
  const end = new Date(paidUntil)

  if (Number.isNaN(end.getTime())) {
    return null
  }

  const msPerDay = 24 * 60 * 60 * 1000

  return Math.ceil((end.getTime() - now.getTime()) / msPerDay)
}

function parseRemindersSent(value: unknown): RemindersSentState {
  if (!value || typeof value !== "object") {
    return {}
  }

  const row = value as Record<string, unknown>

  return {
    paid_until: typeof row.paid_until === "string" ? row.paid_until : undefined,
    sent: Array.isArray(row.sent) ? row.sent.map(String) : []
  }
}

function milestoneForDaysLeft(daysLeft: number): SubscriptionReminderMilestone | null {
  if (daysLeft === 30) {
    return "30d"
  }

  if (daysLeft === 7) {
    return "7d"
  }

  if (daysLeft === 1) {
    return "1d"
  }

  return null
}

async function getOwnerPropertyContext(userId: string) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select("slug")
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
    brandName: site?.brand_name?.trim() || slug
  }
}

export async function runHostivSubscriptionExpiryReminders(now = new Date()) {
  const supabase = requireSupabaseAdmin()

  const { data: accounts, error } = await supabase
    .from("hostiv_accounts")
    .select("id, paid_until, subscription_reminders_sent")
    .not("paid_until", "is", null)

  if (error) {
    console.error("[subscription-reminders] read accounts:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger les forfaits."
    })
  }

  let sentCount = 0

  for (const account of accounts ?? []) {
    const userId = String(account.id)
    const paidUntil = typeof account.paid_until === "string" ? account.paid_until : ""

    if (!paidUntil || !isHostivSubscriptionActive(paidUntil, now)) {
      continue
    }

    const daysLeft = daysUntilExpiry(paidUntil, now)
    const milestone = daysLeft === null ? null : milestoneForDaysLeft(daysLeft)

    if (!milestone) {
      continue
    }

    const reminders = parseRemindersSent(account.subscription_reminders_sent)
    const sent = reminders.paid_until === paidUntil ? reminders.sent ?? [] : []

    if (sent.includes(milestone)) {
      continue
    }

    const ownerEmail = await getUserEmailById(userId)
    const property = await getOwnerPropertyContext(userId)

    if (!ownerEmail || !property) {
      continue
    }

    await sendHostivSubscriptionExpiringSoonEmail({
      to: ownerEmail,
      slug: property.slug,
      brandName: property.brandName,
      paidUntil,
      daysLeft: MILESTONE_DAYS[milestone]
    })

    const nextSent = {
      paid_until: paidUntil,
      sent: [...sent, milestone]
    }

    const { error: updateError } = await supabase
      .from("hostiv_accounts")
      .update({ subscription_reminders_sent: nextSent })
      .eq("id", userId)

    if (updateError) {
      console.error("[subscription-reminders] update:", updateError.message)
      continue
    }

    sentCount += 1
  }

  return { sentCount, checked: accounts?.length ?? 0 }
}

export function emptySubscriptionRemindersSent(paidUntil: string) {
  return {
    paid_until: paidUntil,
    sent: [] as string[]
  }
}
