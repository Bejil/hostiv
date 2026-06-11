import type { PropertyAdminRecord } from "../types/property-admin"

export const ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE = {
  ready: "hostiv-welcome-guide-preview-ready",
  guide: "hostiv-welcome-guide-preview-guide"
} as const

export type WelcomeGuidePreviewPageId =
  | "page-1"
  | "page-2"
  | "page-3"
  | "page-4"
  | "page-5"
  | "page-6"
  | "page-7"

export type AdminWelcomeGuidePreviewGuideMessage = {
  type: ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE.guide
  record: PropertyAdminRecord
  supabaseUrl: string
  scrollPage: WelcomeGuidePreviewPageId | null
  assetRevision: number
  /** Incrémenté à chaque push iframe — invalide le cache même si le chemin Storage est inchangé. */
  previewNonce: number
}

export function cloneRecordForWelcomeGuidePreview(record: PropertyAdminRecord): PropertyAdminRecord {
  return JSON.parse(JSON.stringify(record)) as PropertyAdminRecord
}

export function isAdminWelcomeGuidePreviewGuideMessage(
  data: unknown
): data is AdminWelcomeGuidePreviewGuideMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as AdminWelcomeGuidePreviewGuideMessage).type ===
      ADMIN_WELCOME_GUIDE_PREVIEW_MESSAGE.guide &&
    typeof (data as AdminWelcomeGuidePreviewGuideMessage).record === "object" &&
    typeof (data as AdminWelcomeGuidePreviewGuideMessage).assetRevision === "number" &&
    typeof (data as AdminWelcomeGuidePreviewGuideMessage).previewNonce === "number"
  )
}

export function welcomeGuidePreviewScrollSelector(page: WelcomeGuidePreviewPageId | null) {
  if (page === "page-7") {
    return ".wg-checkout"
  }

  if (page === "page-5") {
    return ".wg-places"
  }

  if (page === "page-6") {
    return ".wg-dining"
  }

  if (page === "page-4") {
    return ".wg-emergency"
  }

  if (page === "page-3") {
    return ".wg-rules"
  }

  if (page === "page-2") {
    return ".wg-welcome"
  }

  if (page === "page-1") {
    return ".wg-cover"
  }

  return null
}
