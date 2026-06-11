import type { PropertyAdminRecord } from "../types/property-admin"
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
