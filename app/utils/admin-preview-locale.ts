import type { HostivLocale } from "../types/hostiv-locale"

export function readAdminPreviewLocale(value: unknown): HostivLocale {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()

  return normalized === "en" ? "en" : "fr"
}
