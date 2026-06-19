import {
  promoCodeSessionMetadata,
  resolveCheckoutPromo
} from "./hostiv-promo-code"

export async function buildHostivCheckoutUnitAmount(input: {
  promoCode?: string | null
  email: string
  originalAmountCents: number
}) {
  const promo = await resolveCheckoutPromo({
    promoCode: input.promoCode,
    email: input.email,
    originalAmountCents: input.originalAmountCents
  })

  return {
    unitAmountCents: promo?.final_amount_cents ?? input.originalAmountCents,
    promo
  }
}

export function mergeCheckoutMetadata(
  base: Record<string, string>,
  promo: Awaited<ReturnType<typeof resolveCheckoutPromo>>
) {
  if (!promo) {
    return base
  }

  return {
    ...base,
    ...promoCodeSessionMetadata(promo)
  }
}
