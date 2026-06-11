import type { HostivLocale } from "../types/hostiv-locale"

export const HOSTIV_LOCALE_STORAGE_KEY = "hostiv:locale"

export function readStoredHostivLocale(): HostivLocale | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(HOSTIV_LOCALE_STORAGE_KEY)

    if (raw === "fr" || raw === "en") {
      return raw
    }
  } catch {
    // ignore
  }

  return null
}

export function writeStoredHostivLocale(locale: HostivLocale) {
  if (!import.meta.client) {
    return
  }

  try {
    localStorage.setItem(HOSTIV_LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore
  }
}
