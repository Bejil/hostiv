export type StripeKeyMode = "test" | "live" | "unknown"

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
  /** Mode des clés serveur (sk_test_ / sk_live_). */
  connectKeyMode: StripeKeyMode
  /** Compte Connect test encore en base alors que les clés sont en Live (ou l’inverse). */
  connectModeMismatch: boolean
}

export type StripeConnectOnboardResponse = {
  url: string
}

export type StripeConnectDashboardResponse = {
  url: string
}
