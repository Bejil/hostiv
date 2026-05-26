export type StripeConnectStatus = {
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  onboardingCompletedAt: string | null
  /** Paiements carte possibles sur le site public */
  paymentsReady: boolean
  requirements: {
    currentlyDue: string[]
    eventuallyDue: string[]
    pastDue: string[]
    disabledReason: string | null
  }
  platformFeePercent: number
}

export type StripeConnectOnboardResponse = {
  url: string
}

export type StripeConnectDashboardResponse = {
  url: string
}
