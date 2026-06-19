import type { HostivSubscriptionPlan } from "../utils/hostiv-subscription-plan"

export type PlatformAdminSectionId =
  | "dashboard"
  | "sites"
  | "members"
  | "revenue"
  | "promo-codes"
  | "reservations"
  | "signups"
  | "guest-reviews"
  | "alerts"

export type PlatformAdminMe = {
  email: string
  full_name: string | null
}

export type PlatformAdminDashboardRecentPayment = {
  id: string
  paid_at: string
  checkout_type: "hostiv_signup" | "hostiv_subscription" | "hostiv_premium_tools"
  product_label: string
  member_email: string | null
  amount_eur: number
}

export type PlatformAdminDashboardStats = {
  sites_total: number
  sites_published: number
  sites_draft: number
  subscriptions_active: number
  subscriptions_expired: number
  subscriptions_unpaid: number
  starter_active: number
  pro_active: number
  starter_plus_active: number
  members_total: number
  pending_signups: number
  reservations_total: number
  reservations_confirmed: number
  reservations_gmv_eur: number
  guest_reviews_total: number
  guest_reviews_avg_rating: number | null
  estimated_annual_revenue_eur: number
  revenue_total_eur: number
  revenue_last_30d_eur: number
  recent_payments: PlatformAdminDashboardRecentPayment[]
  new_members_30d: number
  new_sites_30d: number
  stripe_connect_count: number
  stripe_missing_count: number
  members_mom_pct: number | null
  sites_mom_pct: number | null
  subscriptions_active_mom_pct: number | null
  revenue_mom_pct: number | null
}

export type PlatformAdminSiteRow = {
  id: string
  slug: string
  brand_name: string
  published: boolean
  subscription_plan: HostivSubscriptionPlan
  owner_email: string | null
  owner_full_name: string | null
  owner_user_id: string | null
  paid_until: string | null
  subscription_active: boolean
  has_starter_plus: boolean
  stripe_account_id: string | null
  reservations_count: number
  reservations_gmv_eur: number
  guest_reviews_count: number
  guest_reviews_avg_rating: number | null
  created_at: string
  updated_at: string
}

export type PlatformAdminMemberRow = {
  user_id: string
  email: string
  full_name: string | null
  subscription_plan: HostivSubscriptionPlan
  paid_until: string | null
  subscription_active: boolean
  premium_tools_until: string | null
  has_starter_plus: boolean
  property_slug: string | null
  property_published: boolean | null
  stripe_account_id: string | null
  created_at: string
  subscription_started_at: string | null
}

export type PlatformAdminMemberDetail = PlatformAdminMemberRow & {
  first_name: string
  last_name: string
}

export type PlatformAdminRevenueBreakdown = {
  starter_active: number
  pro_active: number
  starter_plus_active: number
  starter_annual_eur: number
  pro_annual_eur: number
  starter_plus_annual_eur: number
  estimated_total_annual_eur: number
  note: string
}

export type PlatformAdminRevenuePaymentRow = {
  id: string
  paid_at: string
  checkout_type: "hostiv_signup" | "hostiv_subscription" | "hostiv_premium_tools"
  product_label: string
  subscription_plan: HostivSubscriptionPlan | null
  member_email: string | null
  property_slug: string | null
  amount_eur: number
  amount_subtotal_eur: number | null
  discount_eur: number | null
  promo_code: string | null
  currency: string
}

export type PlatformAdminRevenueReport = {
  summary: {
    total_collected_eur: number
    payments_count: number
    last_30d_eur: number
    last_30d_count: number
    signup_eur: number
    subscription_eur: number
    premium_tools_eur: number
    discount_total_eur: number
    promo_payments_count: number
  }
  payments: PlatformAdminRevenuePaymentRow[]
}

export type PlatformAdminSignupRow = {
  id: string
  email: string
  full_name: string
  property_name: string
  property_slug: string
  subscription_plan: HostivSubscriptionPlan
  status: "pending" | "completed" | "failed"
  created_at: string
  expires_at: string
  completed_at: string | null
}

export type PlatformAdminReservationRow = {
  id: string
  property_slug: string
  brand_name: string
  status: string
  guest_name: string
  guest_email: string
  arrival_date: string
  departure_date: string
  stay_nights: number
  total_eur: number
  created_at: string
}

export type PlatformAdminGuestReviewRow = {
  id: string
  property_slug: string
  brand_name: string
  guest_name: string
  rating: number
  comment: string
  arrival_date: string
  departure_date: string
  created_at: string
}

export type PlatformAdminAlertRow = {
  id: string
  kind:
    | "subscription_expiring"
    | "subscription_expired"
    | "unpublished_active_sub"
    | "stripe_missing"
    | "pending_signup"
  severity: "info" | "warning" | "critical"
  title: string
  detail: string
  property_slug: string | null
  member_email: string | null
  due_at: string | null
}

export type PlatformAdminReservationsSummary = {
  total: number
  confirmed: number
  cancelled: number
  gmv_eur: number
  avg_booking_eur: number
  last_30d_count: number
  last_30d_gmv_eur: number
}
