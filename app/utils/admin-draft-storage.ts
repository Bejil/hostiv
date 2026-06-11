import type { PropertyAdminRecord } from "../types/property-admin"
import { normalizePropertyAdminRecord } from "./normalize-property-admin"

type StoredAdminDraft = {
  updatedAt: number
  record: PropertyAdminRecord
}

export function adminDraftStorageKey(slug: string) {
  return `hostiv-admin-draft:${slug.trim().toLowerCase()}`
}

export function saveAdminDraft(slug: string, record: PropertyAdminRecord) {
  if (typeof sessionStorage === "undefined") {
    return
  }

  try {
    const payload: StoredAdminDraft = {
      updatedAt: Date.now(),
      record: normalizePropertyAdminRecord(record)
    }

    sessionStorage.setItem(adminDraftStorageKey(slug), JSON.stringify(payload))
  } catch {
    /* quota / navigation privée */
  }
}

export function loadAdminDraft(slug: string): PropertyAdminRecord | null {
  if (typeof sessionStorage === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(adminDraftStorageKey(slug))

    if (!raw) {
      return null
    }

    const stored = JSON.parse(raw) as StoredAdminDraft

    if (!stored?.record || typeof stored.record !== "object") {
      return null
    }

    return normalizePropertyAdminRecord(stored.record)
  } catch {
    return null
  }
}

export function clearAdminDraft(slug: string) {
  if (typeof sessionStorage === "undefined") {
    return
  }

  sessionStorage.removeItem(adminDraftStorageKey(slug))
}
