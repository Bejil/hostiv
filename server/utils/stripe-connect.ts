import type Stripe from "stripe"
import type { StripeConnectStatus, StripeKeyMode } from "../../app/types/stripe-connect"
import {
  clearPropertyStripeConnect,
  getPropertyStripeByAccountId,
  getPropertyStripeBySlug,
  setPropertyStripeAccountId,
  updatePropertyStripeStatus,
  type PropertyStripeRow
} from "./property-stripe-repository"
import { getPropertyOwnerUserId } from "./property-admin-repository"
import { getPropertySiteBySlug } from "./property-site-repository"
import { getStripeClient } from "./stripe-client"
import { getUserEmailById, sendHostivStripeConnectReadyEmail } from "./transactional-email"

export function normalizePlatformFeePercent(value: unknown): number {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  if (parsed > 100) {
    return 100
  }

  return parsed
}

export function getStripeKeyMode(secretKey: string): StripeKeyMode {
  const key = secretKey.trim()

  if (key.startsWith("sk_live_")) {
    return "live"
  }

  if (key.startsWith("sk_test_")) {
    return "test"
  }

  return "unknown"
}

function isStripeConnectAccountUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  const stripeError = error as { code?: string; message?: string }
  const code = stripeError.code ?? ""
  const message = (stripeError.message ?? "").toLowerCase()

  return (
    code === "account_invalid" ||
    message.includes("no such account") ||
    message.includes("does not have access to account") ||
    message.includes("test mode") ||
    message.includes("live mode")
  )
}

export function computePlatformFeeCents(amountCents: number, feePercent: number): number {
  const percent = normalizePlatformFeePercent(feePercent)

  if (percent <= 0 || amountCents <= 0) {
    return 0
  }

  const fee = Math.round((amountCents * percent) / 100)

  return Math.min(Math.max(fee, 0), amountCents - 1)
}

function mapRequirements(account: Stripe.Account): StripeConnectStatus["requirements"] {
  const requirements = account.requirements

  return {
    currentlyDue: requirements?.currently_due ?? [],
    eventuallyDue: requirements?.eventually_due ?? [],
    pastDue: requirements?.past_due ?? [],
    disabledReason: requirements?.disabled_reason ?? null
  }
}

export function stripeStatusFromRow(
  row: PropertyStripeRow,
  platformFeePercent: number,
  options?: {
    requirements?: StripeConnectStatus["requirements"]
    secretKey?: string
    connectModeMismatch?: boolean
  }
): StripeConnectStatus {
  const chargesEnabled = row.stripe_charges_enabled

  return {
    accountId: row.stripe_account_id,
    chargesEnabled,
    payoutsEnabled: row.stripe_payouts_enabled,
    detailsSubmitted: row.stripe_details_submitted,
    onboardingCompletedAt: row.stripe_onboarding_completed_at,
    paymentsReady: Boolean(row.stripe_account_id && chargesEnabled),
    requirements: options?.requirements ?? {
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
      disabledReason: null
    },
    platformFeePercent: normalizePlatformFeePercent(platformFeePercent),
    connectKeyMode: options?.secretKey ? getStripeKeyMode(options.secretKey) : "unknown",
    connectModeMismatch: options?.connectModeMismatch ?? false
  }
}

export async function syncStripeAccountToProperty(
  stripe: Stripe,
  slug: string,
  accountId: string,
  platformFeePercent = 0,
  secretKey = ""
): Promise<StripeConnectStatus> {
  const account = await stripe.accounts.retrieve(accountId)
  const existing = await getPropertyStripeBySlug(slug)
  const requirements = mapRequirements(account)
  const chargesEnabled = Boolean(account.charges_enabled)
  const wasChargesEnabled = Boolean(existing?.stripe_charges_enabled)
  const onboardingCompletedAt =
    existing?.stripe_onboarding_completed_at ??
    (chargesEnabled && !wasChargesEnabled ? new Date().toISOString() : null)

  const row = await updatePropertyStripeStatus(slug, {
    stripe_account_id: accountId,
    stripe_charges_enabled: chargesEnabled,
    stripe_payouts_enabled: Boolean(account.payouts_enabled),
    stripe_details_submitted: Boolean(account.details_submitted),
    stripe_onboarding_completed_at:
      existing?.stripe_onboarding_completed_at ?? onboardingCompletedAt
  })

  if (chargesEnabled && !wasChargesEnabled) {
    const ownerUserId = await getPropertyOwnerUserId(slug)
    const ownerEmail = ownerUserId ? await getUserEmailById(ownerUserId) : null

    if (ownerEmail) {
      const site = await getPropertySiteBySlug(slug, { publishedOnly: false })
      const brandName = site?.brand_name?.trim() || slug

      void sendHostivStripeConnectReadyEmail({
        to: ownerEmail,
        slug,
        brandName
      })
    }
  }

  return stripeStatusFromRow(row, platformFeePercent, { requirements, secretKey })
}

/** Supprime le compte Connect en base s’il n’existe pas dans le mode des clés actuelles. */
export async function disconnectStripeConnectIfUnavailable(
  stripe: Stripe,
  slug: string
): Promise<boolean> {
  const row = await getPropertyStripeBySlug(slug)

  if (!row?.stripe_account_id) {
    return false
  }

  try {
    await stripe.accounts.retrieve(row.stripe_account_id)
    return false
  } catch (error) {
    if (!isStripeConnectAccountUnavailable(error)) {
      throw error
    }

    await clearPropertyStripeConnect(slug)
    return true
  }
}

export async function refreshPropertyStripeStatus(
  stripeSecretKey: string,
  slug: string,
  platformFeePercent: number
): Promise<StripeConnectStatus> {
  const row = await getPropertyStripeBySlug(slug)

  if (!row) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const statusOptions = { secretKey: stripeSecretKey }

  if (!row.stripe_account_id) {
    return stripeStatusFromRow(row, platformFeePercent, statusOptions)
  }

  const stripe = getStripeClient(stripeSecretKey)

  try {
    return await syncStripeAccountToProperty(
      stripe,
      slug,
      row.stripe_account_id,
      platformFeePercent,
      stripeSecretKey
    )
  } catch (error) {
    if (!isStripeConnectAccountUnavailable(error)) {
      throw error
    }

    await clearPropertyStripeConnect(slug)
    const cleared = await getPropertyStripeBySlug(slug)

    if (!cleared) {
      throw createError({ statusCode: 404, message: "Site introuvable." })
    }

    return stripeStatusFromRow(cleared, platformFeePercent, {
      ...statusOptions,
      connectModeMismatch: true
    })
  }
}

export function buildStripeConnectAdminUrls(
  event: Parameters<typeof getRequestURL>[0],
  slug: string,
  configuredSiteUrl = ""
) {
  const requestOrigin = getRequestURL(event).origin
  const configuredSite = configuredSiteUrl.trim().replace(/\/$/, "")
  const normalizedSlug = slug.trim().toLowerCase()

  let origin = requestOrigin

  if (configuredSite) {
    try {
      const siteOrigin = new URL(
        configuredSite.includes("://") ? configuredSite : `https://${configuredSite}`
      ).origin

      if (siteOrigin.startsWith("http")) {
        origin = siteOrigin
      }
    } catch {
      /* URL publique invalide — repli sur l’origine de la requête */
    }
  }

  const adminPath = `/${normalizedSlug}/admin`

  return {
    returnUrl: `${origin}${adminPath}?section=payouts&stripe=return`,
    refreshUrl: `${origin}${adminPath}?section=payouts&stripe=refresh`
  }
}

export async function ensureExpressConnectAccount(
  stripe: Stripe,
  slug: string,
  ownerEmail: string | null | undefined
): Promise<string> {
  const row = await getPropertyStripeBySlug(slug)

  if (!row) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  if (row.stripe_account_id) {
    try {
      await stripe.accounts.retrieve(row.stripe_account_id)
      return row.stripe_account_id
    } catch (error) {
      if (!isStripeConnectAccountUnavailable(error)) {
        throw error
      }

      await clearPropertyStripeConnect(slug)
    }
  }

  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email: ownerEmail?.trim() || undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    metadata: {
      property_slug: slug.trim().toLowerCase()
    }
  })

  const updated = await setPropertyStripeAccountId(slug, account.id)

  await updatePropertyStripeStatus(slug, {
    stripe_account_id: account.id,
    stripe_charges_enabled: Boolean(account.charges_enabled),
    stripe_payouts_enabled: Boolean(account.payouts_enabled),
    stripe_details_submitted: Boolean(account.details_submitted),
    stripe_onboarding_completed_at: updated.stripe_onboarding_completed_at
  })

  return account.id
}

export async function createConnectOnboardingLink(
  stripe: Stripe,
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl
  })

  if (!link.url) {
    throw createError({
      statusCode: 502,
      message: "Stripe n’a pas renvoyé d’URL d’onboarding."
    })
  }

  return link.url
}

export async function createConnectDashboardLink(stripe: Stripe, accountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId)

  if (!link.url) {
    throw createError({
      statusCode: 502,
      message: "Stripe n’a pas renvoyé de lien tableau de bord."
    })
  }

  return link.url
}

export async function syncStripeAccountById(
  stripe: Stripe,
  accountId: string
): Promise<void> {
  const row = await getPropertyStripeByAccountId(accountId)

  if (!row) {
    return
  }

  await syncStripeAccountToProperty(stripe, row.slug, accountId)
}

export async function assertStripeReadyForPublish(slug: string) {
  const row = await getPropertyStripeBySlug(slug)

  if (!row) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  if (!row.stripe_account_id || !row.stripe_charges_enabled) {
    throw createError({
      statusCode: 422,
      message:
        "Configurez Stripe Connect dans Comptabilité avant de publier votre site. Les paiements par carte doivent être activés."
    })
  }
}
