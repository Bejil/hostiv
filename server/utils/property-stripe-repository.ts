import { requireSupabaseAdmin } from "./supabase"

export type PropertyStripeRow = {
  id: string
  slug: string
  stripe_account_id: string | null
  stripe_charges_enabled: boolean
  stripe_payouts_enabled: boolean
  stripe_details_submitted: boolean
  stripe_onboarding_completed_at: string | null
}

const STRIPE_SELECT =
  "id, slug, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted, stripe_onboarding_completed_at"

function mapStripeRow(row: Record<string, unknown>): PropertyStripeRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    stripe_account_id:
      typeof row.stripe_account_id === "string" ? row.stripe_account_id : null,
    stripe_charges_enabled: Boolean(row.stripe_charges_enabled),
    stripe_payouts_enabled: Boolean(row.stripe_payouts_enabled),
    stripe_details_submitted: Boolean(row.stripe_details_submitted),
    stripe_onboarding_completed_at:
      typeof row.stripe_onboarding_completed_at === "string"
        ? row.stripe_onboarding_completed_at
        : null
  }
}

export async function getPropertyStripeBySlug(slug: string): Promise<PropertyStripeRow | null> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select(STRIPE_SELECT)
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    console.error("[property-stripe] read:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de charger le statut Stripe."
    })
  }

  if (!data) {
    return null
  }

  return mapStripeRow(data as Record<string, unknown>)
}

export async function getPropertyStripeByAccountId(
  accountId: string
): Promise<PropertyStripeRow | null> {
  const normalizedAccountId = accountId.trim()

  if (!normalizedAccountId) {
    return null
  }

  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .select(STRIPE_SELECT)
    .eq("stripe_account_id", normalizedAccountId)
    .maybeSingle()

  if (error) {
    console.error("[property-stripe] by account:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de retrouver la propriété Stripe."
    })
  }

  if (!data) {
    return null
  }

  return mapStripeRow(data as Record<string, unknown>)
}

export type PropertyStripeStatusUpdate = {
  stripe_account_id?: string | null
  stripe_charges_enabled: boolean
  stripe_payouts_enabled: boolean
  stripe_details_submitted: boolean
  stripe_onboarding_completed_at?: string | null
}

export async function updatePropertyStripeStatus(
  slug: string,
  update: PropertyStripeStatusUpdate
): Promise<PropertyStripeRow> {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const row: Record<string, unknown> = {
    stripe_charges_enabled: update.stripe_charges_enabled,
    stripe_payouts_enabled: update.stripe_payouts_enabled,
    stripe_details_submitted: update.stripe_details_submitted
  }

  if (update.stripe_account_id !== undefined) {
    row.stripe_account_id = update.stripe_account_id
  }

  if (update.stripe_onboarding_completed_at !== undefined) {
    row.stripe_onboarding_completed_at = update.stripe_onboarding_completed_at
  }

  const { data, error } = await supabase
    .from("properties")
    .update(row)
    .eq("slug", normalizedSlug)
    .select(STRIPE_SELECT)
    .single()

  if (error) {
    console.error("[property-stripe] update:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de mettre à jour le statut Stripe."
    })
  }

  return mapStripeRow(data as Record<string, unknown>)
}

export async function setPropertyStripeAccountId(
  slug: string,
  accountId: string
): Promise<PropertyStripeRow> {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("properties")
    .update({ stripe_account_id: accountId })
    .eq("slug", normalizedSlug)
    .select(STRIPE_SELECT)
    .single()

  if (error) {
    console.error("[property-stripe] set account:", error.message)
    throw createError({
      statusCode: 502,
      message: "Impossible d’enregistrer le compte Stripe."
    })
  }

  return mapStripeRow(data as Record<string, unknown>)
}
