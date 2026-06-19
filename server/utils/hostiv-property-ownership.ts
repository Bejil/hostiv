import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { countOwnedPropertiesForUser } from "./hostiv-properties"

/** Un compte avec au moins un logement possédé doit payer le forfait Pro pour chaque logement ajouté. */
export async function requiresProPlanForAdditionalProperty(userId: string): Promise<boolean> {
  return (await countOwnedPropertiesForUser(userId)) >= 1
}

export async function assertProPlanForAdditionalProperty(userId: string, plan: unknown) {
  if (!(await requiresProPlanForAdditionalProperty(userId))) {
    return
  }

  if (normalizeHostivSubscriptionPlan(plan) !== "pro") {
    throw createError({
      statusCode: 403,
      message:
        "Le forfait Starter est limité à 1 logement. Passez au forfait Pro pour ajouter un logement."
    })
  }
}
