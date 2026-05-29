import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteRecord } from "../types/property-site"
import { normalizePropertyAdminRecord } from "./normalize-property-admin"

export function adminPreviewStorageKey(slug: string) {
  return `admin-preview:${slug.trim().toLowerCase()}`
}

/** Fusionne le site publié et le brouillon admin avec toutes les sections copy normalisées. */
export function applyAdminPreviewToSite(
  base: PropertySiteRecord,
  draft: PropertyAdminRecord
): PropertySiteRecord {
  const mergedRaw: PropertyAdminRecord = {
    ...base,
    ...draft,
    booking_config: { ...base.booking_config, ...(draft.booking_config ?? {}) },
    location: { ...base.location, ...(draft.location ?? {}) },
    content: {
      ...base.content,
      ...draft.content,
      copy: {
        ...base.content.copy,
        ...(draft.content?.copy ?? {})
      }
    }
  }

  return normalizePropertyAdminRecord(mergedRaw)
}

export function saveAdminPreviewDraft(
  slug: string,
  draft: PropertyAdminRecord,
  baseSite?: PropertySiteRecord | null
) {
  if (typeof sessionStorage === "undefined") {
    return
  }

  try {
    const payload =
      baseSite != null
        ? applyAdminPreviewToSite(baseSite, draft)
        : normalizePropertyAdminRecord(draft)

    sessionStorage.setItem(adminPreviewStorageKey(slug), JSON.stringify(payload))
  } catch {
    /* quota / mode privé */
  }
}

export function loadAdminPreviewDraft(
  slug: string,
  baseSite?: PropertySiteRecord | null
): PropertySiteRecord | null {
  if (typeof sessionStorage === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(adminPreviewStorageKey(slug))

    if (!raw) {
      return null
    }

    const stored = JSON.parse(raw) as PropertySiteRecord

    if (!baseSite) {
      return stored
    }

    return applyAdminPreviewToSite(baseSite, {
      ...baseSite,
      ...stored
    })
  } catch {
    return null
  }
}
