import type { HostivPromoCodeValidateContext, HostivPromoCodeValidationResult } from "../types/hostiv-promo-code"

export function useHostivPromoCode(options: {
  context: HostivPromoCodeValidateContext
  email: Ref<string> | ComputedRef<string>
  subscriptionPlan?: Ref<string | null | undefined> | ComputedRef<string | null | undefined>
}) {
  const code = ref("")
  const applied = ref<HostivPromoCodeValidationResult | null>(null)
  const validating = ref(false)
  const error = ref("")

  const promoCodeForCheckout = computed(() => applied.value?.code ?? "")

  const finalAmountEur = computed(() =>
    applied.value ? applied.value.final_amount_cents / 100 : null
  )

  const originalAmountEur = computed(() =>
    applied.value ? applied.value.original_amount_cents / 100 : null
  )

  const discountAmountEur = computed(() =>
    applied.value ? applied.value.discount_cents / 100 : null
  )

  function clearPromo() {
    applied.value = null
    error.value = ""
  }

  function resetPromoState() {
    code.value = ""
    clearPromo()
  }

  async function applyPromoCode() {
    const trimmedCode = code.value.trim()

    if (!trimmedCode) {
      error.value = "Indiquez un code promo."
      return false
    }

    const email = unref(options.email).trim()

    if (!email.includes("@")) {
      error.value = "Indiquez d’abord votre adresse e-mail."
      return false
    }

    validating.value = true
    error.value = ""

    try {
      applied.value = await $fetch<HostivPromoCodeValidationResult>("/api/hostiv/promo-code/validate", {
        method: "POST",
        body: {
          code: trimmedCode,
          email,
          context: options.context,
          subscription_plan: unref(options.subscriptionPlan) ?? null
        }
      })

      code.value = applied.value.code

      return true
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }

      applied.value = null
      error.value = e.data?.message || e.message || "Code promo invalide."

      return false
    } finally {
      validating.value = false
    }
  }

  watch(
    () => [unref(options.email), unref(options.subscriptionPlan)] as const,
    () => {
      clearPromo()
    }
  )

  return reactive({
    code,
    applied,
    validating,
    error,
    promoCodeForCheckout,
    finalAmountEur,
    originalAmountEur,
    discountAmountEur,
    applyPromoCode,
    clearPromo,
    resetPromoState
  })
}
