import type { InjectionKey, Ref } from "vue"
import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteContent } from "../types/property-site"
import type { PropertyWelcomeGuide } from "../types/welcome-guide"
import type { HostivSubscriptionAccess } from "../utils/hostiv-subscription-access"
import type { LocalizedSiteListKey } from "../utils/site-content-locale"

export type AdminEditorContext = {
  slug: Ref<string>
  record: Ref<PropertyAdminRecord>
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl: (path: string) => string
  patch: (partial: Partial<PropertyAdminRecord>) => void
  replaceRecord: (value: PropertyAdminRecord) => void
  patchContent: <K extends keyof PropertyAdminRecord["content"]>(
    key: K,
    value: PropertyAdminRecord["content"][K]
  ) => void
  patchBrandName: (value: string) => void
  patchBrandMeta: (value: string) => void
  patchHeroTitle: (value: string) => void
  patchHostCaption: (value: string) => void
  siteEditLocale: Ref<HostivLocale>
  getBrandName: () => string
  getBrandMeta: () => string
  getCopyField: (sectionId: string, fieldKey: string) => string
  patchCopySection: (sectionId: string, fieldKey: string, value: string) => void
  getContentList: <K extends LocalizedSiteListKey>(
    key: K
  ) => PropertyAdminRecord["content"][K] | PropertyAdminRecord["content"][`${K}_en`]
  patchContentList: <K extends LocalizedSiteListKey>(
    key: K,
    value: PropertyAdminRecord["content"][K] | PropertyAdminRecord["content"][`${K}_en`]
  ) => void
  getWelcomeGuide: () => PropertyWelcomeGuide
  patchWelcomeGuide: (partial: Partial<PropertyWelcomeGuide>) => void
  saveDraft?: () => Promise<boolean>
  subscriptionAccess: Ref<HostivSubscriptionAccess>
  onPublishedChange: (value: boolean) => void
}

export const adminEditorContextKey: InjectionKey<AdminEditorContext> = Symbol("adminEditorContext")

export function useAdminEditorContext() {
  const context = inject(adminEditorContextKey)

  if (!context) {
    throw new Error("AdminEditorContext manquant — utilisez ce composant dans PropertyAdminEditor.")
  }

  return context
}
