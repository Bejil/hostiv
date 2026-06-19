export type PropertyCohostMember = {
  id: string
  user_id: string
  email: string
  created_at: string
}

export type PropertyCohostInvitation = {
  id: string
  email: string
  created_at: string
  expires_at: string
}

export type PropertyCohostsPayload = {
  members: PropertyCohostMember[]
  invitations: PropertyCohostInvitation[]
}

export type PropertyAdminAccessRole = "owner" | "cohost" | "platform_admin"

export type PropertyAdminAccess = {
  role: PropertyAdminAccessRole
  is_primary_owner: boolean
  can_manage_cohosts: boolean
}

export type CohostInviteValidatePayload = {
  valid: boolean
  slug?: string
  brand_name?: string
  email?: string
  expired?: boolean
  already_accepted?: boolean
  account_exists?: boolean
}

export type CohostInviteRegisterBody = {
  token: string
  first_name: string
  last_name?: string
  password: string
}
