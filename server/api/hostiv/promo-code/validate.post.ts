import type { HostivPromoCodeValidateContext } from "../../../app/types/hostiv-promo-code"
import { resolveHostivCheckoutOriginalAmountCents } from "../../../utils/hostiv-checkout-amount"
import { validateHostivPromoCode } from "../../../utils/hostiv-promo-code"

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    code?: string
    email?: string
    context?: HostivPromoCodeValidateContext
    subscription_plan?: string | null
  }>(event)

  const code = String(body?.code || "").trim()
  const email = String(body?.email || "").trim()
  const context = body?.context

  if (!code) {
    throw createError({ statusCode: 400, message: "Indiquez un code promo." })
  }

  if (!email) {
    throw createError({ statusCode: 400, message: "Indiquez un e-mail." })
  }

  if (
    context !== "hostiv_signup" &&
    context !== "hostiv_subscription" &&
    context !== "hostiv_premium_tools" &&
    context !== "hostiv_property_add"
  ) {
    throw createError({ statusCode: 400, message: "Contexte de paiement invalide." })
  }

  const originalAmountCents = resolveHostivCheckoutOriginalAmountCents({
    context,
    plan: body?.subscription_plan
  })

  return validateHostivPromoCode({
    code,
    email,
    originalAmountCents
  })
})
