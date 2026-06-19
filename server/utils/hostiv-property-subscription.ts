import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import { buildHostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import { isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { normalizeHostivSubscriptionPlan, type HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import {
  buildHostivSubscriptionAccessForOwner,
  isHostivPlatformAdminOwner
} from "./hostiv-platform-admin-subscription"
import { getHostivAccountByUserId } from "./hostiv-subscription"
import { computePaidUntilAfterAnnualPayment } from "./hostiv-subscription-payment"
import { emptySubscriptionRemindersSent } from "./hostiv-subscription-reminders"
import { getPropertySiteBySlug } from "./property-site-repository"
import { getUserEmailById, sendHostivSubscriptionExpiredEmail } from "./transactional-email"
import { requireSupabaseAdmin } from "./supabase"

export type PropertySubscriptionRow = {
  id: string
  slug: string
  owner_user_id: string | null
  subscription_plan: string
  paid_until: string | null
  subscription_started_at: string | null
  premium_tools_until: string | null
  premium_tools_started_at: string | null
}

const PROPERTY_SUBSCRIPTION_SELECT =
  "id, slug, owner_user_id, subscription_plan, paid_until, subscription_started_at, premium_tools_until, premium_tools_started_at"

function mapPropertySubscriptionRow(row: Record<string, unknown>): PropertySubscriptionRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    owner_user_id: typeof row.owner_user_id === "string" ? row.owner_user_id : null,
    subscription_plan: String(row.subscription_plan || "pro"),
    paid_until: typeof row.paid_until === "string" ? row.paid_until : null,
    subscription_started_at:
      typeof row.subscription_started_at === "string" ? row.subscription_started_at : null,
    premium_tools_until:
      typeof row.premium_tools_until === "string" ? row.premium_tools_until : null,
    premium_tools_started_at:
      typeof row.premium_tools_started_at === "string" ? row.premium_tools_started_at : null
  }
}

export async function getPropertySubscriptionBySlug(
  slug: string
): Promise<PropertySubscriptionRow | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SUBSCRIPTION_SELECT)
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-property-subscription] read:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier le forfait du site."
    })
  }

  if (!data) {
    return null
  }

  return mapPropertySubscriptionRow(data as Record<string, unknown>)
}

export async function syncPropertySubscriptionFromAccount(userId: string, slug: string) {
  const account = await getHostivAccountByUserId(userId)
  const property = await getPropertySubscriptionBySlug(slug)

  if (!account || !property || property.owner_user_id !== userId) {
    return
  }

  if (property.paid_until) {
    return
  }

  const supabase = requireSupabaseAdmin()

  await supabase
    .from("properties")
    .update({
      subscription_plan: account.subscription_plan,
      paid_until: account.paid_until,
      subscription_started_at: account.subscription_started_at,
      premium_tools_until: account.premium_tools_until,
      premium_tools_started_at: account.premium_tools_started_at
    })
    .eq("id", property.id)
}

function buildAccessFromPropertySubscription(
  property: PropertySubscriptionRow
): HostivSubscriptionAccess {
  return buildHostivSubscriptionAccess({
    subscription_plan: property.subscription_plan,
    paid_until: property.paid_until,
    subscription_started_at: property.subscription_started_at,
    premium_tools_until: property.premium_tools_until,
    premium_tools_started_at: property.premium_tools_started_at
  })
}

async function reconcilePropertyStarterPlusFromAccount(
  property: PropertySubscriptionRow,
  account: Awaited<ReturnType<typeof getHostivAccountByUserId>>
): Promise<PropertySubscriptionRow> {
  if (!account || normalizeHostivSubscriptionPlan(property.subscription_plan) !== "starter") {
    return property
  }

  const propertyHasStarterPlus = isHostivSubscriptionActive(property.premium_tools_until)
  const accountHasStarterPlus = isHostivSubscriptionActive(account.premium_tools_until)

  if (propertyHasStarterPlus || !accountHasStarterPlus) {
    return property
  }

  const supabase = requireSupabaseAdmin()

  const { error } = await supabase
    .from("properties")
    .update({
      paid_until: account.paid_until ?? property.paid_until,
      premium_tools_until: account.premium_tools_until,
      premium_tools_started_at: account.premium_tools_started_at
    })
    .eq("id", property.id)

  if (error) {
    console.error("[hostiv-property-subscription] reconcile starter+:", error.message)

    return {
      ...property,
      paid_until: account.paid_until ?? property.paid_until,
      premium_tools_until: account.premium_tools_until,
      premium_tools_started_at: account.premium_tools_started_at
    }
  }

  return {
    ...property,
    paid_until: account.paid_until ?? property.paid_until,
    premium_tools_until: account.premium_tools_until,
    premium_tools_started_at: account.premium_tools_started_at
  }
}

export async function unpublishPropertyIfPropertySubscriptionExpired(
  ownerUserId: string,
  propertySlug: string
): Promise<boolean> {
  if (await isHostivPlatformAdminOwner(ownerUserId)) {
    return false
  }

  const property = await getPropertySubscriptionBySlug(propertySlug)

  if (!property || property.owner_user_id !== ownerUserId) {
    return false
  }

  const paidUntil = property.paid_until

  if (!paidUntil || isHostivSubscriptionActive(paidUntil)) {
    return false
  }

  const supabase = requireSupabaseAdmin()
  const slug = propertySlug.trim().toLowerCase()

  const { data: row, error: readError } = await supabase
    .from("properties")
    .select("id, published")
    .eq("slug", slug)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle()

  if (readError || !row?.published) {
    return false
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ published: false })
    .eq("id", row.id)

  if (updateError) {
    console.error("[hostiv-property-subscription] unpublish:", updateError.message)

    return false
  }

  const ownerEmail = await getUserEmailById(ownerUserId)

  if (ownerEmail) {
    const site = await getPropertySiteBySlug(slug, { publishedOnly: false })
    const brandName = site?.brand_name?.trim() || slug

    void sendHostivSubscriptionExpiredEmail({
      to: ownerEmail,
      slug,
      brandName,
      paidUntil
    })
  }

  return true
}

export async function getSubscriptionAccessForProperty(
  ownerUserId: string,
  propertySlug: string
): Promise<HostivSubscriptionAccess> {
  await unpublishPropertyIfPropertySubscriptionExpired(ownerUserId, propertySlug)

  if (await isHostivPlatformAdminOwner(ownerUserId)) {
    const account = await getHostivAccountByUserId(ownerUserId)

    return buildHostivSubscriptionAccessForOwner(ownerUserId, account)
  }

  const property = await getPropertySubscriptionBySlug(propertySlug)

  if (property?.owner_user_id === ownerUserId && property.paid_until) {
    const account = await getHostivAccountByUserId(ownerUserId)
    const reconciled = await reconcilePropertyStarterPlusFromAccount(property, account)

    return buildAccessFromPropertySubscription(reconciled)
  }

  const account = await getHostivAccountByUserId(ownerUserId)

  return buildHostivSubscriptionAccessForOwner(ownerUserId, account)
}

export async function assertCanPublishProperty(ownerUserId: string, propertySlug: string) {
  if (await isHostivPlatformAdminOwner(ownerUserId)) {
    return
  }

  const access = await getSubscriptionAccessForProperty(ownerUserId, propertySlug)

  if (!access.active) {
    throw createError({
      statusCode: 402,
      message: "Le forfait de ce logement a expiré. Renouvelez-le pour publier le site."
    })
  }
}

export async function applyHostivSubscriptionPaymentToProperty(
  propertySlug: string,
  plan: HostivSubscriptionPlan,
  ownerUserId: string,
  now = new Date()
) {
  const normalizedSlug = propertySlug.trim().toLowerCase()
  const normalizedPlan = normalizeHostivSubscriptionPlan(plan)
  const property = await getPropertySubscriptionBySlug(normalizedSlug)

  if (!property || property.owner_user_id !== ownerUserId) {
    throw createError({
      statusCode: 404,
      message: "Site introuvable."
    })
  }

  const paidUntil = computePaidUntilAfterAnnualPayment(property.paid_until, now)
  const subscriptionStartedAt =
    typeof property.subscription_started_at === "string" && property.subscription_started_at.trim()
      ? property.subscription_started_at
      : now.toISOString()

  const supabase = requireSupabaseAdmin()

  const { error: updateError } = await supabase
    .from("properties")
    .update({
      subscription_plan: normalizedPlan,
      paid_until: paidUntil,
      subscription_started_at: subscriptionStartedAt,
      subscription_reminders_sent: emptySubscriptionRemindersSent(paidUntil)
    })
    .eq("id", property.id)

  if (updateError) {
    console.error("[hostiv-property-subscription] payment:", updateError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer le forfait du logement."
    })
  }

  return {
    paid_until: paidUntil,
    subscription_plan: normalizedPlan,
    subscription_started_at: subscriptionStartedAt
  }
}

export async function listOwnerPropertySubscriptionsWithAccess(ownerUserId: string) {
  const supabase = requireSupabaseAdmin()
  const isPlatformAdmin = await isHostivPlatformAdminOwner(ownerUserId)
  const account = await getHostivAccountByUserId(ownerUserId)

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, slug, brand_name, published, subscription_plan, paid_until, subscription_started_at, premium_tools_until, premium_tools_started_at"
    )
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[hostiv-property-subscription] list owner:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger vos forfaits."
    })
  }

  const properties = await Promise.all(
    (data ?? []).map(async (row) => {
      let property = mapPropertySubscriptionRow(row as Record<string, unknown>)
      property = await reconcilePropertyStarterPlusFromAccount(property, account)

      const access = isPlatformAdmin
        ? await buildHostivSubscriptionAccessForOwner(ownerUserId, account)
        : buildAccessFromPropertySubscription(property)

      return {
        slug: property.slug,
        brand_name: String(row.brand_name || property.slug),
        published: Boolean(row.published),
        access
      }
    })
  )

  return {
    properties,
    is_platform_admin: isPlatformAdmin
  }
}
