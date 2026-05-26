import type { HostivPricingPlanId } from "../data/hostivLanding"

export type HostivAccountModalMode = "signup" | "login"

const DEFAULT_PRICING_PLAN: HostivPricingPlanId = "pro"

export function useHostivAccountModal() {
  const open = useState("hostiv-account-modal-open", () => false)
  const mode = useState<HostivAccountModalMode>("hostiv-account-modal-mode", () => "signup")
  const selectedPlan = useState<HostivPricingPlanId>(
    "hostiv-account-modal-plan",
    () => DEFAULT_PRICING_PLAN
  )

  function openSignup(plan?: HostivPricingPlanId) {
    mode.value = "signup"
    if (plan) {
      selectedPlan.value = plan
    }
    open.value = true
  }

  function openLogin() {
    mode.value = "login"
    open.value = true
  }

  function close() {
    open.value = false
  }

  function setSelectedPlan(plan: HostivPricingPlanId) {
    selectedPlan.value = plan
  }

  return {
    open,
    mode,
    selectedPlan,
    openSignup,
    openLogin,
    close,
    setSelectedPlan
  }
}
