import type { PropertySiteRecord } from "../types/property-site"

/** Objet brut sérialisable pour postMessage (évite les proxies Vue / DOMException). */
export function cloneSiteForLivePreviewPostMessage(site: PropertySiteRecord): PropertySiteRecord {
  return JSON.parse(JSON.stringify(site)) as PropertySiteRecord
}

export const ADMIN_LIVE_PREVIEW_MESSAGE = {
  ready: "hostiv-live-preview-ready",
  site: "hostiv-live-preview-site",
  height: "hostiv-live-preview-height"
} as const

export type AdminLivePreviewSiteMessage = {
  type: typeof ADMIN_LIVE_PREVIEW_MESSAGE.site
  site: PropertySiteRecord
  scrollAnchor: string | null
}

export type AdminLivePreviewHeightMessage = {
  type: typeof ADMIN_LIVE_PREVIEW_MESSAGE.height
  height: number
}

export function isAdminLivePreviewSiteMessage(
  data: unknown
): data is AdminLivePreviewSiteMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as AdminLivePreviewSiteMessage).type === ADMIN_LIVE_PREVIEW_MESSAGE.site &&
    typeof (data as AdminLivePreviewSiteMessage).site === "object"
  )
}

export function isAdminLivePreviewHeightMessage(
  data: unknown
): data is AdminLivePreviewHeightMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as AdminLivePreviewHeightMessage).type === ADMIN_LIVE_PREVIEW_MESSAGE.height &&
    typeof (data as AdminLivePreviewHeightMessage).height === "number"
  )
}
