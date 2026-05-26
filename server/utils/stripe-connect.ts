import type Stripe from "stripe"
import type { StripeConnectStatus } from "../../app/types/stripe-connect"
import {
  getPropertyStripeByAccountId,
  getPropertyStripeBySlug,
  setPropertyStripeAccountId,
  updatePropertyStripeStatus,
  type PropertyStripeRow
} from "./property-stripe-repository"
import { getStripeClient } from "./stripe-client"

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
  requirements?: StripeConnectStatus["requirements"]
): StripeConnectStatus {
  const chargesEnabled = row.stripe_charges_enabled

  return {
    accountId: row.stripe_account_id,
    chargesEnabled,
    payoutsEnabled: row.stripe_payouts_enabled,
    detailsSubmitted: row.stripe_details_submitted,
    onboardingCompletedAt: row.stripe_onboarding_completed_at,
    paymentsReady: Boolean(row.stripe_account_id && chargesEnabled),
    requirements: requirements ?? {
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
      disabledReason: null
    },
    platformFeePercent: normalizePlatformFeePercent(platformFeePercent)
  }
}

export async function syncStripeAccountToProperty(
  stripe: Stripe,
  slug: string,
  accountId: string
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

  return stripeStatusFromRow(row, 0, requirements)
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

  if (!row.stripe_account_id) {
    return stripeStatusFromRow(row, platformFeePercent)
  }

  const stripe = getStripeClient(stripeSecretKey)
  const status = await syncStripeAccountToProperty(stripe, slug, row.stripe_account_id)

  return { ...status, platformFeePercent: normalizePlatformFeePercent(platformFeePercent) }
}

export function buildStripeConnectAdminUrls(event: Parameters<typeof getRequestURL>[0], slug: string) {
  const origin = getRequestURL(event).origin
  const adminPath = `/${slug.trim().toLowerCase()}/admin`

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
    return row.stripe_account_id
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
