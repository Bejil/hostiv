import type { PropertyCalendarConfig, PropertySiteContent, PropertySiteRecord } from "./property-site"
import type { PropertyAdminAccess } from "./property-cohost"
import type { HostivSubscriptionAccess } from "../utils/hostiv-subscription-access"

export type PropertyAdminRecord = PropertySiteRecord & {
  calendar_config: PropertyCalendarConfig
  /** Présent sur GET admin uniquement — non persisté */
  subscription_access?: HostivSubscriptionAccess
  admin_access?: PropertyAdminAccess
}

export type PropertyAdminUpdatePayload = PropertyAdminRecord

export type PropertyAdminUploadResult = {
  path: string
  storageKey: string
  publicUrl: string
}
