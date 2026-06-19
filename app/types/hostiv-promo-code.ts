export type HostivPromoCode = {
  id: string
  title: string
  description: string
  code: string
  valid_from: string
  valid_until: string
  discount_percent: number
  allowed_emails: string
  created_at: string
  updated_at: string
}

export type HostivPromoCodeUpsertBody = {
  title: string
  description?: string
  code?: string
  generate_code?: boolean
  valid_from: string
  valid_until: string
  discount_percent: number
  allowed_emails?: string
}

export type HostivPromoCodeValidateContext =
  | "hostiv_signup"
  | "hostiv_subscription"
  | "hostiv_premium_tools"
  | "hostiv_property_add"

export type HostivPromoCodeValidationResult = {
  valid: true
  promo_code_id: string
  code: string
  title: string
  discount_percent: number
  original_amount_cents: number
  discount_cents: number
  final_amount_cents: number
  is_free_checkout: boolean
}
