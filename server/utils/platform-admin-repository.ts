import { hostivPricing } from "../../app/data/hostivLanding"
import type {
  PlatformAdminAlertRow,
  PlatformAdminDashboardStats,
  PlatformAdminDashboardRecentPayment,
  PlatformAdminGuestReviewRow,
  PlatformAdminMemberRow,
  PlatformAdminMemberDetail,
  PlatformAdminReservationRow,
  PlatformAdminReservationsSummary,
  PlatformAdminRevenueBreakdown,
  PlatformAdminRevenuePaymentRow,
  PlatformAdminRevenueReport,
  PlatformAdminSignupRow,
  PlatformAdminSiteRow
} from "../../app/types/platform-admin"
import type { HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { buildHostivSubscriptionAccess, isHostivSubscriptionActive } from "../../app/utils/hostiv-subscription-access"
import { buildHostivSubscriptionAccessForEmail } from "./hostiv-platform-admin-subscription"
import { profileFromUserMetadata } from "../../app/utils/hostiv-user-profile"
import { requireSupabaseAdmin } from "./supabase"

type AuthUserSummary = {
  email: string
  full_name: string | null
  created_at: string
}

async function listAuthUsersById(): Promise<Map<string, AuthUserSummary>> {
  const supabase = requireSupabaseAdmin()
  const map = new Map<string, AuthUserSummary>()
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })

    if (error) {
      console.error("[platform-admin] listUsers:", error.message)
      break
    }

    if (!data.users.length) {
      break
    }

    for (const user of data.users) {
      const metadata = user.user_metadata as Record<string, unknown> | undefined
      const profile = profileFromUserMetadata(metadata)

      map.set(user.id, {
        email: user.email?.trim().toLowerCase() ?? "",
        full_name: profile.fullName || null,
        created_at: user.created_at
      })
    }

    if (data.users.length < 200) {
      break
    }

    page += 1
  }

  return map
}

function premiumAddonPriceEur() {
  return hostivPricing.premiumAddon?.price ?? 30
}

function planPriceEur(plan: "starter" | "pro") {
  const match = hostivPricing.plans.find((entry) => entry.id === plan)

  return match?.price ?? (plan === "starter" ? 49 : 99)
}

function daysFromNow(days: number) {
  const date = new Date()

  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString()
}

function daysAgo(days: number) {
  const date = new Date()

  date.setUTCDate(date.getUTCDate() - days)

  return date.toISOString()
}

function startOfCurrentMonthUtc() {
  const now = new Date()

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

function startOfPreviousMonthUtc() {
  const now = new Date()

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString()
}

function monthOverMonthPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }

  return Math.round(((current - previous) / previous) * 1000) / 10
}

function countActiveSubscriptionsAt(
  accounts: Array<{ paid_until: string | null }>,
  atIso: string
) {
  const at = new Date(atIso)
  let count = 0

  for (const account of accounts) {
    if (isHostivSubscriptionActive(account.paid_until, at)) {
      count += 1
    }
  }

  return count
}

export async function getPlatformAdminDashboardStats(): Promise<PlatformAdminDashboardStats> {
  const supabase = requireSupabaseAdmin()
  const nowIso = new Date().toISOString()
  const since30d = daysAgo(30)

  const [
    propertiesRes,
    accountsRes,
    pendingSignupsRes,
    reservationsRes,
    guestReviewsRes,
    paymentsRes,
    recentPaymentsRes,
    authUsers
  ] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, slug, published, owner_user_id, stripe_account_id, subscription_plan, created_at"
      ),
    supabase
      .from("hostiv_accounts")
      .select(
        "id, subscription_plan, paid_until, premium_tools_until, subscription_started_at, created_at"
      ),
    supabase
      .from("hostiv_pending_signups")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .gt("expires_at", nowIso),
    supabase.from("booking_reservations").select("status, total_eur"),
    supabase.from("guest_reviews").select("rating"),
    supabase.from("hostiv_stripe_payments").select("amount_cents, paid_at").eq("payment_status", "paid"),
    supabase
      .from("hostiv_stripe_payments")
      .select("id, paid_at, checkout_type, product_label, member_email, amount_cents")
      .eq("payment_status", "paid")
      .order("paid_at", { ascending: false })
      .limit(5),
    listAuthUsersById()
  ])

  if (propertiesRes.error) {
    throw createError({ statusCode: 502, message: propertiesRes.error.message })
  }

  if (accountsRes.error) {
    throw createError({ statusCode: 502, message: accountsRes.error.message })
  }

  if (paymentsRes.error) {
    console.error("[platform-admin] dashboard payments:", paymentsRes.error.message)
  }

  if (recentPaymentsRes.error) {
    console.error("[platform-admin] dashboard recent payments:", recentPaymentsRes.error.message)
  }

  const properties = propertiesRes.data ?? []
  const accounts = accountsRes.data ?? []
  const reservations = reservationsRes.data ?? []
  const guestReviews = guestReviewsRes.data ?? []

  let subscriptionsActive = 0
  let subscriptionsExpired = 0
  let subscriptionsUnpaid = 0
  let starterActive = 0
  let proActive = 0
  let starterPlusActive = 0
  let estimatedAnnual = 0
  let newMembers30d = 0

  for (const account of accounts) {
    const authUser = authUsers.get(account.id)
    const access = buildHostivSubscriptionAccessForEmail(account, authUser?.email)

    if (access.active) {
      subscriptionsActive += 1

      if (!access.is_platform_admin) {
        if (access.plan === "starter") {
          starterActive += 1
          estimatedAnnual += planPriceEur("starter")

          if (access.has_starter_plus) {
            starterPlusActive += 1
            estimatedAnnual += premiumAddonPriceEur()
          }
        } else {
          proActive += 1
          estimatedAnnual += planPriceEur("pro")
        }
      } else {
        proActive += 1
      }
    } else if (access.paid_until) {
      subscriptionsExpired += 1
    } else {
      subscriptionsUnpaid += 1
    }

    if (authUser?.created_at && authUser.created_at >= since30d) {
      newMembers30d += 1
    }
  }

  const sitesPublished = properties.filter((property) => property.published).length
  const sitesDraft = properties.length - sitesPublished
  const newSites30d = properties.filter(
    (property) => property.created_at && property.created_at >= since30d
  ).length

  const stripeConnectCount = properties.filter(
    (property) =>
      typeof property.stripe_account_id === "string" && property.stripe_account_id.trim()
  ).length

  const confirmedReservations = reservations.filter(
    (reservation) => reservation.status === "confirmed"
  )
  const reservationsGmv = confirmedReservations.reduce(
    (sum, reservation) => sum + Number(reservation.total_eur || 0),
    0
  )

  const ratings = guestReviews.map((review) => Number(review.rating)).filter((rating) => rating > 0)
  const guestReviewsAvg =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : null

  let revenueTotalCents = 0
  let revenueLast30dCents = 0
  let revenueCurrentMonthCents = 0
  let revenuePreviousMonthCents = 0
  const monthStart = startOfCurrentMonthUtc()
  const previousMonthStart = startOfPreviousMonthUtc()

  for (const payment of paymentsRes.data ?? []) {
    revenueTotalCents += payment.amount_cents

    if (payment.paid_at && payment.paid_at >= since30d) {
      revenueLast30dCents += payment.amount_cents
    }

    if (payment.paid_at && payment.paid_at >= monthStart) {
      revenueCurrentMonthCents += payment.amount_cents
    } else if (
      payment.paid_at &&
      payment.paid_at >= previousMonthStart &&
      payment.paid_at < monthStart
    ) {
      revenuePreviousMonthCents += payment.amount_cents
    }
  }

  const recentPayments = (recentPaymentsRes.data ?? []).map((payment) => ({
    id: payment.id,
    paid_at: payment.paid_at,
    checkout_type: payment.checkout_type as PlatformAdminDashboardRecentPayment["checkout_type"],
    product_label: payment.product_label,
    member_email: payment.member_email,
    amount_eur: Math.round(payment.amount_cents) / 100
  }))

  const stripeMissingCount = properties.filter(
    (property) =>
      !property.stripe_account_id ||
      (typeof property.stripe_account_id === "string" && !property.stripe_account_id.trim())
  ).length

  let membersAtPrevMonthEnd = 0

  for (const account of accounts) {
    const authUser = authUsers.get(account.id)
    const createdAt = authUser?.created_at ?? account.created_at

    if (createdAt && createdAt < monthStart) {
      membersAtPrevMonthEnd += 1
    }
  }

  const sitesAtPrevMonthEnd = properties.filter(
    (property) => property.created_at && property.created_at < monthStart
  ).length
  const subscriptionsActiveAtPrevMonthEnd = countActiveSubscriptionsAt(accounts, monthStart)

  return {
    sites_total: properties.length,
    sites_published: sitesPublished,
    sites_draft: sitesDraft,
    subscriptions_active: subscriptionsActive,
    subscriptions_expired: subscriptionsExpired,
    subscriptions_unpaid: subscriptionsUnpaid,
    starter_active: starterActive,
    pro_active: proActive,
    starter_plus_active: starterPlusActive,
    members_total: accounts.length,
    pending_signups: pendingSignupsRes.count ?? 0,
    reservations_total: reservations.length,
    reservations_confirmed: confirmedReservations.length,
    reservations_gmv_eur: Math.round(reservationsGmv * 100) / 100,
    guest_reviews_total: guestReviews.length,
    guest_reviews_avg_rating: guestReviewsAvg,
    estimated_annual_revenue_eur: estimatedAnnual,
    revenue_total_eur: Math.round(revenueTotalCents) / 100,
    revenue_last_30d_eur: Math.round(revenueLast30dCents) / 100,
    recent_payments: recentPayments,
    new_members_30d: newMembers30d,
    new_sites_30d: newSites30d,
    stripe_connect_count: stripeConnectCount,
    stripe_missing_count: stripeMissingCount,
    members_mom_pct: monthOverMonthPercent(accounts.length, membersAtPrevMonthEnd),
    sites_mom_pct: monthOverMonthPercent(properties.length, sitesAtPrevMonthEnd),
    subscriptions_active_mom_pct: monthOverMonthPercent(
      subscriptionsActive,
      subscriptionsActiveAtPrevMonthEnd
    ),
    revenue_mom_pct: monthOverMonthPercent(revenueCurrentMonthCents, revenuePreviousMonthCents)
  }
}

export async function listPlatformAdminSites(): Promise<PlatformAdminSiteRow[]> {
  const supabase = requireSupabaseAdmin()

  const [propertiesRes, accountsRes, reservationsRes, reviewsRes, authUsers] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, slug, brand_name, published, owner_user_id, stripe_account_id, subscription_plan, created_at, updated_at"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("hostiv_accounts")
      .select("id, subscription_plan, paid_until, premium_tools_until, subscription_started_at"),
    supabase.from("booking_reservations").select("property_id, property_slug, status, total_eur"),
    supabase.from("guest_reviews").select("property_id, property_slug, rating"),
    listAuthUsersById()
  ])

  if (propertiesRes.error) {
    throw createError({ statusCode: 502, message: propertiesRes.error.message })
  }

  const accountsById = new Map(
    (accountsRes.data ?? []).map((account) => [account.id, account] as const)
  )

  const reservationStats = new Map<
    string,
    { count: number; gmv: number }
  >()

  for (const reservation of reservationsRes.data ?? []) {
    const key = reservation.property_id ?? reservation.property_slug

    if (!key) {
      continue
    }

    const current = reservationStats.get(key) ?? { count: 0, gmv: 0 }

    if (reservation.status === "confirmed") {
      current.count += 1
      current.gmv += Number(reservation.total_eur || 0)
    }

    reservationStats.set(key, current)
  }

  const reviewStats = new Map<string, { count: number; sum: number }>()

  for (const review of reviewsRes.data ?? []) {
    const key = review.property_id ?? review.property_slug

    if (!key) {
      continue
    }

    const current = reviewStats.get(key) ?? { count: 0, sum: 0 }

    current.count += 1
    current.sum += Number(review.rating || 0)
    reviewStats.set(key, current)
  }

  return (propertiesRes.data ?? []).map((property) => {
    const ownerId =
      typeof property.owner_user_id === "string" ? property.owner_user_id : null
    const account = ownerId ? accountsById.get(ownerId) : null
    const authUser = ownerId ? authUsers.get(ownerId) : null
    const access = buildHostivSubscriptionAccessForEmail(
      {
        subscription_plan: account?.subscription_plan ?? property.subscription_plan,
        paid_until: account?.paid_until,
        premium_tools_until: account?.premium_tools_until,
        subscription_started_at: account?.subscription_started_at
      },
      authUser?.email
    )
    const reservationKey = property.id
    const reservationStat = reservationStats.get(reservationKey) ??
      reservationStats.get(property.slug) ?? { count: 0, gmv: 0 }
    const reviewStat = reviewStats.get(reservationKey) ??
      reviewStats.get(property.slug) ?? { count: 0, sum: 0 }

    return {
      id: property.id,
      slug: property.slug,
      brand_name: property.brand_name,
      published: property.published,
      subscription_plan: access.plan,
      owner_email: authUser?.email ?? null,
      owner_full_name: authUser?.full_name ?? null,
      owner_user_id: ownerId,
      paid_until: access.paid_until,
      subscription_active: access.active,
      has_starter_plus: access.has_starter_plus,
      stripe_account_id:
        typeof property.stripe_account_id === "string" && property.stripe_account_id.trim()
          ? property.stripe_account_id.trim()
          : null,
      reservations_count: reservationStat.count,
      reservations_gmv_eur: Math.round(reservationStat.gmv * 100) / 100,
      guest_reviews_count: reviewStat.count,
      guest_reviews_avg_rating:
        reviewStat.count > 0
          ? Math.round((reviewStat.sum / reviewStat.count) * 10) / 10
          : null,
      created_at: property.created_at,
      updated_at: property.updated_at
    }
  })
}

export async function listPlatformAdminMembers(): Promise<PlatformAdminMemberRow[]> {
  const supabase = requireSupabaseAdmin()

  const [accountsRes, propertiesRes, authUsers] = await Promise.all([
    supabase
      .from("hostiv_accounts")
      .select(
        "id, subscription_plan, paid_until, premium_tools_until, subscription_started_at, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("owner_user_id, slug, published, stripe_account_id"),
    listAuthUsersById()
  ])

  if (accountsRes.error) {
    throw createError({ statusCode: 502, message: accountsRes.error.message })
  }

  const propertyByOwner = new Map<
    string,
    { slug: string; published: boolean; stripe_account_id: string | null }
  >()

  for (const property of propertiesRes.data ?? []) {
    if (property.owner_user_id) {
      propertyByOwner.set(property.owner_user_id, {
        slug: property.slug,
        published: property.published,
        stripe_account_id:
          typeof property.stripe_account_id === "string" && property.stripe_account_id.trim()
            ? property.stripe_account_id.trim()
            : null
      })
    }
  }

  return (accountsRes.data ?? []).map((account) => {
    const authUser = authUsers.get(account.id)
    const access = buildHostivSubscriptionAccessForEmail(account, authUser?.email)
    const property = propertyByOwner.get(account.id)

    return {
      user_id: account.id,
      email: authUser?.email ?? "",
      full_name: authUser?.full_name ?? null,
      subscription_plan: access.plan,
      paid_until: access.paid_until,
      subscription_active: access.active,
      premium_tools_until: access.premium_tools_until,
      has_starter_plus: access.has_starter_plus,
      property_slug: property?.slug ?? null,
      property_published: property ? property.published : null,
      stripe_account_id: property?.stripe_account_id ?? null,
      created_at: account.created_at,
      subscription_started_at: access.subscription_started_at
    }
  })
}

export async function getPlatformAdminMemberDetail(userId: string): Promise<PlatformAdminMemberDetail> {
  const supabase = requireSupabaseAdmin()

  const [accountRes, propertyRes, userRes] = await Promise.all([
    supabase
      .from("hostiv_accounts")
      .select(
        "id, subscription_plan, paid_until, premium_tools_until, subscription_started_at, created_at"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("properties")
      .select("owner_user_id, slug, published, stripe_account_id")
      .eq("owner_user_id", userId)
      .maybeSingle(),
    supabase.auth.admin.getUserById(userId)
  ])

  if (accountRes.error) {
    throw createError({ statusCode: 502, message: accountRes.error.message })
  }

  if (!accountRes.data) {
    throw createError({ statusCode: 404, message: "Membre introuvable." })
  }

  if (userRes.error || !userRes.data.user) {
    throw createError({ statusCode: 404, message: "Membre introuvable." })
  }

  const account = accountRes.data
  const user = userRes.data.user
  const access = buildHostivSubscriptionAccessForEmail(account, user.email)
  const profile = profileFromUserMetadata(user.user_metadata as Record<string, unknown> | undefined)
  const property = propertyRes.data

  return {
    user_id: account.id,
    email: user.email?.trim().toLowerCase() ?? "",
    full_name: profile.fullName || null,
    first_name: profile.firstName,
    last_name: profile.lastName,
    subscription_plan: access.plan,
    paid_until: access.paid_until,
    subscription_active: access.active,
    premium_tools_until: access.premium_tools_until,
    has_starter_plus: access.has_starter_plus,
    property_slug: property?.slug ?? null,
    property_published: property ? property.published : null,
    stripe_account_id:
      typeof property?.stripe_account_id === "string" && property.stripe_account_id.trim()
        ? property.stripe_account_id.trim()
        : null,
    created_at: account.created_at,
    subscription_started_at: access.subscription_started_at
  }
}

export async function getPlatformAdminRevenueReport(): Promise<PlatformAdminRevenueReport> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_stripe_payments")
    .select(
      "id, paid_at, checkout_type, product_label, subscription_plan, member_email, property_slug, amount_cents, amount_subtotal_cents, discount_cents, promo_code, currency"
    )
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false })
    .limit(500)

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  const payments = (data ?? []).map((row) => ({
    id: row.id,
    paid_at: row.paid_at,
    checkout_type: row.checkout_type as PlatformAdminRevenuePaymentRow["checkout_type"],
    product_label: row.product_label,
    subscription_plan: row.subscription_plan as HostivSubscriptionPlan | null,
    member_email: row.member_email,
    property_slug: row.property_slug,
    amount_eur: Math.round(row.amount_cents) / 100,
    amount_subtotal_eur:
      typeof row.amount_subtotal_cents === "number" ? Math.round(row.amount_subtotal_cents) / 100 : null,
    discount_eur:
      typeof row.discount_cents === "number" && row.discount_cents > 0
        ? Math.round(row.discount_cents) / 100
        : null,
    promo_code: typeof row.promo_code === "string" && row.promo_code.trim() ? row.promo_code : null,
    currency: row.currency
  }))

  const now = Date.now()
  const last30dMs = 30 * 24 * 60 * 60 * 1000

  let totalCollectedCents = 0
  let last30dCents = 0
  let last30dCount = 0
  let signupCents = 0
  let subscriptionCents = 0
  let premiumToolsCents = 0
  let discountTotalCents = 0
  let promoPaymentsCount = 0

  for (const row of data ?? []) {
    totalCollectedCents += row.amount_cents

    if (
      (typeof row.promo_code === "string" && row.promo_code.trim()) ||
      (typeof row.discount_cents === "number" && row.discount_cents > 0)
    ) {
      if (typeof row.discount_cents === "number" && row.discount_cents > 0) {
        discountTotalCents += row.discount_cents
      }

      promoPaymentsCount += 1
    }

    if (row.checkout_type === "hostiv_signup") {
      signupCents += row.amount_cents
    } else if (row.checkout_type === "hostiv_subscription") {
      subscriptionCents += row.amount_cents
    } else if (row.checkout_type === "hostiv_premium_tools") {
      premiumToolsCents += row.amount_cents
    }

    if (now - new Date(row.paid_at).getTime() <= last30dMs) {
      last30dCents += row.amount_cents
      last30dCount += 1
    }
  }

  return {
    summary: {
      total_collected_eur: Math.round(totalCollectedCents) / 100,
      payments_count: payments.length,
      last_30d_eur: Math.round(last30dCents) / 100,
      last_30d_count: last30dCount,
      signup_eur: Math.round(signupCents) / 100,
      subscription_eur: Math.round(subscriptionCents) / 100,
      premium_tools_eur: Math.round(premiumToolsCents) / 100,
      discount_total_eur: Math.round(discountTotalCents) / 100,
      promo_payments_count: promoPaymentsCount
    },
    payments
  }
}

export async function getPlatformAdminRevenueBreakdown(): Promise<PlatformAdminRevenueBreakdown> {
  const stats = await getPlatformAdminDashboardStats()

  const starterAnnual = stats.starter_active * planPriceEur("starter")
  const proAnnual = stats.pro_active * planPriceEur("pro")
  const starterPlusAnnual = stats.starter_plus_active * premiumAddonPriceEur()

  return {
    starter_active: stats.starter_active,
    pro_active: stats.pro_active,
    starter_plus_active: stats.starter_plus_active,
    starter_annual_eur: starterAnnual,
    pro_annual_eur: proAnnual,
    starter_plus_annual_eur: starterPlusAnnual,
    estimated_total_annual_eur: stats.estimated_annual_revenue_eur,
    note:
      "Estimation basée sur les forfaits actifs (Starter 49 €, Pro 99 €, Starter+ 30 €). Les paiements réels Stripe ne sont pas historisés en base."
  }
}

export async function listPlatformAdminSignups(): Promise<PlatformAdminSignupRow[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_pending_signups")
    .select(
      "id, email, full_name, property_name, property_slug, subscription_plan, status, created_at, expires_at, completed_at"
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    property_name: row.property_name,
    property_slug: row.property_slug,
    subscription_plan: row.subscription_plan === "starter" ? "starter" : "pro",
    status: row.status as PlatformAdminSignupRow["status"],
    created_at: row.created_at,
    expires_at: row.expires_at,
    completed_at: row.completed_at
  }))
}

export async function getPlatformAdminReservationsSummary(): Promise<PlatformAdminReservationsSummary> {
  const supabase = requireSupabaseAdmin()
  const since30d = daysAgo(30)

  const { data, error } = await supabase
    .from("booking_reservations")
    .select("status, total_eur, created_at")

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  const rows = data ?? []
  const confirmed = rows.filter((row) => row.status === "confirmed")
  const cancelled = rows.filter((row) => row.status === "cancelled")
  const gmv = confirmed.reduce((sum, row) => sum + Number(row.total_eur || 0), 0)
  const last30d = confirmed.filter((row) => row.created_at >= since30d)
  const last30dGmv = last30d.reduce((sum, row) => sum + Number(row.total_eur || 0), 0)

  return {
    total: rows.length,
    confirmed: confirmed.length,
    cancelled: cancelled.length,
    gmv_eur: Math.round(gmv * 100) / 100,
    avg_booking_eur:
      confirmed.length > 0 ? Math.round((gmv / confirmed.length) * 100) / 100 : 0,
    last_30d_count: last30d.length,
    last_30d_gmv_eur: Math.round(last30dGmv * 100) / 100
  }
}

export async function listPlatformAdminReservations(limit = 100): Promise<PlatformAdminReservationRow[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("booking_reservations")
    .select(
      "id, property_slug, status, guest_first_name, guest_last_name, guest_email, arrival_date, departure_date, stay_nights, total_eur, created_at, properties(brand_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  return (data ?? []).map((row) => {
    const properties = row.properties as { brand_name?: string } | null

    return {
      id: row.id,
      property_slug: row.property_slug,
      brand_name: properties?.brand_name ?? row.property_slug,
      status: row.status,
      guest_name: `${row.guest_first_name} ${row.guest_last_name}`.trim(),
      guest_email: row.guest_email,
      arrival_date: row.arrival_date,
      departure_date: row.departure_date,
      stay_nights: row.stay_nights,
      total_eur: Number(row.total_eur),
      created_at: row.created_at
    }
  })
}

export async function listPlatformAdminGuestReviews(limit = 100): Promise<PlatformAdminGuestReviewRow[]> {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("guest_reviews")
    .select(
      "id, property_slug, guest_first_name, guest_last_name, rating, comment, arrival_date, departure_date, created_at, properties(brand_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  return (data ?? []).map((row) => {
    const properties = row.properties as { brand_name?: string } | null

    return {
      id: row.id,
      property_slug: row.property_slug,
      brand_name: properties?.brand_name ?? row.property_slug,
      guest_name: `${row.guest_first_name} ${row.guest_last_name}`.trim(),
      rating: row.rating,
      comment: row.comment,
      arrival_date: row.arrival_date,
      departure_date: row.departure_date,
      created_at: row.created_at
    }
  })
}

export async function listPlatformAdminAlerts(): Promise<PlatformAdminAlertRow[]> {
  const supabase = requireSupabaseAdmin()
  const now = new Date()
  const nowIso = now.toISOString()
  const in30d = daysFromNow(30)

  const [members, properties, pendingSignups] = await Promise.all([
    listPlatformAdminMembers(),
    listPlatformAdminSites(),
    listPlatformAdminSignups()
  ])

  const alerts: PlatformAdminAlertRow[] = []

  for (const member of members) {
    if (member.subscription_active && member.paid_until) {
      const end = new Date(member.paid_until)

      if (!Number.isNaN(end.getTime()) && end.toISOString() <= in30d && end > now) {
        alerts.push({
          id: `expiring-${member.user_id}`,
          kind: "subscription_expiring",
          severity: "warning",
          title: "Forfait expire bientôt",
          detail: `${member.email} — fin le ${member.paid_until.slice(0, 10)}`,
          property_slug: member.property_slug,
          member_email: member.email,
          due_at: member.paid_until
        })
      }
    }

    if (!member.subscription_active && member.paid_until) {
      alerts.push({
        id: `expired-${member.user_id}`,
        kind: "subscription_expired",
        severity: "critical",
        title: "Forfait expiré",
        detail: `${member.email} — expiré le ${member.paid_until.slice(0, 10)}`,
        property_slug: member.property_slug,
        member_email: member.email,
        due_at: member.paid_until
      })
    }
  }

  for (const site of properties) {
    if (site.subscription_active && !site.published) {
      alerts.push({
        id: `unpublished-${site.id}`,
        kind: "unpublished_active_sub",
        severity: "info",
        title: "Site non publié",
        detail: `${site.brand_name} (${site.slug}) — forfait actif mais site en brouillon`,
        property_slug: site.slug,
        member_email: site.owner_email,
        due_at: null
      })
    }

    if (site.subscription_active && !site.stripe_account_id) {
      alerts.push({
        id: `stripe-${site.id}`,
        kind: "stripe_missing",
        severity: "warning",
        title: "Stripe Connect manquant",
        detail: `${site.brand_name} (${site.slug}) — paiements en ligne non configurés`,
        property_slug: site.slug,
        member_email: site.owner_email,
        due_at: null
      })
    }
  }

  for (const signup of pendingSignups.filter((row) => row.status === "pending")) {
    if (signup.expires_at > nowIso) {
      alerts.push({
        id: `signup-${signup.id}`,
        kind: "pending_signup",
        severity: "info",
        title: "Inscription en attente de paiement",
        detail: `${signup.email} — ${signup.property_name} (${signup.property_slug})`,
        property_slug: signup.property_slug,
        member_email: signup.email,
        due_at: signup.expires_at
      })
    }
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 }

  alerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]

    if (severityDiff !== 0) {
      return severityDiff
    }

    if (a.due_at && b.due_at) {
      return a.due_at.localeCompare(b.due_at)
    }

    return a.title.localeCompare(b.title)
  })

  return alerts
}
