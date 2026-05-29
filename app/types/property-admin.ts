import type { PropertyCalendarConfig, PropertySiteContent, PropertySiteRecord } from "./property-site"
import type { HostivSubscriptionAccess } from "../utils/hostiv-subscription-access"

export type PropertyAdminRecord = PropertySiteRecord & {
  calendar_config: PropertyCalendarConfig
  /** Présent sur GET admin uniquement — non persisté */
  subscription_access?: HostivSubscriptionAccess
}

export type PropertyAdminUpdatePayload = PropertyAdminRecord

export type PropertyAdminUploadResult = {
  path: string
  storageKey: string
  publicUrl: string
}
