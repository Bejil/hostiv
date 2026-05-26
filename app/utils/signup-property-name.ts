import type { PropertyAdminRecord } from "../types/property-admin"

/** Nom affiché généré automatiquement à partir du slug (fallback onboarding — à éviter). */
export function brandNameFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

/** Vrai si le nom ressemble au titre dérivé du slug (ex. latincaa → Latincaa). */
export function isBrandNameAutoDerivedFromSlug(brandName: string, slug: string): boolean {
  const trimmed = brandName.trim()

  if (!trimmed) {
    return false
  }

  return trimmed === brandNameFromSlug(slug)
}

export function readSignupPropertyName(
  metadata: Record<string, unknown> | undefined
): string {
  const raw = metadata?.property_name

  return typeof raw === "string" ? raw.trim() : ""
}

/** Remplace un nom vide ou dérivé du slug par le nom saisi à l’inscription. */
export function applySignupPropertyNameToRecord(
  record: PropertyAdminRecord,
  signupName: string,
  slug: string
): boolean {
  const name = signupName.trim()

  if (!name) {
    return false
  }

  if (record.brand_name.trim() && !isBrandNameAutoDerivedFromSlug(record.brand_name, slug)) {
    return false
  }

  record.brand_name = name
  const header = record.content.copy.header ?? { brand_name: "", brand_meta: "", logo_alt: "" }

  record.content.copy.header = {
    ...header,
    brand_name: name,
    logo_alt: name
  }

  return true
}
