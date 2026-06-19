import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertyAdminAccess } from "../types/property-cohost"
import type { HostivSubscriptionAccess } from "./hostiv-subscription-access"

export function withPropertyAdminSubscriptionAccess(
  record: PropertyAdminRecord,
  access: HostivSubscriptionAccess | null | undefined
): PropertyAdminRecord {
  if (!access) {
    return record
  }

  return {
    ...record,
    subscription_access: access
  }
}

export function withPropertyAdminAccess(
  record: PropertyAdminRecord,
  access: PropertyAdminAccess | null | undefined
): PropertyAdminRecord {
  if (!access) {
    return record
  }

  return {
    ...record,
    admin_access: access
  }
}
