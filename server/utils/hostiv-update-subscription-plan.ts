import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import type { HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { requireSupabaseAdmin } from "./supabase"

export async function updateHostivSubscriptionPlan(
  userId: string,
  propertySlug: string,
  rawPlan: unknown
): Promise<HostivSubscriptionPlan> {
  const plan = normalizeHostivSubscriptionPlan(rawPlan)
  const slug = propertySlug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { error: accountError } = await supabase
    .from("hostiv_accounts")
    .update({ subscription_plan: plan })
    .eq("id", userId)

  if (accountError) {
    console.error("[hostiv-plan] account update:", accountError.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de mettre à jour votre forfait."
    })
  }

  const { error: propertyError } = await supabase
    .from("properties")
    .update({ subscription_plan: plan })
    .eq("slug", slug)
    .eq("owner_user_id", userId)

  if (propertyError) {
    console.error("[hostiv-plan] property update:", propertyError.message)
    throw createError({
      statusCode: 502,
      message: "Impossible de synchroniser le forfait sur votre site."
    })
  }

  return plan
}
