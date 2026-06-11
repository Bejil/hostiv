import type { StripeConnectStatus } from "../types/stripe-connect"

export function isProductionAdminHost() {
  if (import.meta.server) {
    return false
  }

  const host = window.location.hostname

  return host !== "localhost" && host !== "127.0.0.1"
}

export function stripeConnectNeedsAttention(
  status: StripeConnectStatus | null,
  options?: {
    hasLoadError?: boolean
    isProductionHost?: boolean
  }
) {
  if (options?.hasLoadError) {
    return true
  }

  if (!status) {
    return false
  }

  const isProductionHost = options?.isProductionHost ?? isProductionAdminHost()

  if (isProductionHost && status.connectKeyMode === "test") {
    return true
  }

  if (status.connectModeMismatch) {
    return true
  }

  return !status.paymentsReady
}
